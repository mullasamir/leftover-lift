package com.leftoverlift.admin;

import com.leftoverlift.admin.dto.AdminStatsResponse;
import com.leftoverlift.admin.dto.AdminUserResponse;
import com.leftoverlift.admin.dto.AdminVendorResponse;
import com.leftoverlift.listing.ListingStatus;
import com.leftoverlift.listing.dto.ListingResponse;
import com.leftoverlift.reservation.ReservationStatus;
import com.leftoverlift.reservation.dto.AdminReservationResponse;
import com.leftoverlift.admin.dto.SetEnabledRequest;
import com.leftoverlift.admin.dto.SetHandledRequest;
import com.leftoverlift.contact.dto.ContactMessageResponse;
import com.leftoverlift.common.PageResponse;
import com.leftoverlift.user.Role;
import com.leftoverlift.user.User;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** Administrator tools. Enforced twice: by URL rule in SecurityConfig and by method security here. */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public PageResponse<AdminUserResponse> users(@RequestParam(required = false) String q,
                                                 @RequestParam(required = false) Role role,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return adminService.listUsers(q, role, page, size);
    }

    @PatchMapping("/users/{id}/enabled")
    public AdminUserResponse setEnabled(@AuthenticationPrincipal User actor, @PathVariable UUID id,
                                        @Valid @RequestBody SetEnabledRequest request) {
        return adminService.setEnabled(actor, id, request.enabled());
    }

    @GetMapping("/vendors")
    public PageResponse<AdminVendorResponse> vendors(@RequestParam(required = false) String q,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return adminService.listVendors(q, page, size);
    }

    @GetMapping("/listings")
    public PageResponse<ListingResponse> listings(@RequestParam(required = false) ListingStatus status,
                                                  @RequestParam(required = false) String q,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        return adminService.listFood(status, q, page, size);
    }

    @PostMapping("/listings/{id}/cancel")
    public ListingResponse cancelListing(@PathVariable UUID id) {
        return adminService.cancelListing(id);
    }

    @GetMapping("/reservations")
    public PageResponse<AdminReservationResponse> reservations(@RequestParam(required = false) List<ReservationStatus> status,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size) {
        return adminService.listPickups(status, page, size);
    }

    @PostMapping("/reservations/{id}/cancel")
    public AdminReservationResponse cancelReservation(@PathVariable UUID id) {
        return adminService.cancelPickup(id);
    }

    @PostMapping("/reservations/{id}/collect")
    public AdminReservationResponse collectReservation(@PathVariable UUID id) {
        return adminService.collectPickup(id);
    }

    @GetMapping("/messages")
    public PageResponse<ContactMessageResponse> messages(@RequestParam(required = false) Boolean handled,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        return adminService.listMessages(handled, page, size);
    }

    @PatchMapping("/messages/{id}/handled")
    public ContactMessageResponse setHandled(@PathVariable UUID id, @Valid @RequestBody SetHandledRequest request) {
        return adminService.setHandled(id, request.handled());
    }

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return adminService.stats();
    }
}
