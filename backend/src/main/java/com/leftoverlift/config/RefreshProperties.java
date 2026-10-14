package com.leftoverlift.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.refresh")
public record RefreshProperties(long expirationDays) {
}
