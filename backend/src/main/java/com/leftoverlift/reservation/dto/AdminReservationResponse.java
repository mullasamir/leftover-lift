package com.leftoverlift.reservation.dto;

import com.leftoverlift.listing.Listing;
import com.leftoverlift.reservation.Reservation;
import com.leftoverlift.reservation.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** The owner's view of a pickup: everything, including the customer and the code, for support. */
public record AdminReservationResponse(
        UUID id,
        String pickupCode,
        ReservationStatus status,
        int quantity,
        BigDecimal totalPrice,
        Instant createdAt,
        Instant collectedAt,
        String customerName,
        String customerEmail,
        UUID listingId,
        String listingTitle,
        String businessName,
        Instant pickupStart,
        Instant pickupEnd
) {
    public static AdminReservationResponse from(Reservation r) {
        Listing l = r.getListing();
        return new AdminReservationResponse(
                r.getId(), r.getPickupCode(), r.getStatus(), r.getQuantity(), r.getTotalPrice(), r.getCreatedAt(), r.getCollectedAt(),
                r.getCustomer().getFullName(), r.getCustomer().getEmail(), l.getId(), l.getTitle(),
                l.getVendor().getBusinessName(), l.getPickupStart(), l.getPickupEnd());
    }
}
