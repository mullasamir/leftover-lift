package com.leftoverlift.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** First-run administrator, supplied through environment variables. Leave blank to skip. */
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(String email, String password, String name) {
}
