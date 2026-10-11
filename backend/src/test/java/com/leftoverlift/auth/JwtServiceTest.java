package com.leftoverlift.auth;

import com.leftoverlift.config.JwtProperties;
import com.leftoverlift.security.JwtService;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder()
            .encodeToString("unit-test-secret-that-is-long-enough-for-hs256".getBytes());

    private User user() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setRole(Role.CONSUMER);
        return u;
    }

    @Test
    void issuedTokenRoundTripsToTheSameUserId() {
        JwtService jwt = new JwtService(new JwtProperties(SECRET, 60));
        User u = user();

        assertThat(jwt.parseUserId(jwt.generateToken(u))).contains(u.getId());
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwt = new JwtService(new JwtProperties(SECRET, -1));

        assertThat(jwt.parseUserId(jwt.generateToken(user()))).isEmpty();
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        String otherSecret = Base64.getEncoder().encodeToString("a-completely-different-secret-key-value!!".getBytes());
        String forged = new JwtService(new JwtProperties(otherSecret, 60)).generateToken(user());

        assertThat(new JwtService(new JwtProperties(SECRET, 60)).parseUserId(forged)).isEmpty();
    }

    @Test
    void garbageIsRejected() {
        assertThat(new JwtService(new JwtProperties(SECRET, 60)).parseUserId("not.a.jwt")).isEmpty();
    }
}
