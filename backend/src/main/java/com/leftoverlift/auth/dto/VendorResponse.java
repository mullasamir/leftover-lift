package com.leftoverlift.auth.dto;

import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.VendorProfile;

import java.util.UUID;

public record VendorResponse(
        UUID id,
        String businessName,
        BusinessType businessType,
        String address,
        String city,
        String state,
        String zipCode
) {
    public static VendorResponse from(VendorProfile v) {
        return new VendorResponse(v.getId(), v.getBusinessName(), v.getBusinessType(),
                v.getAddress(), v.getCity(), v.getState(), v.getZipCode());
    }
}
