package com.leftoverlift.reservation.dto;

import jakarta.validation.constraints.NotBlank;

public record CollectRequest(@NotBlank(message = "Enter the customer's pickup code.") String pickupCode) {
}
