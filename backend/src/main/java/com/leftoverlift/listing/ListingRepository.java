package com.leftoverlift.listing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID>, JpaSpecificationExecutor<Listing> {

    // The vendor is always shown with a listing, so fetch it in the same query instead of one query per row.
    @Override
    @EntityGraph(attributePaths = "vendor")
    Page<Listing> findAll(Specification<Listing> spec, Pageable pageable);

    @EntityGraph(attributePaths = "vendor")
    Optional<Listing> findWithVendorById(UUID id);

    @EntityGraph(attributePaths = "vendor")
    Page<Listing> findByVendorId(UUID vendorId, Pageable pageable);

    long countByStatus(ListingStatus status);

    // ------------------------------------------------------------------------------------------
    // Stock changes are single SQL statements, never "read the number, then write it back".
    // The WHERE clause is the guard: if two people race for the last portion, PostgreSQL makes the
    // second UPDATE wait for the first, re-checks the condition, and updates zero rows. Overselling
    // is impossible no matter how many requests arrive at once. Each statement also bumps `version`,
    // so a vendor editing the same listing at that moment gets a conflict instead of a silent overwrite.
    // ------------------------------------------------------------------------------------------

    /** Takes portions off the shelf. Returns 1 on success, 0 if they are gone or the window has closed. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE listings SET quantity_remaining = quantity_remaining - :qty, version = version + 1, updated_at = now() "
            + "WHERE id = :id AND status = 'AVAILABLE' AND quantity_remaining >= :qty AND pickup_end > now()", nativeQuery = true)
    int claimPortions(@Param("id") UUID id, @Param("qty") int qty);

    /** Flips a listing to SOLD_OUT once the last portion is taken. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE listings SET status = 'SOLD_OUT', version = version + 1, updated_at = now() "
            + "WHERE id = :id AND status = 'AVAILABLE' AND quantity_remaining = 0", nativeQuery = true)
    int markSoldOutIfEmpty(@Param("id") UUID id);

    /** Puts cancelled portions back on the shelf, never beyond the original total. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE listings SET quantity_remaining = quantity_remaining + :qty, version = version + 1, updated_at = now() "
            + "WHERE id = :id AND status IN ('AVAILABLE', 'SOLD_OUT') AND quantity_remaining + :qty <= quantity_total "
            + "AND pickup_end > now()", nativeQuery = true)
    int releasePortions(@Param("id") UUID id, @Param("qty") int qty);

    /** A sold-out listing that has stock again goes back on sale. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE listings SET status = 'AVAILABLE', version = version + 1, updated_at = now() "
            + "WHERE id = :id AND status = 'SOLD_OUT' AND quantity_remaining > 0 AND pickup_end > now()", nativeQuery = true)
    int reopenIfStocked(@Param("id") UUID id);

    @Modifying
    @Query("update Listing l set l.status = :target where l.status in :current and l.pickupEnd < :now")
    int expire(@Param("target") ListingStatus target,
               @Param("current") Collection<ListingStatus> current,
               @Param("now") Instant now);
}
