package com.leftoverlift.listing;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PricingTest {

    private static BigDecimal bd(String v) {
        return new BigDecimal(v);
    }

    @Test
    void calculatesWholePercentageOff() {
        assertThat(Pricing.discountPercent(bd("400.00"), bd("100.00"))).isEqualTo(75);
        assertThat(Pricing.discountPercent(bd("200.00"), bd("100.00"))).isEqualTo(50);
    }

    @Test
    void roundsHalfUp() {
        // 1 - 99/380 = 73.95 percent
        assertThat(Pricing.discountPercent(bd("380.00"), bd("99.00"))).isEqualTo(74);
        // 12.5 percent rounds up to 13
        assertThat(Pricing.discountPercent(bd("8.00"), bd("7.00"))).isEqualTo(13);
    }

    @Test
    void edgeCasesStayInsideZeroToHundred() {
        assertThat(Pricing.discountPercent(bd("100.00"), bd("100.00"))).isZero();
        assertThat(Pricing.discountPercent(bd("100.00"), bd("0.00"))).isEqualTo(100);
        assertThat(Pricing.discountPercent(bd("100.00"), bd("150.00"))).isZero();
        assertThat(Pricing.discountPercent(bd("0.00"), bd("0.00"))).isZero();
        assertThat(Pricing.discountPercent(null, bd("1.00"))).isZero();
    }

    @Test
    void savingsAreNeverNegative() {
        assertThat(Pricing.savings(bd("380.00"), bd("99.00"))).isEqualByComparingTo("281.00");
        assertThat(Pricing.savings(bd("50.00"), bd("80.00"))).isEqualByComparingTo("0");
    }
}
