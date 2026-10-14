package com.leftoverlift.config;

import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Creates the first administrator from ADMIN_EMAIL and ADMIN_PASSWORD when the app starts.
 * Admin accounts can never be created through the public sign-up endpoint.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminProperties props;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AdminBootstrap(AdminProperties props, UserRepository users, PasswordEncoder encoder) {
        this.props = props;
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = props.email() == null ? "" : props.email().trim().toLowerCase(Locale.ROOT);
        String password = props.password() == null ? "" : props.password();

        if (email.isEmpty() || password.isEmpty()) {
            log.info("No ADMIN_EMAIL / ADMIN_PASSWORD set, skipping admin bootstrap.");
            return;
        }
        if (password.length() < 8) {
            log.warn("ADMIN_PASSWORD is shorter than 8 characters, skipping admin bootstrap.");
            return;
        }
        if (users.existsByEmail(email)) {
            log.info("Admin bootstrap: {} already exists, leaving it unchanged.", email);
            return;
        }

        User admin = new User();
        admin.setFullName(props.name() == null || props.name().isBlank() ? "Platform Admin" : props.name().trim());
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        users.save(admin);
        log.info("Admin bootstrap: created administrator {}.", email);
    }
}
