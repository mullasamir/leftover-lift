package com.leftoverlift.auth.dto;

import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.VendorProfile;

import java.time.Instant;
import java.util.UUID;

/** Public view of a user. Never carries the password hash. */
public record UserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        String phone,
        VendorResponse vendor,
        Instant createdAt
) {
    public static UserResponse from(User user, VendorProfile vendor) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(),
                user.getPhone(), vendor == null ? null : VendorResponse.from(vendor), user.getCreatedAt());
    }
}
