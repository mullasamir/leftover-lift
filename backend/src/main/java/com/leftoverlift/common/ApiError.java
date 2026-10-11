package com.leftoverlift.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        Map<String, String> fieldErrors,
        String path
) {
    public static ApiError of(int status, String code, String message, String path) {
        return new ApiError(Instant.now(), status, code, message, null, path);
    }

    public static ApiError withFields(int status, String code, String message,
                                      Map<String, String> fieldErrors, String path) {
        return new ApiError(Instant.now(), status, code, message, fieldErrors, path);
    }
}
