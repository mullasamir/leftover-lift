package com.leftoverlift.listing;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * The single place the discount is calculated. Vendors only ever type two prices; the percentage
 * is derived here, stored on the listing, and returned to every client, so it can never disagree
 * with the prices it came from.
 */
public final class Pricing {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private Pricing() {
    }

    /** Whole-number percentage off, rounded half up, always within 0 to 100. */
    public static int discountPercent(BigDecimal originalPrice, BigDecimal rescuePrice) {
        if (originalPrice == null || rescuePrice == null || originalPrice.signum() <= 0) {
            return 0;
        }
        BigDecimal percent = originalPrice.subtract(rescuePrice)
                .multiply(HUNDRED)
                .divide(originalPrice, 0, RoundingMode.HALF_UP);
        return Math.max(0, Math.min(100, percent.intValue()));
    }

    /** How much a customer saves, never negative. */
    public static BigDecimal savings(BigDecimal originalPrice, BigDecimal rescuePrice) {
        if (originalPrice == null || rescuePrice == null) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(rescuePrice).max(BigDecimal.ZERO);
    }
}
