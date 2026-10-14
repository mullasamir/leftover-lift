package com.leftoverlift.reservation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByPickupCode(String pickupCode);

    boolean existsByListingIdAndCustomerIdAndStatus(UUID listingId, UUID customerId, ReservationStatus status);

    long countByListingIdAndStatus(UUID listingId, ReservationStatus status);

    long countByStatus(ReservationStatus status);

    @EntityGraph(attributePaths = {"listing", "listing.vendor"})
    Page<Reservation> findByCustomerId(UUID customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"listing", "listing.vendor"})
    Optional<Reservation> findWithListingById(UUID id);

    @Query("select r from Reservation r join fetch r.listing l join fetch r.customer "
            + "where r.pickupCode = :code and l.vendor.id = :vendorId")
    Optional<Reservation> findForVendorByCode(@Param("code") String code, @Param("vendorId") UUID vendorId);

    @Query("select r from Reservation r join fetch r.listing l join fetch r.customer "
            + "where l.vendor.id = :vendorId and r.status = :status order by l.pickupEnd asc, r.createdAt asc")
    List<Reservation> findForVendorByStatus(@Param("vendorId") UUID vendorId,
                                            @Param("status") ReservationStatus status, Pageable pageable);

    @Query("select coalesce(sum(r.quantity), 0L) from Reservation r where r.status = :status")
    long sumQuantityByStatus(@Param("status") ReservationStatus status);

    /** Used when a vendor cancels a listing: everyone holding a reservation for it is released. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE reservations SET status = 'CANCELLED', cancelled_at = now(), version = version + 1 "
            + "WHERE listing_id = :listingId AND status = 'RESERVED'", nativeQuery = true)
    int cancelActiveForListing(@Param("listingId") UUID listingId);

    /** Reservations nobody collected before the pickup window closed become no-shows. */
    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE reservations r SET status = 'EXPIRED', version = r.version + 1 "
            + "FROM listings l WHERE r.listing_id = l.id AND r.status = 'RESERVED' AND l.pickup_end < now()",
            nativeQuery = true)
    int expireEnded();
}
