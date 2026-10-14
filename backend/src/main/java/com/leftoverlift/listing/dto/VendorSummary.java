package com.leftoverlift.listing.dto;

import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.VendorProfile;

import java.util.UUID;

public record VendorSummary(UUID id, String businessName, BusinessType businessType, String address, String city) {

    public static VendorSummary from(VendorProfile v) {
        return new VendorSummary(v.getId(), v.getBusinessName(), v.getBusinessType(), v.getAddress(), v.getCity());
    }
}
