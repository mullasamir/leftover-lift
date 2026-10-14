package com.leftoverlift.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;

@Configuration
@EnableScheduling
public class AppConfig {

    /** One injectable clock so time-dependent rules (pickup windows, token expiry) are testable. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
