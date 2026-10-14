package com.leftoverlift.reservation.dto;

import com.leftoverlift.reservation.Reservation;
import com.leftoverlift.reservation.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** What a business sees: who is coming and for what, but never the code (they must hear it from the customer). */
public record VendorReservationResponse(
        UUID id,
        String customerName,
        int quantity,
        BigDecimal totalPrice,
        ReservationStatus status,
        Instant createdAt,
        Instant collectedAt,
        UUID listingId,
        String listingTitle,
        Instant pickupEnd
) {
    public static VendorReservationResponse from(Reservation r) {
        return new VendorReservationResponse(
                r.getId(), shortName(r.getCustomer().getFullName()), r.getQuantity(), r.getTotalPrice(), r.getStatus(),
                r.getCreatedAt(), r.getCollectedAt(), r.getListing().getId(), r.getListing().getTitle(), r.getListing().getPickupEnd());
    }

    /** "Asha Rao" becomes "Asha R." */
    static String shortName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 1 ? parts[0] + " " + parts[parts.length - 1].charAt(0) + "." : parts[0];
    }
}
