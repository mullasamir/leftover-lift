package com.leftoverlift.auth.dto;

import com.leftoverlift.user.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Tell us your name.") @Size(max = 120) String fullName,
        @NotBlank(message = "Add your email.") @Email(message = "That doesn't look like an email address.")
        @Size(max = 255) String email,
        @NotBlank(message = "Choose a password.")
        @Size(min = 8, max = 72, message = "Use 8 to 72 characters.") String password,
        @NotNull(message = "Choose how you'll use Leftover Lift.") Role role,
        @Size(max = 30) String phone,
        @Valid VendorDetails vendor
) {
}
