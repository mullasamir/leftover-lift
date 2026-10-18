package com.leftoverlift.stats;

/** Totals anyone may see. No personal data, only counts. */
public record PublicStatsResponse(long businesses, long liveListings, long portionsRescued) {
}
