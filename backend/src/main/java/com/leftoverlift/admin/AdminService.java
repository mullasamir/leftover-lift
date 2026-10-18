package com.leftoverlift.admin;

import com.leftoverlift.admin.dto.AdminStatsResponse;
import com.leftoverlift.admin.dto.AdminUserResponse;
import com.leftoverlift.admin.dto.AdminVendorResponse;
import com.leftoverlift.auth.RefreshTokenService;
import com.leftoverlift.common.ApiException;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.contact.ContactMessage;
import com.leftoverlift.contact.ContactMessageRepository;
import com.leftoverlift.contact.dto.ContactMessageResponse;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingService;
import com.leftoverlift.listing.dto.ListingResponse;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.reservation.ReservationRepository;
import com.leftoverlift.reservation.ReservationService;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.reservation.dto.AdminReservationResponse;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.UserRepository;
import com.leftoverlift.user.VendorProfile;
import com.leftoverlift.user.VendorProfileRepository;
import com.leftoverlift.listing.ListingStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.Collection;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository users;
    private final ListingRepository listings;
    private final ReservationRepository reservations;
    private final RefreshTokenService refreshTokens;
    private final ContactMessageRepository contactMessages;
    private final VendorProfileRepository vendors;
    private final ListingService listingService;
    private final ReservationService reservationService;
    private final Clock clock;

    public AdminService(UserRepository users, ListingRepository listings, ReservationRepository reservations,
                        RefreshTokenService refreshTokens, ContactMessageRepository contactMessages,
                        VendorProfileRepository vendors, ListingService listingService,
                        ReservationService reservationService, Clock clock) {
        this.users = users;
        this.listings = listings;
        this.reservations = reservations;
        this.refreshTokens = refreshTokens;
        this.contactMessages = contactMessages;
        this.vendors = vendors;
        this.listingService = listingService;
        this.reservationService = reservationService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> listUsers(String q, Role role, int page, int size) {
        Specification<User> spec = (root, query, cb) -> cb.conjunction();
        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }
        if (q != null && !q.isBlank()) {
            String pattern = "%" + q.trim().toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.<String>get("fullName")), pattern, '\\'),
                    cb.like(cb.lower(root.<String>get("email")), pattern, '\\')));
        }
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100),
                Sort.by(Sort.Order.desc("createdAt")));
        return PageResponse.of(users.findAll(spec, pageable).map(AdminUserResponse::from));
    }

    @Transactional
    public AdminUserResponse setEnabled(User actor, UUID id, boolean enabled) {
        User target = users.findById(id).orElseThrow(() ->
                ApiException.notFound("USER_NOT_FOUND", "We couldn't find that account."));
        if (!enabled && target.getId().equals(actor.getId())) {
            throw ApiException.conflict("CANNOT_DISABLE_SELF", "You can't disable your own account.");
        }
        target.setEnabled(enabled);
        if (!enabled) {
            refreshTokens.revokeAll(target.getId()); // cut off any session they already have
        }
        return AdminUserResponse.from(target);
    }

    // ------------------------------------------------------------------ businesses

    @Transactional(readOnly = true)
    public PageResponse<AdminVendorResponse> listVendors(String q, int page, int size) {
        Specification<VendorProfile> spec = (root, query, cb) -> cb.conjunction();
        if (q != null && !q.isBlank()) {
            String pattern = "%" + q.trim().toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.<String>get("businessName")), pattern, '\\'),
                    cb.like(cb.lower(root.<String>get("city")), pattern, '\\'),
                    cb.like(cb.lower(root.join("user").<String>get("email")), pattern, '\\')));
        }
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50),
                Sort.by(Sort.Order.desc("createdAt")));
        var result = vendors.findAll(spec, pageable);

        List<UUID> ids = result.getContent().stream().map(VendorProfile::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(result.map(v -> AdminVendorResponse.from(v, 0, 0, 0, BigDecimal.ZERO)));
        }
        Map<UUID, Long> posted = longs(listings.countPostedByVendors(ids));
        Map<UUID, Long> live = longs(listings.countLiveByVendors(ids, ListingStatus.AVAILABLE, clock.instant()));
        Map<UUID, Long> rescued = new HashMap<>();
        Map<UUID, BigDecimal> revenue = new HashMap<>();
        for (Object[] row : reservations.totalsByVendors(ids, ReservationStatus.COLLECTED)) {
            rescued.put((UUID) row[0], ((Number) row[1]).longValue());
            revenue.put((UUID) row[0], (BigDecimal) row[2]);
        }
        return PageResponse.of(result.map(v -> AdminVendorResponse.from(v,
                posted.getOrDefault(v.getId(), 0L), live.getOrDefault(v.getId(), 0L),
                rescued.getOrDefault(v.getId(), 0L), revenue.getOrDefault(v.getId(), BigDecimal.ZERO))));
    }

    private static Map<UUID, Long> longs(List<Object[]> rows) {
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((UUID) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }

    // ------------------------------------------------------------------ food and pickups

    public PageResponse<ListingResponse> listFood(ListingStatus status, String q, int page, int size) {
        return listingService.adminSearch(status, q, page, size);
    }

    public ListingResponse cancelListing(UUID id) {
        return listingService.adminCancel(id);
    }

    public PageResponse<AdminReservationResponse> listPickups(Collection<ReservationStatus> statuses, int page, int size) {
        return reservationService.adminList(statuses, page, size);
    }

    public AdminReservationResponse cancelPickup(UUID id) {
        return reservationService.adminCancel(id);
    }

    public AdminReservationResponse collectPickup(UUID id) {
        return reservationService.adminCollect(id);
    }

    // ------------------------------------------------------------------ inbox

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> listMessages(Boolean handled, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50),
                Sort.by(Sort.Order.desc("createdAt")));
        var result = handled == null ? contactMessages.findAll(pageable) : contactMessages.findByHandled(handled, pageable);
        return PageResponse.of(result.map(ContactMessageResponse::from));
    }

    @Transactional
    public ContactMessageResponse setHandled(UUID id, boolean handled) {
        ContactMessage message = contactMessages.findById(id).orElseThrow(() ->
                ApiException.notFound("MESSAGE_NOT_FOUND", "We couldn't find that message."));
        message.setHandled(handled);
        return ContactMessageResponse.from(message);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        Map<Role, Long> byRole = new EnumMap<>(Role.class);
        long total = 0;
        for (Role role : Role.values()) {
            long count = users.countByRole(role);
            byRole.put(role, count);
            total += count;
        }
        Map<ListingStatus, Long> byStatus = new EnumMap<>(ListingStatus.class);
        for (ListingStatus status : ListingStatus.values()) {
            byStatus.put(status, listings.countByStatus(status));
        }
        Map<ReservationStatus, Long> byReservation = new EnumMap<>(ReservationStatus.class);
        for (ReservationStatus status : ReservationStatus.values()) {
            byReservation.put(status, reservations.countByStatus(status));
        }
        long rescued = reservations.sumQuantityByStatus(ReservationStatus.COLLECTED);
        BigDecimal revenue = reservations.sumRevenueByStatus(ReservationStatus.COLLECTED);
        return new AdminStatsResponse(total, byRole, byStatus, byReservation, rescued,
                revenue == null ? BigDecimal.ZERO : revenue, vendors.count(), contactMessages.countByHandled(false));
    }
}
