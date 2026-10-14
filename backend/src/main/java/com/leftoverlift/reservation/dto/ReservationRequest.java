package com.leftoverlift.reservation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReservationRequest(
        @NotNull(message = "Choose what to reserve.") UUID listingId,
        @NotNull(message = "How many portions?")
        @Min(value = 1, message = "Reserve at least one portion.")
        @Max(value = 3, message = "You can reserve up to 3 portions at a time.") Integer quantity
) {
}
