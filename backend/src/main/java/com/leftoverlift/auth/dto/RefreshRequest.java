package com.leftoverlift.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Missing refresh token.") String refreshToken) {
}
