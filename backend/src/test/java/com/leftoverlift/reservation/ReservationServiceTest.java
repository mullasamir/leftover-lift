package com.leftoverlift.reservation;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.listing.Listing;
import com.leftoverlift.listing.ListingCategory;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.dto.AdminReservationResponse;
import com.leftoverlift.reservation.dto.ReservationResponse;
import com.leftoverlift.reservation.dto.VendorReservationResponse;
import com.leftoverlift.reservation.dto.VendorStatsResponse;
import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.User;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-11T12:00:00Z");

    @Mock ReservationRepository reservations;
    @Mock ListingRepository listings;
    @Mock VendorProfileRepository vendors;

    ReservationService service;
    User customer;
    User vendorUser;
    VendorProfile vendor;
    Listing listing;

    @BeforeEach
    void setUp() {
        service = new ReservationService(reservations, listings, vendors, Clock.fixed(NOW, ZoneOffset.UTC));

        customer = new User();
        customer.setId(UUID.randomUUID());
        customer.setFullName("Asha Rao");

        vendorUser = new User();
        vendorUser.setId(UUID.randomUUID());
        vendor = new VendorProfile();
        vendor.setId(UUID.randomUUID());
        vendor.setUser(vendorUser);
        vendor.setBusinessName("Crumb & Co.");
        vendor.setBusinessType(BusinessType.BAKERY);
        vendor.setAddress("12 Elm Street");
        vendor.setCity("Pune");
        lenient().when(vendors.findByUserId(vendorUser.getId())).thenReturn(Optional.of(vendor));

        listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setVendor(vendor);
        listing.setTitle("Pastry bag");
        listing.setCategory(ListingCategory.BAKERY);
        listing.setOriginalPrice(new BigDecimal("380.00"));
        listing.setRescuePrice(new BigDecimal("99.00"));
        listing.setQuantityTotal(5);
        listing.setQuantityRemaining(5);
        listing.setPickupStart(NOW.minus(Duration.ofHours(1)));
        listing.setPickupEnd(NOW.plus(Duration.ofHours(2)));
        listing.setStatus(ListingStatus.AVAILABLE);
        lenient().when(listings.findWithVendorById(listing.getId())).thenReturn(Optional.of(listing));
        lenient().when(reservations.save(any(Reservation.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Reservation reserved(ReservationStatus status) {
        Reservation r = new Reservation();
        r.setId(UUID.randomUUID());
        r.setListing(listing);
        r.setCustomer(customer);
        r.setQuantity(2);
        r.setUnitPrice(new BigDecimal("99.00"));
        r.setTotalPrice(new BigDecimal("198.00"));
        r.setPickupCode("K7QX2M");
        r.setStatus(status);
        return r;
    }

    // ---------------------------------------------------------------- reserve

    @Test
    void reservingTakesPortionsAndReturnsACodeAndATotal() {
        when(listings.claimPortions(listing.getId(), 2)).thenReturn(1);

        ReservationResponse res = service.reserve(customer, listing.getId(), 2);

        assertThat(res.status()).isEqualTo(ReservationStatus.RESERVED);
        assertThat(res.totalPrice()).isEqualByComparingTo("198.00");
        assertThat(res.pickupCode()).hasSize(PickupCodes.LENGTH);
        assertThat(res.listing().businessName()).isEqualTo("Crumb & Co.");
        verify(listings).markSoldOutIfEmpty(listing.getId());
    }

    @Test
    void whenTheAtomicClaimFindsNothingLeftNoReservationIsCreated() {
        when(listings.claimPortions(listing.getId(), 1)).thenReturn(0); // someone else got the last one first

        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 1))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("code", "NOT_ENOUGH_PORTIONS");
        verify(reservations, never()).save(any());
    }

    @Test
    void quantityMustBeBetweenOneAndThree() {
        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 0)).hasFieldOrPropertyWithValue("code", "INVALID_QUANTITY");
        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 4)).hasFieldOrPropertyWithValue("code", "INVALID_QUANTITY");
    }

    @Test
    void cannotReserveFoodThatHasEndedOrBeenCancelled() {
        listing.setPickupEnd(NOW.minusSeconds(1));
        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 1)).hasFieldOrPropertyWithValue("code", "LISTING_UNAVAILABLE");

        listing.setPickupEnd(NOW.plus(Duration.ofHours(1)));
        listing.setStatus(ListingStatus.CANCELLED);
        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 1)).hasFieldOrPropertyWithValue("code", "LISTING_UNAVAILABLE");
        verify(listings, never()).claimPortions(any(), org.mockito.ArgumentMatchers.anyInt());
    }

    @Test
    void oneCustomerCannotHoldTheSameFoodTwice() {
        when(reservations.existsByListingIdAndCustomerIdAndStatus(listing.getId(), customer.getId(), ReservationStatus.RESERVED)).thenReturn(true);

        assertThatThrownBy(() -> service.reserve(customer, listing.getId(), 1)).hasFieldOrPropertyWithValue("code", "ALREADY_RESERVED");
        verify(listings, never()).claimPortions(any(), org.mockito.ArgumentMatchers.anyInt());
    }

    // ---------------------------------------------------------------- cancel

    @Test
    void cancellingPutsThePortionsBackAndReopensTheListing() {
        Reservation r = reserved(ReservationStatus.RESERVED);
        when(reservations.findWithListingById(r.getId())).thenReturn(Optional.of(r));

        ReservationResponse res = service.cancel(customer, r.getId());

        assertThat(res.status()).isEqualTo(ReservationStatus.CANCELLED);
        verify(listings).releasePortions(listing.getId(), 2);
        verify(listings).reopenIfStocked(listing.getId());
    }

    @Test
    void anotherCustomersReservationLooksLikeItDoesNotExist() {
        Reservation r = reserved(ReservationStatus.RESERVED);
        when(reservations.findWithListingById(r.getId())).thenReturn(Optional.of(r));
        User stranger = new User();
        stranger.setId(UUID.randomUUID());

        assertThatThrownBy(() -> service.cancel(stranger, r.getId())).hasFieldOrPropertyWithValue("code", "RESERVATION_NOT_FOUND");
    }

    @Test
    void collectedOrAlreadyCancelledReservationsCannotBeCancelled() {
        Reservation collected = reserved(ReservationStatus.COLLECTED);
        when(reservations.findWithListingById(collected.getId())).thenReturn(Optional.of(collected));

        assertThatThrownBy(() -> service.cancel(customer, collected.getId())).hasFieldOrPropertyWithValue("code", "RESERVATION_NOT_CANCELLABLE");
        verify(listings, never()).releasePortions(any(), org.mockito.ArgumentMatchers.anyInt());
    }

    // ---------------------------------------------------------------- vendor pickup desk

    @Test
    void theVendorConfirmsPickupWithTheCodeEvenIfTypedLoosely() {
        Reservation r = reserved(ReservationStatus.RESERVED);
        when(reservations.findForVendorByCode("K7QX2M", vendor.getId())).thenReturn(Optional.of(r));

        VendorReservationResponse res = service.collect(vendorUser, " k7q-x2m ");

        assertThat(res.status()).isEqualTo(ReservationStatus.COLLECTED);
        assertThat(res.customerName()).isEqualTo("Asha R.");
        assertThat(r.getCollectedAt()).isEqualTo(NOW);
    }

    @Test
    void wrongOrRepeatedCodesAreRefused() {
        when(reservations.findForVendorByCode("NOPE22", vendor.getId())).thenReturn(Optional.empty());
        Reservation done = reserved(ReservationStatus.COLLECTED);
        when(reservations.findForVendorByCode("K7QX2M", vendor.getId())).thenReturn(Optional.of(done));

        assertThatThrownBy(() -> service.collect(vendorUser, "nope22")).hasFieldOrPropertyWithValue("code", "CODE_NOT_FOUND");
        assertThatThrownBy(() -> service.collect(vendorUser, "K7QX2M")).hasFieldOrPropertyWithValue("code", "ALREADY_COLLECTED");
    }

    @Test
    void vendorStatsTreatMissingTotalsAsZero() {
        when(reservations.sumQuantityForVendor(vendor.getId(), ReservationStatus.COLLECTED)).thenReturn(null);
        when(reservations.sumRevenueForVendor(vendor.getId(), ReservationStatus.COLLECTED)).thenReturn(null);
        when(listings.countByVendorId(vendor.getId())).thenReturn(4L);

        VendorStatsResponse stats = service.stats(vendorUser);

        assertThat(stats.portionsRescued()).isZero();
        assertThat(stats.revenueRecovered()).isEqualByComparingTo("0");
        assertThat(stats.listingsPosted()).isEqualTo(4);
    }

    @Test
    void vendorStatsAddUpWhatWasCollected() {
        when(reservations.sumQuantityForVendor(vendor.getId(), ReservationStatus.COLLECTED)).thenReturn(18L);
        when(reservations.sumRevenueForVendor(vendor.getId(), ReservationStatus.COLLECTED)).thenReturn(new BigDecimal("1782.00"));
        when(reservations.countForVendor(vendor.getId(), ReservationStatus.COLLECTED)).thenReturn(9L);
        when(reservations.countForVendor(vendor.getId(), ReservationStatus.RESERVED)).thenReturn(2L);

        VendorStatsResponse stats = service.stats(vendorUser);

        assertThat(stats.portionsRescued()).isEqualTo(18);
        assertThat(stats.revenueRecovered()).isEqualByComparingTo("1782.00");
        assertThat(stats.handovers()).isEqualTo(9);
        assertThat(stats.waiting()).isEqualTo(2);
    }

    // ---------------------------------------------------------------- owner overrides

    @Test
    void theOwnerCanCancelAReservationAndPortionsReturn() {
        customer.setEmail("asha@example.com");
        Reservation r = reserved(ReservationStatus.RESERVED);
        when(reservations.findWithListingById(r.getId())).thenReturn(Optional.of(r));

        AdminReservationResponse res = service.adminCancel(r.getId());

        assertThat(res.status()).isEqualTo(ReservationStatus.CANCELLED);
        assertThat(res.customerEmail()).isEqualTo("asha@example.com");
        verify(listings).releasePortions(listing.getId(), 2);
        verify(listings).reopenIfStocked(listing.getId());
    }

    @Test
    void theOwnerCanMarkAWaitingReservationAsCollectedButNotTwice() {
        customer.setEmail("asha@example.com");
        Reservation r = reserved(ReservationStatus.RESERVED);
        when(reservations.findWithListingById(r.getId())).thenReturn(Optional.of(r));

        assertThat(service.adminCollect(r.getId()).status()).isEqualTo(ReservationStatus.COLLECTED);
        assertThatThrownBy(() -> service.adminCollect(r.getId())).hasFieldOrPropertyWithValue("code", "RESERVATION_NOT_ACTIVE");
    }

    @Test
    void ownerOverridesRefuseReservationsThatAreNotWaiting() {
        Reservation done = reserved(ReservationStatus.CANCELLED);
        when(reservations.findWithListingById(done.getId())).thenReturn(Optional.of(done));

        assertThatThrownBy(() -> service.adminCancel(done.getId())).hasFieldOrPropertyWithValue("code", "RESERVATION_NOT_CANCELLABLE");
        verify(listings, never()).releasePortions(any(), org.mockito.ArgumentMatchers.anyInt());
    }
}
