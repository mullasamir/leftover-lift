package com.leftoverlift.admin;

import com.leftoverlift.admin.dto.AdminStatsResponse;
import com.leftoverlift.admin.dto.AdminUserResponse;
import com.leftoverlift.auth.RefreshTokenService;
import com.leftoverlift.common.ApiException;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import com.leftoverlift.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository users;
    private final ListingRepository listings;
    private final RefreshTokenService refreshTokens;

    public AdminService(UserRepository users, ListingRepository listings, RefreshTokenService refreshTokens) {
        this.users = users;
        this.listings = listings;
        this.refreshTokens = refreshTokens;
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
        return new AdminStatsResponse(total, byRole, byStatus);
    }
}
