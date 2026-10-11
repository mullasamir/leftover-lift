package com.leftoverlift.auth.dto;

public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds, UserResponse user) {

    public static AuthResponse bearer(String token, long expiresInSeconds, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
