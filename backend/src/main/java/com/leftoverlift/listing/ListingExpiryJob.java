package com.leftoverlift.listing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;

/** Marks listings whose pickup window has ended as EXPIRED. Public browse already hides them; this keeps the data honest. */
@Component
public class ListingExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(ListingExpiryJob.class);

    private final ListingRepository listings;
    private final Clock clock;

    public ListingExpiryJob(ListingRepository listings, Clock clock) {
        this.listings = listings;
        this.clock = clock;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 15_000)
    @Transactional
    public void expireEndedListings() {
        int expired = listings.expire(ListingStatus.EXPIRED,
                List.of(ListingStatus.AVAILABLE, ListingStatus.SOLD_OUT), clock.instant());
        if (expired > 0) {
            log.info("Expired {} listing(s) past their pickup window.", expired);
        }
    }
}
