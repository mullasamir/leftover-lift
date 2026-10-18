package com.leftoverlift.admin;

import com.leftoverlift.admin.dto.AdminStatsResponse;
import com.leftoverlift.admin.dto.AdminVendorResponse;
import com.leftoverlift.auth.RefreshTokenService;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.contact.ContactMessageRepository;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingService;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.ReservationRepository;
import com.leftoverlift.reservation.ReservationService;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.UserRepository;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock UserRepository users;
    @Mock ListingRepository listings;
    @Mock ReservationRepository reservations;
    @Mock RefreshTokenService refreshTokens;
    @Mock ContactMessageRepository contactMessages;
    @Mock VendorProfileRepository vendors;
    @Mock ListingService listingService;
    @Mock ReservationService reservationService;

    AdminService service;

    @BeforeEach
    void setUp() {
        service = new AdminService(users, listings, reservations, refreshTokens, contactMessages, vendors,
                listingService, reservationService, Clock.fixed(Instant.parse("2026-10-11T12:00:00Z"), ZoneOffset.UTC));
    }

    private VendorProfile vendor(String name) {
        User owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setFullName("Owner of " + name);
        owner.setEmail(name.toLowerCase() + "@example.com");
        owner.setEnabled(true);
        VendorProfile v = new VendorProfile();
        v.setId(UUID.randomUUID());
        v.setUser(owner);
        v.setBusinessName(name);
        v.setBusinessType(BusinessType.BAKERY);
        v.setAddress("1 Elm St");
        v.setCity("Pune");
        return v;
    }

    @SuppressWarnings("unchecked")
    @Test
    void theBusinessesViewCombinesPostedLiveAndRescuedTotals() {
        VendorProfile busy = vendor("Busy");
        VendorProfile quiet = vendor("Quiet");
        when(vendors.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(busy, quiet)));
        when(listings.countPostedByVendors(any())).thenReturn(List.<Object[]>of(new Object[]{busy.getId(), 7L}));
        when(listings.countLiveByVendors(any(), eq(ListingStatus.AVAILABLE), any())).thenReturn(List.<Object[]>of(new Object[]{busy.getId(), 2L}));
        when(reservations.totalsByVendors(any(), eq(ReservationStatus.COLLECTED)))
                .thenReturn(List.<Object[]>of(new Object[]{busy.getId(), 12L, new BigDecimal("1188.00")}));

        PageResponse<AdminVendorResponse> page = service.listVendors(null, 0, 20);

        AdminVendorResponse first = page.content().get(0);
        assertThat(first.businessName()).isEqualTo("Busy");
        assertThat(first.listingsPosted()).isEqualTo(7);
        assertThat(first.liveListings()).isEqualTo(2);
        assertThat(first.portionsRescued()).isEqualTo(12);
        assertThat(first.revenueRecovered()).isEqualByComparingTo("1188.00");
        assertThat(first.ownerEmail()).isEqualTo("busy@example.com");

        AdminVendorResponse second = page.content().get(1); // a business with no activity yet shows zeros, not nulls
        assertThat(second.listingsPosted()).isZero();
        assertThat(second.portionsRescued()).isZero();
        assertThat(second.revenueRecovered()).isEqualByComparingTo("0");
    }

    @Test
    void platformTotalsIncludeBusinessesAndRevenue() {
        when(users.countByRole(any())).thenReturn(1L);
        when(listings.countByStatus(any())).thenReturn(0L);
        when(reservations.countByStatus(any())).thenReturn(0L);
        when(reservations.sumQuantityByStatus(ReservationStatus.COLLECTED)).thenReturn(40L);
        when(reservations.sumRevenueByStatus(ReservationStatus.COLLECTED)).thenReturn(null); // nothing collected yet
        when(vendors.count()).thenReturn(6L);
        when(contactMessages.countByHandled(false)).thenReturn(3L);

        AdminStatsResponse stats = service.stats();

        assertThat(stats.businesses()).isEqualTo(6);
        assertThat(stats.portionsRescued()).isEqualTo(40);
        assertThat(stats.revenueRecovered()).isEqualByComparingTo("0");
        assertThat(stats.unreadMessages()).isEqualTo(3);
        assertThat(stats.usersByRole().get(Role.ADMIN)).isEqualTo(1L);
    }
}
