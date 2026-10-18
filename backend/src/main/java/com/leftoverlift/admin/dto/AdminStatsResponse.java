package com.leftoverlift.admin.dto;

import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.user.Role;

import java.math.BigDecimal;
import java.util.Map;

public record AdminStatsResponse(
        long totalUsers,
        Map<Role, Long> usersByRole,
        Map<ListingStatus, Long> listingsByStatus,
        Map<ReservationStatus, Long> reservationsByStatus,
        long portionsRescued,
        BigDecimal revenueRecovered,
        long businesses,
        long unreadMessages
) {
}
