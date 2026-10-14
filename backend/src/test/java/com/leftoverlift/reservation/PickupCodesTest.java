package com.leftoverlift.reservation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PickupCodesTest {

    @Test
    void generatedCodesAreReadableAndTheRightLength() {
        for (int i = 0; i < 500; i++) {
            String code = PickupCodes.generate();
            assertThat(code).hasSize(PickupCodes.LENGTH).matches("[A-HJKMNP-Z2-9]+"); // no 0, O, 1, I or L
        }
    }

    @Test
    void normalizeToleratesSpacesDashesAndLowercase() {
        assertThat(PickupCodes.normalize(" k7q-x2m ")).isEqualTo("K7QX2M");
        assertThat(PickupCodes.normalize("K7Q X2M")).isEqualTo("K7QX2M");
        assertThat(PickupCodes.normalize(null)).isEmpty();
    }
}
