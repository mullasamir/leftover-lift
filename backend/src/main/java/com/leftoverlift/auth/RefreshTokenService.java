package com.leftoverlift.auth;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.config.RefreshProperties;
import com.leftoverlift.user.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Long-lived sessions without long-lived access tokens.
 * Refresh tokens are random, stored hashed, single use (rotated on every refresh), and if a token that
 * was already used shows up again, every session for that user is revoked (a sign it was stolen).
 */
@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository tokens;
    private final RefreshProperties props;
    private final Clock clock;

    public RefreshTokenService(RefreshTokenRepository tokens, RefreshProperties props, Clock clock) {
        this.tokens = tokens;
        this.props = props;
        this.clock = clock;
    }

    @Transactional
    public String issue(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(clock.instant().plus(Duration.ofDays(props.expirationDays())));
        tokens.save(token);
        return raw;
    }

    /**
     * Validates a refresh token and marks it used. The revocation of a reused token must survive the
     * exception below, hence noRollbackFor.
     */
    @Transactional(noRollbackFor = ApiException.class)
    public User consume(String raw) {
        RefreshToken token = tokens.findByTokenHash(hash(raw)).orElseThrow(RefreshTokenService::invalid);

        if (token.isRevoked()) {
            tokens.revokeAllForUser(token.getUser().getId());
            throw invalid();
        }
        if (!token.getExpiresAt().isAfter(clock.instant())) {
            throw invalid();
        }
        token.setRevoked(true);
        return token.getUser();
    }

    @Transactional
    public void revoke(String raw) {
        tokens.findByTokenHash(hash(raw)).ifPresent(t -> t.setRevoked(true));
    }

    @Transactional
    public void revokeAll(UUID userId) {
        tokens.revokeAllForUser(userId);
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeExpired() {
        tokens.deleteExpired(clock.instant());
    }

    static ApiException invalid() {
        return ApiException.unauthorized("INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
    }

    static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is always available", e);
        }
    }
}
