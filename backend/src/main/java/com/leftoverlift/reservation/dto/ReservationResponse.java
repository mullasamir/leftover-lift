package com.leftoverlift.reservation.dto;

import com.leftoverlift.listing.Listing;
import com.leftoverlift.listing.ListingCategory;
import com.leftoverlift.reservation.Reservation;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.user.VendorProfile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** What a customer sees. Only the customer ever receives the pickup code. */
public record ReservationResponse(
        UUID id,
        String pickupCode,
        ReservationStatus status,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        Instant createdAt,
        Instant collectedAt,
        ReservedListing listing
) {
    public record ReservedListing(UUID id, String title, ListingCategory category, Instant pickupStart, Instant pickupEnd,
                                  BigDecimal originalPrice, String businessName, String address, String city) {
    }

    public static ReservationResponse from(Reservation r) {
        Listing l = r.getListing();
        VendorProfile v = l.getVendor();
        return new ReservationResponse(
                r.getId(), r.getPickupCode(), r.getStatus(), r.getQuantity(), r.getUnitPrice(), r.getTotalPrice(),
                r.getCreatedAt(), r.getCollectedAt(),
                new ReservedListing(l.getId(), l.getTitle(), l.getCategory(), l.getPickupStart(), l.getPickupEnd(),
                        l.getOriginalPrice(), v.getBusinessName(), v.getAddress(), v.getCity()));
    }
}
