package com.leftoverlift.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VendorProfileRepository extends JpaRepository<VendorProfile, UUID> {

    Optional<VendorProfile> findByUserId(UUID userId);
}
