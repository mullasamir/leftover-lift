package com.leftoverlift.reservation;

import java.security.SecureRandom;
import java.util.Locale;

/** Short codes people can read out loud: no 0/O or 1/I/L to mix up. */
final class PickupCodes {

    private static final char[] ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();
    static final int LENGTH = 6;

    private PickupCodes() {
    }

    static String generate() {
        char[] code = new char[LENGTH];
        for (int i = 0; i < LENGTH; i++) {
            code[i] = ALPHABET[RANDOM.nextInt(ALPHABET.length)];
        }
        return new String(code);
    }

    /** Accepts "k7q-x2m" or "K7Q X2M" as well as "K7QX2M". */
    static String normalize(String input) {
        return input == null ? "" : input.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
    }
}
