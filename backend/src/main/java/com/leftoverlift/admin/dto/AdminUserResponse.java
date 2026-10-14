package com.leftoverlift.admin.dto;

import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(UUID id, String fullName, String email, Role role, String phone, boolean enabled, Instant createdAt) {

    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getPhone(), u.isEnabled(), u.getCreatedAt());
    }
}
