package com.leftoverlift.reservation;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.Listing;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.dto.ReservationResponse;
import com.leftoverlift.reservation.dto.VendorReservationResponse;
import com.leftoverlift.reservation.dto.VendorStatsResponse;
import com.leftoverlift.user.User;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    public static final int MAX_PER_RESERVATION = 3;
    private static final int CODE_ATTEMPTS = 8;

    private final ReservationRepository reservations;
    private final ListingRepository listings;
    private final VendorProfileRepository vendors;
    private final Clock clock;

    public ReservationService(ReservationRepository reservations, ListingRepository listings,
                              VendorProfileRepository vendors, Clock clock) {
        this.reservations = reservations;
        this.listings = listings;
        this.vendors = vendors;
        this.clock = clock;
    }

    // ------------------------------------------------------------------ customer

    /**
     * Reserves portions. The cheap checks come first for friendly messages, but the one that decides
     * is claimPortions: a single atomic UPDATE that can only succeed while enough portions remain.
     * If anything after it fails, the whole transaction rolls back and the portions return to the shelf.
     */
    @Transactional
    public ReservationResponse reserve(User customer, UUID listingId, int quantity) {
        if (quantity < 1 || quantity > MAX_PER_RESERVATION) {
            throw ApiException.badRequest("INVALID_QUANTITY", "You can reserve between 1 and " + MAX_PER_RESERVATION + " portions at a time.");
        }
        Listing listing = listings.findWithVendorById(listingId).orElseThrow(() ->
                ApiException.notFound("LISTING_NOT_FOUND", "We couldn't find that listing."));

        if (listing.getStatus() != ListingStatus.AVAILABLE || !listing.getPickupEnd().isAfter(clock.instant())) {
            throw ApiException.conflict("LISTING_UNAVAILABLE", "Sorry, this food is no longer available.");
        }
        if (reservations.existsByListingIdAndCustomerIdAndStatus(listingId, customer.getId(), ReservationStatus.RESERVED)) {
            throw ApiException.conflict("ALREADY_RESERVED", "You already have a reservation for this. Find it under My rescues.");
        }

        if (listings.claimPortions(listingId, quantity) == 0) {
            throw ApiException.conflict("NOT_ENOUGH_PORTIONS", "Someone just claimed that. Try fewer portions or pick something else.");
        }
        listings.markSoldOutIfEmpty(listingId);

        Reservation reservation = new Reservation();
        reservation.setListing(listing);
        reservation.setCustomer(customer);
        reservation.setQuantity(quantity);
        reservation.setUnitPrice(listing.getRescuePrice());
        reservation.setTotalPrice(listing.getRescuePrice().multiply(BigDecimal.valueOf(quantity)));
        reservation.setPickupCode(uniqueCode());
        reservation.setStatus(ReservationStatus.RESERVED);
        return ReservationResponse.from(reservations.save(reservation));
    }

    @Transactional
    public ReservationResponse cancel(User customer, UUID id) {
        Reservation reservation = reservations.findWithListingById(id)
                .filter(r -> r.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(ReservationService::notFound);

        if (reservation.getStatus() != ReservationStatus.RESERVED) {
            throw ApiException.conflict("RESERVATION_NOT_CANCELLABLE", "This reservation can no longer be cancelled.");
        }
        Instant now = clock.instant();
        if (!reservation.getListing().getPickupEnd().isAfter(now)) {
            throw ApiException.conflict("PICKUP_WINDOW_ENDED", "The pickup window has already ended.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(now);
        UUID listingId = reservation.getListing().getId();
        listings.releasePortions(listingId, reservation.getQuantity());
        listings.reopenIfStocked(listingId);
        return ReservationResponse.from(reservation);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> mine(User customer, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50),
                Sort.by(Sort.Order.desc("createdAt")));
        return PageResponse.of(reservations.findByCustomerId(customer.getId(), pageable).map(ReservationResponse::from));
    }

    @Transactional(readOnly = true)
    public ReservationResponse getMine(User customer, UUID id) {
        return reservations.findWithListingById(id)
                .filter(r -> r.getCustomer().getId().equals(customer.getId()))
                .map(ReservationResponse::from)
                .orElseThrow(ReservationService::notFound);
    }

    // ------------------------------------------------------------------ vendor

    /** The pickup desk: the customer reads out their code and the business confirms the handover. */
    @Transactional
    public VendorReservationResponse collect(User vendorUser, String rawCode) {
        VendorProfile vendor = vendorOf(vendorUser);
        String code = PickupCodes.normalize(rawCode);

        Reservation reservation = reservations.findForVendorByCode(code, vendor.getId()).orElseThrow(() ->
                ApiException.notFound("CODE_NOT_FOUND", "No reservation at your business matches that code."));

        switch (reservation.getStatus()) {
            case COLLECTED -> throw ApiException.conflict("ALREADY_COLLECTED", "That order has already been collected.");
            case CANCELLED -> throw ApiException.conflict("RESERVATION_NOT_ACTIVE", "That reservation was cancelled.");
            case EXPIRED -> throw ApiException.conflict("RESERVATION_NOT_ACTIVE", "That reservation expired before pickup.");
            case RESERVED -> { /* fine */ }
        }
        reservation.setStatus(ReservationStatus.COLLECTED);
        reservation.setCollectedAt(clock.instant());
        return VendorReservationResponse.from(reservation);
    }

    @Transactional(readOnly = true)
    public List<VendorReservationResponse> waiting(User vendorUser) {
        VendorProfile vendor = vendorOf(vendorUser);
        return reservations.findForVendorByStatus(vendor.getId(), ReservationStatus.RESERVED, PageRequest.of(0, 100))
                .stream().map(VendorReservationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public VendorStatsResponse stats(User vendorUser) {
        VendorProfile vendor = vendorOf(vendorUser);
        Long portions = reservations.sumQuantityForVendor(vendor.getId(), ReservationStatus.COLLECTED);
        BigDecimal revenue = reservations.sumRevenueForVendor(vendor.getId(), ReservationStatus.COLLECTED);
        return new VendorStatsResponse(
                portions == null ? 0 : portions,
                revenue == null ? BigDecimal.ZERO : revenue,
                reservations.countForVendor(vendor.getId(), ReservationStatus.COLLECTED),
                reservations.countForVendor(vendor.getId(), ReservationStatus.RESERVED),
                listings.countByVendorId(vendor.getId()));
    }

    // ------------------------------------------------------------------ helpers

    private VendorProfile vendorOf(User user) {
        return vendors.findByUserId(user.getId()).orElseThrow(() ->
                ApiException.badRequest("VENDOR_PROFILE_MISSING", "Add your business details first."));
    }

    private String uniqueCode() {
        for (int i = 0; i < CODE_ATTEMPTS; i++) {
            String code = PickupCodes.generate();
            if (!reservations.existsByPickupCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate a unique pickup code");
    }

    private static ApiException notFound() {
        return ApiException.notFound("RESERVATION_NOT_FOUND", "We couldn't find that reservation.");
    }
}
