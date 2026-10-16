package com.leftoverlift.contact.dto;

import com.leftoverlift.contact.ContactTopic;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * `website` is a honeypot: real people never see or fill it (it is hidden in the form),
 * but form-filling bots do, and those submissions are quietly dropped.
 */
public record ContactRequest(
        @NotBlank(message = "Tell us your name.") @Size(max = 120, message = "Keep your name under 120 characters.") String name,
        @NotBlank(message = "Add your email so we can reply.") @Email(message = "That doesn't look like an email address.")
        @Size(max = 255) String email,
        @NotNull(message = "Choose what this is about.") ContactTopic topic,
        @NotBlank(message = "Write us a message.") @Size(min = 10, max = 2000, message = "Use between 10 and 2000 characters.") String message,
        @Size(max = 200) String website
) {
}
