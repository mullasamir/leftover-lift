package com.leftoverlift.listing;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.dto.ListingRequest;
import com.leftoverlift.listing.dto.ListingResponse;
import com.leftoverlift.reservation.ReservationRepository;
import com.leftoverlift.user.User;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

@Service
public class ListingService {

    private static final Duration MIN_WINDOW = Duration.ofMinutes(15);
    private static final Duration MAX_LEAD = Duration.ofHours(72);
    private static final int MAX_PAGE_SIZE = 50;

    private final ListingRepository listings;
    private final VendorProfileRepository vendors;
    private final ReservationRepository reservations;
    private final Clock clock;

    public ListingService(ListingRepository listings, VendorProfileRepository vendors,
                          ReservationRepository reservations, Clock clock) {
        this.listings = listings;
        this.vendors = vendors;
        this.reservations = reservations;
        this.clock = clock;
    }

    // ------------------------------------------------------------------ vendor side

    @Transactional
    public ListingResponse create(User user, ListingRequest req) {
        VendorProfile vendor = vendorOf(user);
        validate(req);

        Listing listing = new Listing();
        listing.setVendor(vendor);
        apply(listing, req);
        listing.setQuantityRemaining(req.quantity());
        listing.setStatus(ListingStatus.AVAILABLE);
        return ListingResponse.from(listings.save(listing));
    }

    @Transactional
    public ListingResponse update(User user, UUID id, ListingRequest req) {
        Listing listing = owned(user, id);
        if (listing.getStatus() != ListingStatus.AVAILABLE && listing.getStatus() != ListingStatus.SOLD_OUT) {
            throw ApiException.conflict("LISTING_NOT_EDITABLE", "This listing has ended, so it can't be edited. Post a new one instead.");
        }
        validate(req);

        int reserved = listing.getQuantityTotal() - listing.getQuantityRemaining();
        if (req.quantity() < reserved) {
            throw ApiException.conflict("QUANTITY_BELOW_RESERVED",
                    reserved + " portions are already reserved, so you can't offer fewer than that.");
        }
        boolean pricesChanged = scaled(req.originalPrice()).compareTo(listing.getOriginalPrice()) != 0
                || scaled(req.rescuePrice()).compareTo(listing.getRescuePrice()) != 0;
        if (reserved > 0 && pricesChanged) {
            throw ApiException.conflict("PRICE_LOCKED", "Prices can't change once someone has reserved a portion.");
        }

        apply(listing, req);
        listing.setQuantityRemaining(req.quantity() - reserved);
        listing.setStatus(listing.getQuantityRemaining() > 0 ? ListingStatus.AVAILABLE : ListingStatus.SOLD_OUT);
        return ListingResponse.from(listing);
    }

    @Transactional
    public ListingResponse cancel(User user, UUID id) {
        Listing listing = owned(user, id);
        if (listing.getStatus() != ListingStatus.AVAILABLE && listing.getStatus() != ListingStatus.SOLD_OUT) {
            throw ApiException.conflict("LISTING_NOT_CANCELLABLE", "This listing has already ended.");
        }
        listing.setStatus(ListingStatus.CANCELLED);
        reservations.cancelActiveForListing(listing.getId()); // nobody is left holding food that is no longer offered
        return ListingResponse.from(listing);
    }

