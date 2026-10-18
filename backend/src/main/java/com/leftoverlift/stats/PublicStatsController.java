package com.leftoverlift.stats;

import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.ReservationRepository;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.user.VendorProfileRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;

@RestController
@RequestMapping("/api/v1/stats")
public class PublicStatsController {

    private final VendorProfileRepository vendors;
    private final ListingRepository listings;
    private final ReservationRepository reservations;
    private final Clock clock;

    public PublicStatsController(VendorProfileRepository vendors, ListingRepository listings,
                                 ReservationRepository reservations, Clock clock) {
        this.vendors = vendors;
        this.listings = listings;
        this.reservations = reservations;
        this.clock = clock;
    }

    @GetMapping
    public PublicStatsResponse stats() {
        return new PublicStatsResponse(
                vendors.count(),
                listings.countVisible(ListingStatus.AVAILABLE, clock.instant()),
                reservations.sumQuantityByStatus(ReservationStatus.COLLECTED));
    }
}
