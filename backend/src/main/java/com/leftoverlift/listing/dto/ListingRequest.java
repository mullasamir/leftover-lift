package com.leftoverlift.listing.dto;

import com.leftoverlift.listing.DietaryTag;
import com.leftoverlift.listing.ListingCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

/** What a vendor sends. Note there is no discount field: it is calculated from the two prices. */
public record ListingRequest(
        @NotBlank(message = "Give the food a name.") @Size(max = 120, message = "Keep the name under 120 characters.") String title,
        @NotBlank(message = "Describe what is included.") @Size(max = 1000, message = "Keep the description under 1000 characters.") String description,
        @NotNull(message = "Choose a category.") ListingCategory category,
        Set<DietaryTag> dietaryTags,
        @NotNull(message = "Add the usual price.")
        @DecimalMin(value = "0.01", message = "The usual price must be more than zero.")
        @Digits(integer = 8, fraction = 2, message = "Use at most two decimal places.") BigDecimal originalPrice,
        @NotNull(message = "Add the rescue price.")
        @DecimalMin(value = "0.00", message = "The rescue price cannot be negative.")
        @Digits(integer = 8, fraction = 2, message = "Use at most two decimal places.") BigDecimal rescuePrice,
        @NotNull(message = "How many portions are there?")
        @Min(value = 1, message = "Offer at least one portion.") @Max(value = 500, message = "That is more than we can list at once.") Integer quantity,
        @NotNull(message = "When can people start collecting?") Instant pickupStart,
        @NotNull(message = "When does pickup end?") Instant pickupEnd
) {
}
