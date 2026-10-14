package com.leftoverlift.config;

import com.leftoverlift.listing.*;
import com.leftoverlift.user.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Local-development convenience: with DEMO_DATA=true it creates a few demo businesses and, whenever nothing
 * is currently available, a fresh set of food listings. NEVER enable in production: the demo accounts share
 * a public password.
 */
@Component
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_PASSWORD = "demo-password-123";

    private record DemoVendor(String email, String owner, String name, BusinessType type, String address) {}

    private record DemoListing(int vendor, String title, String description, ListingCategory category,
                               Set<DietaryTag> tags, String original, String rescue, int quantity,
                               int closesInMinutes, int windowMinutes) {}

    private static final List<DemoVendor> VENDORS = List.of(
            new DemoVendor("crumb@demo.leftoverlift.test", "Maya Crumb", "Crumb & Co. Bakery", BusinessType.BAKERY, "12 Elm Street"),
            new DemoVendor("saffron@demo.leftoverlift.test", "Arjun Rao", "Saffron Table", BusinessType.RESTAURANT, "48 Lake Road"),
            new DemoVendor("loom@demo.leftoverlift.test", "Lena Loom", "Little Loom Café", BusinessType.CAFE, "7 Market Lane"),
            new DemoVendor("greenbasket@demo.leftoverlift.test", "Ravi Green", "Greenbasket Market", BusinessType.GROCERY, "3 Station Road"));

    private static final List<DemoListing> LISTINGS = List.of(
            new DemoListing(0, "Mixed pastry bag", "Five pieces baked this morning: croissant, danish and two buns.",
                    ListingCategory.BAKERY, EnumSet.of(DietaryTag.VEGETARIAN, DietaryTag.CONTAINS_GLUTEN), "380.00", "99.00", 3, 74, 240),
            new DemoListing(0, "Two sourdough loaves", "Day-old sourdough, still lovely toasted.",
                    ListingCategory.BAKERY, EnumSet.of(DietaryTag.VEGAN, DietaryTag.CONTAINS_GLUTEN), "320.00", "99.00", 2, 48, 240),
            new DemoListing(1, "Paneer curry with rice", "Two generous portions of paneer butter masala with jeera rice.",
                    ListingCategory.MEALS, EnumSet.of(DietaryTag.VEGETARIAN, DietaryTag.SPICY), "420.00", "129.00", 2, 22, 180),
            new DemoListing(1, "Dinner for two", "Chef's choice from tonight's menu: a main, a side and bread.",
                    ListingCategory.MEALS, EnumSet.noneOf(DietaryTag.class), "700.00", "199.00", 1, 260, 420),
            new DemoListing(2, "Sandwich and a cold brew", "Today's sandwiches plus one cold brew.",
                    ListingCategory.CAFE, EnumSet.of(DietaryTag.CONTAINS_DAIRY), "320.00", "119.00", 4, 190, 360),
            new DemoListing(3, "Surprise veg box", "About 3 kg of seasonal vegetables, perfectly fine but not pretty enough to sell.",
                    ListingCategory.GROCERY, EnumSet.of(DietaryTag.VEGAN), "400.00", "149.00", 5, 135, 300));

    private final UserRepository users;
    private final VendorProfileRepository vendors;
    private final ListingRepository listings;
    private final PasswordEncoder encoder;
    private final Clock clock;

    public DemoDataSeeder(UserRepository users, VendorProfileRepository vendors, ListingRepository listings,
                          PasswordEncoder encoder, Clock clock) {
        this.users = users;
        this.vendors = vendors;
        this.listings = listings;
        this.encoder = encoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<VendorProfile> profiles = new ArrayList<>();
        for (DemoVendor dv : VENDORS) {
            User user = users.findByEmail(dv.email()).orElseGet(() -> {
                User u = new User();
                u.setFullName(dv.owner());
                u.setEmail(dv.email());
                u.setPasswordHash(encoder.encode(DEMO_PASSWORD));
                u.setRole(Role.VENDOR);
                return users.save(u);
            });
            VendorProfile profile = vendors.findByUserId(user.getId()).orElseGet(() -> {
                VendorProfile p = new VendorProfile();
                p.setUser(user);
                p.setBusinessName(dv.name());
                p.setBusinessType(dv.type());
                p.setAddress(dv.address());
                p.setCity("Pune");
                p.setState("Maharashtra");
                p.setZipCode("411001");
                return vendors.save(p);
            });
            profiles.add(profile);
        }

        if (listings.countByStatus(ListingStatus.AVAILABLE) > 0) {
            log.info("Demo data: businesses are ready and food is already listed.");
            return;
        }

        Instant now = clock.instant();
        for (DemoListing dl : LISTINGS) {
            Listing l = new Listing();
            l.setVendor(profiles.get(dl.vendor()));
            l.setTitle(dl.title());
            l.setDescription(dl.description());
            l.setCategory(dl.category());
            l.setDietaryTags(dl.tags());
            l.setOriginalPrice(new BigDecimal(dl.original()));
            l.setRescuePrice(new BigDecimal(dl.rescue()));
            l.setQuantityTotal(dl.quantity());
            l.setQuantityRemaining(dl.quantity());
            l.setPickupEnd(now.plus(Duration.ofMinutes(dl.closesInMinutes())));
            l.setPickupStart(l.getPickupEnd().minus(Duration.ofMinutes(dl.windowMinutes())));
            l.setStatus(ListingStatus.AVAILABLE);
            l.recalculate();
            listings.save(l);
        }
        log.info("Demo data: created {} listings. Sign in as any *@demo.leftoverlift.test with '{}'.", LISTINGS.size(), DEMO_PASSWORD);
    }
}
