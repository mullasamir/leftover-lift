package com.leftoverlift;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

// We authenticate with JWTs, so Spring's default in-memory user (and its generated password) is not needed.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class LeftoverLiftApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeftoverLiftApplication.class, args);
    }
}
