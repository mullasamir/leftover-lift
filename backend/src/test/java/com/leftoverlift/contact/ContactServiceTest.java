package com.leftoverlift.contact;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.contact.dto.ContactRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock ContactMessageRepository messages;

    ContactService service;

    @BeforeEach
    void setUp() {
        service = new ContactService(messages, Clock.fixed(Instant.parse("2026-10-11T12:00:00Z"), ZoneOffset.UTC));
    }

    private ContactRequest request(String website) {
        return new ContactRequest("  Asha Rao ", "ASHA@Example.com", ContactTopic.GENERAL, "  Hello, I have a question.  ", website);
    }

    @Test
    void storesATidiedUpMessage() {
        service.submit(request(null), "1.2.3.4");

        ArgumentCaptor<ContactMessage> saved = ArgumentCaptor.forClass(ContactMessage.class);
        verify(messages).save(saved.capture());
        assertThat(saved.getValue().getName()).isEqualTo("Asha Rao");
        assertThat(saved.getValue().getEmail()).isEqualTo("asha@example.com");
        assertThat(saved.getValue().getMessage()).isEqualTo("Hello, I have a question.");
        assertThat(saved.getValue().isHandled()).isFalse();
    }

    @Test
    void aFilledHoneypotIsQuietlyDropped() {
        service.submit(request("http://spam.example"), "6.6.6.6");

        verify(messages, never()).save(any());
    }

    @Test
    void oneCallerCannotFloodTheInbox() {
        for (int i = 0; i < ContactService.MAX_PER_HOUR; i++) {
            service.submit(request(null), "7.7.7.7");
        }

        assertThatThrownBy(() -> service.submit(request(null), "7.7.7.7"))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("code", "RATE_LIMITED");
        verify(messages, times(ContactService.MAX_PER_HOUR)).save(any());

        service.submit(request(null), "8.8.8.8"); // a different caller is unaffected
        verify(messages, times(ContactService.MAX_PER_HOUR + 1)).save(any());
    }
}
