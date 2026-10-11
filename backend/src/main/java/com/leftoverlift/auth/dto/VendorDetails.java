package com.leftoverlift.auth.dto;

import com.leftoverlift.user.BusinessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VendorDetails(
        @NotBlank(message = "Tell us your business name.") @Size(max = 160) String businessName,
        @NotNull(message = "Choose the type of business.") BusinessType businessType,
        @NotBlank(message = "Add the pickup address.") @Size(max = 255) String address,
        @NotBlank(message = "Add your city.") @Size(max = 100) String city,
        @NotBlank(message = "Add your state.") @Size(max = 100) String state,
        @NotBlank(message = "Add your zip code.") @Size(max = 20) String zipCode
) {
}
