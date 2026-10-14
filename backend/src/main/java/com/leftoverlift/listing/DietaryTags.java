package com.leftoverlift.listing;

import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

/** Reads and writes the tag set as one comma-separated column, e.g. "SPICY,VEGETARIAN". */
final class DietaryTags {

    private DietaryTags() {
    }

    static String format(Set<DietaryTag> tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }
        return tags.stream().map(Enum::name).sorted().collect(Collectors.joining(","));
    }

    static Set<DietaryTag> parse(String column) {
        Set<DietaryTag> tags = EnumSet.noneOf(DietaryTag.class);
        if (column == null || column.isBlank()) {
            return tags;
        }
        for (String part : column.split(",")) {
            try {
                tags.add(DietaryTag.valueOf(part.trim()));
            } catch (IllegalArgumentException ignored) {
                // A tag removed from the enum in a later release should not break reading old rows.
            }
        }
        return tags;
    }
}
