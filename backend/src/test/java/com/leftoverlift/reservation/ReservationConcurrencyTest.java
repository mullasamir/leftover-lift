package com.leftoverlift.reservation;

import com.leftoverlift.common.ApiException;
import com.leftoverlift.listing.Listing;
import com.leftoverlift.listing.ListingCategory;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.user.BusinessType;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.UserRepository;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The proof that nothing is ever oversold. This runs against a real PostgreSQL database, because the
 * guarantee comes from the database's row locking and not from Java: many threads race for a handful of
 * portions at the same instant, and exactly that many must win.
 */
@ExtendWith(TestDatabaseCondition.class)
@SpringBootTest(properties = {
        "spring.datasource.url=" + TestDatabaseCondition.URL,
        "spring.datasource.username=" + TestDatabaseCondition.USER,
        "spring.datasource.password=" + TestDatabaseCondition.PASSWORD,
        "app.admin.email="
})
class ReservationConcurrencyTest {

    @Autowired ReservationService reservationService;
    @Autowired ReservationRepository reservations;
    @Autowired ListingRepository listings;
    @Autowired VendorProfileRepository vendors;
    @Autowired UserRepository users;

    private final List<User> createdUsers = new ArrayList<>();
    private Listing listing;

    private User newUser(Role role, String label) {
        User u = new User();
        u.setFullName("Test " + label);
        u.setEmail("it-" + label + "-" + UUID.randomUUID() + "@test.local");
        u.setPasswordHash("not-a-real-hash");
        u.setRole(role);
        u = users.save(u);
        createdUsers.add(u);
        return u;
    }

    private Listing newListing(int quantity) {
        User owner = newUser(Role.VENDOR, "vendor");
        VendorProfile vendor = new VendorProfile();
        vendor.setUser(owner);
        vendor.setBusinessName("Concurrency Bakery");
        vendor.setBusinessType(BusinessType.BAKERY);
        vendor.setAddress("1 Test Street");
        vendor.setCity("Pune");
        vendor.setState("MH");
        vendor.setZipCode("411001");
        vendor = vendors.save(vendor);

        Listing l = new Listing();
        l.setVendor(vendor);
        l.setTitle("Last portions");
        l.setDescription("Race me");
        l.setCategory(ListingCategory.BAKERY);
        l.setOriginalPrice(new BigDecimal("100.00"));
        l.setRescuePrice(new BigDecimal("30.00"));
        l.setQuantityTotal(quantity);
        l.setQuantityRemaining(quantity);
        l.setPickupStart(Instant.now().minus(Duration.ofMinutes(5)));
        l.setPickupEnd(Instant.now().plus(Duration.ofHours(2)));
        l.setStatus(ListingStatus.AVAILABLE);
        listing = listings.save(l);
        return listing;
    }

    @AfterEach
    void cleanUp() {
        // Foreign keys cascade: removing the users removes their vendor profile, listings and reservations.
        users.deleteAll(createdUsers);
        createdUsers.clear();
    }

    @Test
    void twentyPeopleRacingForThreePortionsGetExactlyThree() throws Exception {
        Listing l = newListing(3);
        int attempts = 20;
        List<User> customers = new ArrayList<>();
        for (int i = 0; i < attempts; i++) {
            customers.add(newUser(Role.CONSUMER, "c" + i));
        }

        ExecutorService pool = Executors.newFixedThreadPool(attempts);
        CountDownLatch startGun = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        for (User customer : customers) {
            results.add(pool.submit(() -> {
                startGun.await(); // everyone leaves the blocks at the same moment
                try {
                    reservationService.reserve(customer, l.getId(), 1);
                    return true;
                } catch (ApiException expectedLoser) {
                    return false;
                }
            }));
        }
        startGun.countDown();

        int winners = 0;
        for (Future<Boolean> result : results) {
            if (result.get(60, TimeUnit.SECONDS)) {
                winners++;
            }
        }
        pool.shutdown();

        Listing after = listings.findById(l.getId()).orElseThrow();
        assertThat(winners).as("people who got a portion").isEqualTo(3);
        assertThat(after.getQuantityRemaining()).as("portions left").isZero();
        assertThat(after.getStatus()).isEqualTo(ListingStatus.SOLD_OUT);
        assertThat(reservations.countByListingIdAndStatus(l.getId(), ReservationStatus.RESERVED)).isEqualTo(3);
    }

    @Test
    void cancellingPutsTheFoodBackOnSaleForSomeoneElse() {
        Listing l = newListing(1);
        User first = newUser(Role.CONSUMER, "first");
        User second = newUser(Role.CONSUMER, "second");

        var held = reservationService.reserve(first, l.getId(), 1);
        assertThat(listings.findById(l.getId()).orElseThrow().getStatus()).isEqualTo(ListingStatus.SOLD_OUT);
        assertThatThrownBy(() -> reservationService.reserve(second, l.getId(), 1))
                .isInstanceOf(ApiException.class); // sold out (the listing is no longer available)

        reservationService.cancel(first, held.id());

        Listing reopened = listings.findById(l.getId()).orElseThrow();
        assertThat(reopened.getStatus()).isEqualTo(ListingStatus.AVAILABLE);
        assertThat(reopened.getQuantityRemaining()).isEqualTo(1);
        assertThat(reservationService.reserve(second, l.getId(), 1).status()).isEqualTo(ReservationStatus.RESERVED);
    }

    @Test
    void theSameCustomerCannotHoldTheSameFoodTwiceEvenWhenClickingTwiceAtOnce() throws Exception {
        Listing l = newListing(5);
        User customer = newUser(Role.CONSUMER, "doubleclick");

        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch startGun = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            results.add(pool.submit(() -> {
                startGun.await();
                try {
                    reservationService.reserve(customer, l.getId(), 1);
                    return true;
                } catch (Exception rejected) { // either the friendly check or the database's unique index
                    return false;
                }
            }));
        }
        startGun.countDown();
        int wins = 0;
        for (Future<Boolean> r : results) {
            if (r.get(30, TimeUnit.SECONDS)) wins++;
        }
        pool.shutdown();

        assertThat(wins).isEqualTo(1);
        assertThat(reservations.countByListingIdAndStatus(l.getId(), ReservationStatus.RESERVED)).isEqualTo(1);
        // the rejected click must not have kept a portion either
        assertThat(listings.findById(l.getId()).orElseThrow().getQuantityRemaining()).isEqualTo(4);
    }
}
