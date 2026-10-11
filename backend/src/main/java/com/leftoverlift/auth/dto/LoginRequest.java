package com.leftoverlift.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Add your email.") String email,
        @NotBlank(message = "Add your password.") String password
) {
}