    @Transactional(readOnly = true)
    public ListingResponse getOwned(User user, UUID id) {
        return ListingResponse.from(owned(user, id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> mine(User user, int page, int size) {
        VendorProfile vendor = vendorOf(user);
        Pageable pageable = PageRequest.of(Math.max(0, page), clampSize(size), Sort.by(Sort.Order.desc("createdAt")));
        return PageResponse.of(listings.findByVendorId(vendor.getId(), pageable).map(ListingResponse::from));
    }

    // ------------------------------------------------------------------ admin side

    /** Every listing on the platform, any status, for the owner's overview. */
    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> adminSearch(ListingStatus status, String q, int page, int size) {
        Specification<Listing> spec = (root, query, cb) -> cb.conjunction();
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (hasText(q)) {
            spec = spec.and(ListingSpecs.text(q.trim()));
        }
        Pageable pageable = PageRequest.of(Math.max(0, page), clampSize(size), Sort.by(Sort.Order.desc("createdAt")));
        return PageResponse.of(listings.findAll(spec, pageable).map(ListingResponse::from));
    }

    /** The owner can take down any listing, for example one that breaks the rules. Reservations on it are released. */
    @Transactional
    public ListingResponse adminCancel(UUID id) {
        Listing listing = listings.findWithVendorById(id).orElseThrow(ListingService::notFound);
        if (listing.getStatus() != ListingStatus.AVAILABLE && listing.getStatus() != ListingStatus.SOLD_OUT) {
            throw ApiException.conflict("LISTING_NOT_CANCELLABLE", "This listing has already ended.");
        }
        listing.setStatus(ListingStatus.CANCELLED);
        reservations.cancelActiveForListing(listing.getId());
        return ListingResponse.from(listing);
    }

    // ------------------------------------------------------------------ public side

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> search(ListingSearch search) {
        Specification<Listing> spec = ListingSpecs.visible(clock.instant());
        if (search.category() != null) {
            spec = spec.and(ListingSpecs.category(search.category()));
        }
        if (hasText(search.city())) {
            spec = spec.and(ListingSpecs.city(search.city().trim()));
        }
        if (search.minDiscount() != null && search.minDiscount() > 0) {
            spec = spec.and(ListingSpecs.minDiscount(search.minDiscount()));
        }
        if (hasText(search.q())) {
            spec = spec.and(ListingSpecs.text(search.q().trim()));
        }

        Pageable pageable = PageRequest.of(Math.max(0, search.page()), clampSize(search.size()), sortFor(search.sort()));
        return PageResponse.of(listings.findAll(spec, pageable).map(ListingResponse::from));
    }

    @Transactional(readOnly = true)
    public ListingResponse getPublic(UUID id) {
        Listing listing = listings.findWithVendorById(id).orElseThrow(ListingService::notFound);
        boolean visible = listing.getStatus() == ListingStatus.AVAILABLE
                && listing.getQuantityRemaining() > 0
                && listing.getPickupEnd().isAfter(clock.instant());
        if (!visible) {
            throw notFound();
        }
        return ListingResponse.from(listing);
    }

    // ------------------------------------------------------------------ helpers

    private VendorProfile vendorOf(User user) {
        return vendors.findByUserId(user.getId()).orElseThrow(() ->
                ApiException.badRequest("VENDOR_PROFILE_MISSING", "Add your business details before posting food."));
    }

    /** Someone else's listing looks exactly like one that doesn't exist, so ids can't be probed. */
    private Listing owned(User user, UUID id) {
        VendorProfile vendor = vendorOf(user);
        Listing listing = listings.findWithVendorById(id).orElseThrow(ListingService::notFound);
        if (!listing.getVendor().getId().equals(vendor.getId())) {
            throw notFound();
        }
        return listing;
    }

    private void validate(ListingRequest req) {
        BigDecimal original = scaled(req.originalPrice());
        BigDecimal rescue = scaled(req.rescuePrice());
        if (rescue.compareTo(original) >= 0) {
            throw ApiException.badRequest("RESCUE_PRICE_TOO_HIGH", "The rescue price must be lower than the usual price.");
        }

        Instant now = clock.instant();
        if (!req.pickupEnd().isAfter(req.pickupStart())) {
            throw ApiException.badRequest("INVALID_WINDOW", "Pickup must end after it starts.");
        }
        if (!req.pickupEnd().isAfter(now)) {
            throw ApiException.badRequest("WINDOW_IN_PAST", "The pickup window has already ended. Choose a later time.");
        }
        if (Duration.between(req.pickupStart(), req.pickupEnd()).compareTo(MIN_WINDOW) < 0) {
            throw ApiException.badRequest("WINDOW_TOO_SHORT", "Give people at least 15 minutes to collect.");
        }
        if (req.pickupEnd().isAfter(now.plus(MAX_LEAD))) {
            throw ApiException.badRequest("WINDOW_TOO_FAR", "Surplus food should go out soon. Pickup must end within 3 days.");
        }
    }

    private void apply(Listing listing, ListingRequest req) {
        listing.setTitle(req.title().trim());
        listing.setDescription(req.description().trim());
        listing.setCategory(req.category());

        Set<DietaryTag> tags = EnumSet.noneOf(DietaryTag.class);
        if (req.dietaryTags() != null) {
            tags.addAll(req.dietaryTags());
        }
        listing.setDietaryTags(tags);

        listing.setOriginalPrice(scaled(req.originalPrice()));
        listing.setRescuePrice(scaled(req.rescuePrice()));
        listing.recalculate(); // the percentage always follows the prices

        listing.setQuantityTotal(req.quantity());
        listing.setPickupStart(req.pickupStart());
        listing.setPickupEnd(req.pickupEnd());
    }

    private static BigDecimal scaled(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private static Sort sortFor(ListingSort sort) {
        return switch (sort == null ? ListingSort.CLOSING : sort) {
            case CLOSING -> Sort.by(Sort.Order.asc("pickupEnd"));
            case CHEAPEST -> Sort.by(Sort.Order.asc("rescuePrice"), Sort.Order.asc("pickupEnd"));
            case DEAL -> Sort.by(Sort.Order.desc("discountPercent"), Sort.Order.asc("pickupEnd"));
            case NEWEST -> Sort.by(Sort.Order.desc("createdAt"));
        };
    }

    private static int clampSize(int size) {
        return Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static ApiException notFound() {
        return ApiException.notFound("LISTING_NOT_FOUND", "We couldn't find that listing.");
    }
}
