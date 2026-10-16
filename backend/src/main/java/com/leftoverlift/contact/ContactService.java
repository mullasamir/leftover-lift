package com.leftoverlift.contact;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.contact.dto.ContactRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ContactService {

    static final int MAX_PER_HOUR = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final ContactMessageRepository messages;
    private final Clock clock;

    // Recent submission times per caller. In memory is enough for one server; a shared store would be needed to scale out.
    private final Map<String, Deque<Instant>> recent = new ConcurrentHashMap<>();

    public ContactService(ContactMessageRepository messages, Clock clock) {
        this.messages = messages;
        this.clock = clock;
    }

    @Transactional
    public void submit(ContactRequest request, String callerKey) {
        if (request.website() != null && !request.website().isBlank()) {
            return; // a bot filled the hidden field: pretend it worked and store nothing
        }
        enforceRateLimit(callerKey);

        ContactMessage message = new ContactMessage();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim().toLowerCase());
        message.setTopic(request.topic());
        message.setMessage(request.message().trim());
        messages.save(message);
    }

    private void enforceRateLimit(String callerKey) {
        Instant now = clock.instant();
        Deque<Instant> times = recent.computeIfAbsent(callerKey, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && times.peekFirst().isBefore(now.minus(WINDOW))) {
                times.pollFirst();
            }
            if (times.size() >= MAX_PER_HOUR) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
                        "You have sent a few messages already. Please try again a little later.");
            }
            times.addLast(now);
        }
    }
}
