package com.leftoverlift.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface VendorProfileRepository extends JpaRepository<VendorProfile, UUID>, JpaSpecificationExecutor<VendorProfile> {

    // The owner is always shown next to the business, so fetch both in one query.
    @Override
    @EntityGraph(attributePaths = "user")
    Page<VendorProfile> findAll(Specification<VendorProfile> spec, Pageable pageable);


    Optional<VendorProfile> findByUserId(UUID userId);
}
