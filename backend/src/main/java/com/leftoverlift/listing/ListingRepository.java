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

    @Modifying
    @Query("update Listing l set l.status = :target where l.status in :current and l.pickupEnd < :now")
    int expire(@Param("target") ListingStatus target,
               @Param("current") Collection<ListingStatus> current,
               @Param("now") Instant now);
}
