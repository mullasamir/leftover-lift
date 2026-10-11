package com.leftoverlift.auth;

import com.leftoverlift.auth.dto.*;
import com.leftoverlift.common.ApiException;
import com.leftoverlift.security.JwtService;
import com.leftoverlift.user.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock UserRepository users;
    @Mock VendorProfileRepository vendors;
    @Mock JwtService jwt;

    // Low cost factor keeps the tests fast; production uses 12 (see SecurityConfig).
    final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, vendors, encoder, jwt);
        when(jwt.generateToken(any())).thenReturn("token");
        when(jwt.lifetimeSeconds()).thenReturn(3600L);
        when(users.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(vendors.save(any(VendorProfile.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private RegisterRequest consumer(String email) {
        return new RegisterRequest("Asha Rao", email, "supersecret", Role.CONSUMER, null, null);
    }

    @Test
    void registerStoresAHashNeverThePlainPassword() {
        AuthResponse res = service.register(consumer("  Asha@Example.com "));

        var saved = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getPasswordHash()).isNotEqualTo("supersecret").startsWith("$2");
        assertThat(saved.getValue().getEmail()).isEqualTo("asha@example.com");
        assertThat(res.accessToken()).isEqualTo("token");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(users.existsByEmail("asha@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(consumer("asha@example.com")))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("code", "EMAIL_TAKEN");
    }

    @Test
    void registerRejectsAdminSelfSignup() {
        var req = new RegisterRequest("Eve", "eve@example.com", "supersecret", Role.ADMIN, null, null);

        assertThatThrownBy(() -> service.register(req))
                .hasFieldOrPropertyWithValue("code", "ROLE_NOT_ALLOWED");
    }

    @Test
    void vendorMustProvideBusinessDetails() {
        var req = new RegisterRequest("Bo", "bo@bakery.com", "supersecret", Role.VENDOR, null, null);

        assertThatThrownBy(() -> service.register(req))
                .hasFieldOrPropertyWithValue("code", "VENDOR_DETAILS_REQUIRED");
    }

    @Test
    void vendorRegistrationCreatesAProfile() {
        var details = new VendorDetails("Crumb & Co", BusinessType.BAKERY, "12 Elm St", "Pune", "MH", "411001");
        var req = new RegisterRequest("Bo", "bo@bakery.com", "supersecret", Role.VENDOR, "555", details);

        AuthResponse res = service.register(req);

        verify(vendors).save(any(VendorProfile.class));
        assertThat(res.user().vendor().businessName()).isEqualTo("Crumb & Co");
    }

    @Test
    void loginWithWrongPasswordAndUnknownEmailGiveTheSameError() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setRole(Role.CONSUMER);
        u.setPasswordHash(encoder.encode("rightpassword"));
        when(users.findByEmail("asha@example.com")).thenReturn(Optional.of(u));
        when(users.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        Throwable wrongPassword = org.assertj.core.api.Assertions.catchThrowable(
                () -> service.login(new LoginRequest("asha@example.com", "nope")));
        Throwable unknownEmail = org.assertj.core.api.Assertions.catchThrowable(
                () -> service.login(new LoginRequest("ghost@example.com", "nope")));

        assertThat(wrongPassword).isInstanceOf(ApiException.class);
        assertThat(unknownEmail).hasMessage(wrongPassword.getMessage());
    }

    @Test
    void loginSucceedsWithCorrectPassword() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setFullName("Asha");
        u.setEmail("asha@example.com");
        u.setRole(Role.CONSUMER);
        u.setPasswordHash(encoder.encode("rightpassword"));
        when(users.findByEmail("asha@example.com")).thenReturn(Optional.of(u));

        AuthResponse res = service.login(new LoginRequest("Asha@example.com", "rightpassword"));

        assertThat(res.user().email()).isEqualTo("asha@example.com");
    }
}
