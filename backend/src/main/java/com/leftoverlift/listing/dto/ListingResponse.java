package com.leftoverlift.listing.dto;

import com.leftoverlift.listing.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        String title,
        String description,
        ListingCategory category,
        Set<DietaryTag> dietaryTags,
        BigDecimal originalPrice,
        BigDecimal rescuePrice,
        int discountPercent,
        BigDecimal savings,
        int quantityTotal,
        int quantityRemaining,
        Instant pickupStart,
        Instant pickupEnd,
        ListingStatus status,
        VendorSummary vendor,
        Instant createdAt
) {
    public static ListingResponse from(Listing l) {
        return new ListingResponse(
                l.getId(), l.getTitle(), l.getDescription(), l.getCategory(), l.getDietaryTags(),
                l.getOriginalPrice(), l.getRescuePrice(),
                Pricing.discountPercent(l.getOriginalPrice(), l.getRescuePrice()),
                Pricing.savings(l.getOriginalPrice(), l.getRescuePrice()),
                l.getQuantityTotal(), l.getQuantityRemaining(), l.getPickupStart(), l.getPickupEnd(),
                l.getStatus(), VendorSummary.from(l.getVendor()), l.getCreatedAt());
    }
}
