package com.leftoverlift.listing;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.listing.dto.ListingRequest;
import com.leftoverlift.listing.dto.ListingResponse;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-11T12:00:00Z");

    @Mock ListingRepository listings;
    @Mock VendorProfileRepository vendors;

    ListingService service;
    User owner;
    VendorProfile vendor;

    @BeforeEach
    void setUp() {
        service = new ListingService(listings, vendors, Clock.fixed(NOW, ZoneOffset.UTC));

        owner = new User();
        owner.setId(UUID.randomUUID());
        vendor = new VendorProfile();
        vendor.setId(UUID.randomUUID());
        vendor.setUser(owner);
        vendor.setBusinessName("Crumb & Co.");
        vendor.setBusinessType(BusinessType.BAKERY);
        vendor.setAddress("12 Elm Street");
        vendor.setCity("Pune");

        lenient().when(vendors.findByUserId(owner.getId())).thenReturn(Optional.of(vendor));
        lenient().when(listings.save(any(Listing.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private ListingRequest request(String original, String rescue, int quantity, Instant start, Instant end) {
        return new ListingRequest("Pastry bag", "Five pieces", ListingCategory.BAKERY, Set.of(DietaryTag.VEGETARIAN),
                new BigDecimal(original), new BigDecimal(rescue), quantity, start, end);
    }

    private ListingRequest validRequest() {
        return request("400.00", "100.00", 5, NOW, NOW.plus(Duration.ofHours(3)));
    }

    private Listing existing(int total, int remaining) {
        Listing l = new Listing();
        l.setId(UUID.randomUUID());
        l.setVendor(vendor);
        l.setTitle("Old");
        l.setDescription("Old");
        l.setCategory(ListingCategory.BAKERY);
        l.setOriginalPrice(new BigDecimal("400.00"));
        l.setRescuePrice(new BigDecimal("100.00"));
        l.setQuantityTotal(total);
        l.setQuantityRemaining(remaining);
        l.setPickupStart(NOW);
        l.setPickupEnd(NOW.plus(Duration.ofHours(3)));
        l.setStatus(ListingStatus.AVAILABLE);
        return l;
    }

    @Test
    void createCalculatesTheDiscountFromThePricesAndStartsFullyStocked() {
        ListingResponse res = service.create(owner, validRequest());

        assertThat(res.discountPercent()).isEqualTo(75);
        assertThat(res.savings()).isEqualByComparingTo("300.00");
        assertThat(res.quantityRemaining()).isEqualTo(5);
        assertThat(res.status()).isEqualTo(ListingStatus.AVAILABLE);
        assertThat(res.vendor().businessName()).isEqualTo("Crumb & Co.");
    }

    @Test
    void rescuePriceMustBeBelowTheUsualPrice() {
        assertThatThrownBy(() -> service.create(owner, request("100.00", "100.00", 5, NOW, NOW.plus(Duration.ofHours(2)))))
                .hasFieldOrPropertyWithValue("code", "RESCUE_PRICE_TOO_HIGH");
    }

    @Test
    void pickupWindowRules() {
        assertThatThrownBy(() -> service.create(owner, request("400", "100", 5, NOW.minus(Duration.ofHours(3)), NOW.minus(Duration.ofHours(1)))))
                .hasFieldOrPropertyWithValue("code", "WINDOW_IN_PAST");
        assertThatThrownBy(() -> service.create(owner, request("400", "100", 5, NOW.plus(Duration.ofHours(2)), NOW.plus(Duration.ofHours(1)))))
                .hasFieldOrPropertyWithValue("code", "INVALID_WINDOW");
        assertThatThrownBy(() -> service.create(owner, request("400", "100", 5, NOW, NOW.plus(Duration.ofMinutes(5)))))
                .hasFieldOrPropertyWithValue("code", "WINDOW_TOO_SHORT");
        assertThatThrownBy(() -> service.create(owner, request("400", "100", 5, NOW, NOW.plus(Duration.ofHours(100)))))
                .hasFieldOrPropertyWithValue("code", "WINDOW_TOO_FAR");
    }

    @Test
    void aUserWithoutABusinessProfileCannotPost() {
        User stranger = new User();
        stranger.setId(UUID.randomUUID());
        lenient().when(vendors.findByUserId(stranger.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(stranger, validRequest()))
                .hasFieldOrPropertyWithValue("code", "VENDOR_PROFILE_MISSING");
    }

    @Test
    void anotherVendorsListingLooksLikeItDoesNotExist() {
        Listing someoneElses = existing(5, 5);
        VendorProfile other = new VendorProfile();
        other.setId(UUID.randomUUID());
        someoneElses.setVendor(other);
        when(listings.findWithVendorById(someoneElses.getId())).thenReturn(Optional.of(someoneElses));

        assertThatThrownBy(() -> service.update(owner, someoneElses.getId(), validRequest()))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("code", "LISTING_NOT_FOUND");
    }

    @Test
    void updateRecalculatesTheDiscountAndKeepsReservedPortions() {
        Listing l = existing(5, 3); // 2 already reserved
        when(listings.findWithVendorById(l.getId())).thenReturn(Optional.of(l));

        // prices stay the same: they are locked once anything is reserved, quantity may still grow
        ListingResponse res = service.update(owner, l.getId(), request("400.00", "100.00", 8, NOW, NOW.plus(Duration.ofHours(4))));

        assertThat(res.quantityTotal()).isEqualTo(8);
        assertThat(res.quantityRemaining()).isEqualTo(6); // 8 total minus 2 reserved
        assertThat(res.discountPercent()).isEqualTo(75);
    }

    @Test
    void pricesAreLockedOnceSomeoneHasReserved() {
        Listing l = existing(5, 4);
        when(listings.findWithVendorById(l.getId())).thenReturn(Optional.of(l));

        assertThatThrownBy(() -> service.update(owner, l.getId(), request("400.00", "150.00", 5, NOW, NOW.plus(Duration.ofHours(4)))))
                .hasFieldOrPropertyWithValue("code", "PRICE_LOCKED");
    }

    @Test
    void cannotOfferFewerPortionsThanAreReserved() {
        Listing l = existing(5, 1); // 4 reserved
        when(listings.findWithVendorById(l.getId())).thenReturn(Optional.of(l));

        assertThatThrownBy(() -> service.update(owner, l.getId(), request("400.00", "100.00", 3, NOW, NOW.plus(Duration.ofHours(4)))))
                .hasFieldOrPropertyWithValue("code", "QUANTITY_BELOW_RESERVED");
    }

    @Test
    void cancelEndsTheListingAndCannotBeRepeated() {
        Listing l = existing(5, 5);
        when(listings.findWithVendorById(l.getId())).thenReturn(Optional.of(l));

        assertThat(service.cancel(owner, l.getId()).status()).isEqualTo(ListingStatus.CANCELLED);
        assertThatThrownBy(() -> service.cancel(owner, l.getId()))
                .hasFieldOrPropertyWithValue("code", "LISTING_NOT_CANCELLABLE");
    }

    @Test
    void publicDetailHidesEndedListings() {
        Listing l = existing(5, 5);
        l.setPickupEnd(NOW.minusSeconds(1));
        when(listings.findWithVendorById(l.getId())).thenReturn(Optional.of(l));

        assertThatThrownBy(() -> service.getPublic(l.getId()))
                .hasFieldOrPropertyWithValue("code", "LISTING_NOT_FOUND");
    }
}
