package com.leftoverlift.contact.dto;

import com.leftoverlift.contact.ContactMessage;
import com.leftoverlift.contact.ContactTopic;

import java.time.Instant;
import java.util.UUID;

public record ContactMessageResponse(UUID id, String name, String email, ContactTopic topic, String message, boolean handled, Instant createdAt) {

    public static ContactMessageResponse from(ContactMessage m) {
        return new ContactMessageResponse(m.getId(), m.getName(), m.getEmail(), m.getTopic(), m.getMessage(), m.isHandled(), m.getCreatedAt());
    }
}
