package com.leftoverlift.admin.dto;

import jakarta.validation.constraints.NotNull;

public record SetEnabledRequest(@NotNull(message = "Say whether the account should be enabled.") Boolean enabled) {
}
