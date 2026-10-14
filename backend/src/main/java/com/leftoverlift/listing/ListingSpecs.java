package com.leftoverlift.listing;

import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.Locale;

/** Building blocks for the public browse query. */
final class ListingSpecs {

    private ListingSpecs() {
    }

    /** What a customer is allowed to see: open, in stock, and not past its pickup window. */
    static Specification<Listing> visible(Instant now) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), ListingStatus.AVAILABLE),
                cb.greaterThan(root.<Integer>get("quantityRemaining"), 0),
                cb.greaterThan(root.<Instant>get("pickupEnd"), now));
    }

    static Specification<Listing> category(ListingCategory category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    static Specification<Listing> city(String city) {
        return (root, query, cb) -> cb.equal(
                cb.lower(root.join("vendor").<String>get("city")), city.toLowerCase(Locale.ROOT));
    }

    static Specification<Listing> minDiscount(int percent) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<Integer>get("discountPercent"), percent);
    }

    static Specification<Listing> text(String raw) {
        String pattern = "%" + escapeLike(raw.toLowerCase(Locale.ROOT)) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.<String>get("title")), pattern, '\\'),
                cb.like(cb.lower(root.<String>get("description")), pattern, '\\'),
                cb.like(cb.lower(root.join("vendor").<String>get("businessName")), pattern, '\\'));
    }

    /** Stops a search for "50%" or "a_b" from acting as a wildcard. */
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
