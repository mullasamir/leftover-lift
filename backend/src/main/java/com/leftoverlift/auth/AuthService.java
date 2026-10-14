package com.leftoverlift.auth;

import com.leftoverlift.auth.dto.*;
import com.leftoverlift.common.ApiException;
import com.leftoverlift.security.JwtService;
import com.leftoverlift.user.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
public class AuthService {

    /** Roles a person may pick for themselves. ADMIN is never self-service. */
    private static final Set<Role> SELF_SERVICE_ROLES = Set.of(Role.CONSUMER, Role.VENDOR);

    private final UserRepository users;
    private final VendorProfileRepository vendors;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final RefreshTokenService refreshTokens;

    /** A real BCrypt hash used to keep login timing similar when the email is unknown. */
    private final String dummyHash;

    public AuthService(UserRepository users, VendorProfileRepository vendors,
                       PasswordEncoder encoder, JwtService jwt, RefreshTokenService refreshTokens) {
        this.users = users;
        this.vendors = vendors;
        this.encoder = encoder;
        this.jwt = jwt;
        this.refreshTokens = refreshTokens;
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (!SELF_SERVICE_ROLES.contains(req.role())) {
            throw ApiException.badRequest("ROLE_NOT_ALLOWED", "That account type can't be created here.");
        }
        if (req.role() == Role.VENDOR && req.vendor() == null) {
            throw ApiException.badRequest("VENDOR_DETAILS_REQUIRED", "Add your business details to register as a vendor.");
        }

        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_TAKEN", "An account with this email already exists. Try signing in.");
        }

        User user = new User();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(req.role());
        user.setPhone(blankToNull(req.phone()));
        user = users.save(user);

        VendorProfile profile = null;
        if (req.role() == Role.VENDOR) {
            VendorDetails d = req.vendor();
            profile = new VendorProfile();
            profile.setUser(user);
            profile.setBusinessName(d.businessName().trim());
            profile.setBusinessType(d.businessType());
            profile.setAddress(d.address().trim());
            profile.setCity(d.city().trim());
            profile.setState(d.state().trim());
            profile.setZipCode(d.zipCode().trim());
            profile = vendors.save(profile);
        }

        return issue(user, profile);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = normalize(req.email());
        User user = users.findByEmail(email).orElse(null);

        // One message for every failure so attackers can't tell which emails are registered.
        String hash = user != null ? user.getPasswordHash() : dummyHash;
        boolean matches = encoder.matches(req.password(), hash);
        if (user == null || !matches || !user.isEnabled()) {
            throw ApiException.unauthorized("INVALID_CREDENTIALS", "Email or password is incorrect.");
        }

        return issue(user, vendors.findByUserId(user.getId()).orElse(null));
    }

    /** Swaps a valid refresh token for a fresh access token and a new refresh token. */
    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse refresh(String rawRefreshToken) {
        User user = refreshTokens.consume(rawRefreshToken);
        if (!user.isEnabled()) {
            throw ApiException.unauthorized("INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
        }
        return issue(user, vendors.findByUserId(user.getId()).orElse(null));
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokens.revoke(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse me(User user) {
        return UserResponse.from(user, vendors.findByUserId(user.getId()).orElse(null));
    }

    private AuthResponse issue(User user, VendorProfile profile) {
        return AuthResponse.bearer(jwt.generateToken(user), refreshTokens.issue(user), jwt.lifetimeSeconds(),
                UserResponse.from(user, profile));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
