package com.leftoverlift.admin.dto;

import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.user.Role;

import java.util.Map;

public record AdminStatsResponse(
        long totalUsers,
        Map<Role, Long> usersByRole,
        Map<ListingStatus, Long> listingsByStatus,
        Map<ReservationStatus, Long> reservationsByStatus,
        long portionsRescued,
        long unreadMessages
) {
}
