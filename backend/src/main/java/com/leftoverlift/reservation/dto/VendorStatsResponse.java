package com.leftoverlift.reservation.dto;

import java.math.BigDecimal;

/** A business's impact so far: the numbers behind its shareable impact card. */
public record VendorStatsResponse(
        long portionsRescued,
        BigDecimal revenueRecovered,
        long handovers,
        long waiting,
        long listingsPosted
) {
}
