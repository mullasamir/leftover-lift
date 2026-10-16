package com.leftoverlift.admin.dto;

import jakarta.validation.constraints.NotNull;

public record SetHandledRequest(@NotNull(message = "Say whether the message is handled.") Boolean handled) {
}
