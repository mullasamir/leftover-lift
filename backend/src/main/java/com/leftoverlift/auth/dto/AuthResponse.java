package com.leftoverlift.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresInSeconds, UserResponse user) {

    public static AuthResponse bearer(String accessToken, String refreshToken, long expiresInSeconds, UserResponse user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresInSeconds, user);
    }
}
