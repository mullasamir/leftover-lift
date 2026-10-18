package com.leftoverlift.admin.dto;

import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.VendorProfile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One business on the platform, with its owner and how it is doing. */
public record AdminVendorResponse(
        UUID id,
        UUID userId,
        String businessName,
        BusinessType businessType,
        String address,
        String city,
        String ownerName,
        String ownerEmail,
        boolean enabled,
        Instant createdAt,
        long listingsPosted,
        long liveListings,
        long portionsRescued,
        BigDecimal revenueRecovered
) {
    public static AdminVendorResponse from(VendorProfile v, long posted, long live, long rescued, BigDecimal revenue) {
        return new AdminVendorResponse(
                v.getId(), v.getUser().getId(), v.getBusinessName(), v.getBusinessType(), v.getAddress(), v.getCity(),
                v.getUser().getFullName(), v.getUser().getEmail(), v.getUser().isEnabled(), v.getCreatedAt(),
                posted, live, rescued, revenue);
    }
}
