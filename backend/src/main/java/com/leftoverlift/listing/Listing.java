package com.leftoverlift.listing;

import com.leftoverlift.user.VendorProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingCategory category;

    /** Stored as "SPICY,VEGETARIAN"; use getDietaryTags / setDietaryTags for the typed view. */
    @Column(name = "dietary_tags", nullable = false, length = 255)
    private String dietaryTagsCsv = "";

    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "rescue_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal rescuePrice;

    /** Derived from the two prices by {@link Pricing}; stored so browse can sort by "biggest saving". */
    @Column(name = "discount_percent", nullable = false)
    private int discountPercent;

    @Column(name = "quantity_total", nullable = false)
    private int quantityTotal;

    @Column(name = "quantity_remaining", nullable = false)
    private int quantityRemaining;

    @Column(name = "pickup_start", nullable = false)
    private Instant pickupStart;

    @Column(name = "pickup_end", nullable = false)
    private Instant pickupEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingStatus status = ListingStatus.AVAILABLE;

    /** Optimistic locking: two people claiming the last portion cannot both succeed (used in reservations). */
    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Set<DietaryTag> getDietaryTags() {
        return DietaryTags.parse(dietaryTagsCsv);
    }

    public void setDietaryTags(Set<DietaryTag> tags) {
        this.dietaryTagsCsv = DietaryTags.format(tags);
    }

    public void recalculate() {
        this.discountPercent = Pricing.discountPercent(originalPrice, rescuePrice);
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        recalculate();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        recalculate();
    }
}
