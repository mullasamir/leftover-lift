package com.leftoverlift.auth;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.config.RefreshProperties;
import com.leftoverlift.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-11T12:00:00Z");

    @Mock RefreshTokenRepository tokens;

    RefreshTokenService service;
    User user;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(tokens, new RefreshProperties(14), Clock.fixed(NOW, ZoneOffset.UTC));
        user = new User();
        user.setId(UUID.randomUUID());
    }

    private RefreshToken stored(String raw, boolean revoked, Instant expiresAt) {
        RefreshToken t = new RefreshToken();
        t.setUser(user);
        t.setTokenHash(RefreshTokenService.hash(raw));
        t.setRevoked(revoked);
        t.setExpiresAt(expiresAt);
        return t;
    }

    @Test
    void issuedTokenIsStoredOnlyAsAHash() {
        String raw = service.issue(user);

        ArgumentCaptor<RefreshToken> saved = ArgumentCaptor.forClass(RefreshToken.class);
        verify(tokens).save(saved.capture());
        assertThat(saved.getValue().getTokenHash()).isNotEqualTo(raw).hasSize(64);
        assertThat(saved.getValue().getTokenHash()).isEqualTo(RefreshTokenService.hash(raw));
        assertThat(saved.getValue().getExpiresAt()).isEqualTo(NOW.plusSeconds(14 * 24 * 3600L));
    }

    @Test
    void consumingAValidTokenMarksItUsedAndReturnsItsOwner() {
        RefreshToken token = stored("abc", false, NOW.plusSeconds(60));
        when(tokens.findByTokenHash(RefreshTokenService.hash("abc"))).thenReturn(Optional.of(token));

        assertThat(service.consume("abc")).isSameAs(user);
        assertThat(token.isRevoked()).isTrue();
    }

    @Test
    void reusingAnAlreadyUsedTokenRevokesEverySessionOfThatUser() {
        RefreshToken token = stored("abc", true, NOW.plusSeconds(60));
        when(tokens.findByTokenHash(RefreshTokenService.hash("abc"))).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.consume("abc")).isInstanceOf(ApiException.class);
        verify(tokens).revokeAllForUser(user.getId());
    }

    @Test
    void expiredAndUnknownTokensAreRejected() {
        RefreshToken expired = stored("old", false, NOW.minusSeconds(1));
        when(tokens.findByTokenHash(RefreshTokenService.hash("old"))).thenReturn(Optional.of(expired));
        when(tokens.findByTokenHash(RefreshTokenService.hash("nope"))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.consume("old")).hasFieldOrPropertyWithValue("code", "INVALID_REFRESH_TOKEN");
        assertThatThrownBy(() -> service.consume("nope")).hasFieldOrPropertyWithValue("code", "INVALID_REFRESH_TOKEN");
    }
}
