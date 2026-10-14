package com.leftoverlift.listing;

/** Filters for the public browse endpoint. Every field is optional. */
public record ListingSearch(String q, ListingCategory category, String city, Integer minDiscount,
                            ListingSort sort, int page, int size) {
}
