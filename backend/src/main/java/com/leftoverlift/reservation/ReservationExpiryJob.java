package com.leftoverlift.reservation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Reservations nobody collected before the window closed are marked as no-shows. */
@Component
public class ReservationExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(ReservationExpiryJob.class);

    private final ReservationRepository reservations;

    public ReservationExpiryJob(ReservationRepository reservations) {
        this.reservations = reservations;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 20_000)
    @Transactional
    public void expireUncollected() {
        int expired = reservations.expireEnded();
        if (expired > 0) {
            log.info("Marked {} reservation(s) as no-shows.", expired);
        }
    }
}
