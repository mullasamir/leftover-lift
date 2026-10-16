package com.leftoverlift.reservation;

import com.leftoverlift.reservation.dto.CollectRequest;
import com.leftoverlift.reservation.dto.VendorReservationResponse;
import com.leftoverlift.reservation.dto.VendorStatsResponse;
import com.leftoverlift.user.User;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The business side of pickups. */
@RestController
@RequestMapping("/api/v1/vendor/reservations")
@PreAuthorize("hasRole('VENDOR')")
public class VendorReservationController {

    private final ReservationService reservationService;

    public VendorReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /** Orders still waiting to be collected. */
    @GetMapping
    public List<VendorReservationResponse> waiting(@AuthenticationPrincipal User user) {
        return reservationService.waiting(user);
    }

    /** Totals for the business's impact card. */
    @GetMapping("/stats")
    public VendorStatsResponse stats(@AuthenticationPrincipal User user) {
        return reservationService.stats(user);
    }

    @PostMapping("/collect")
    public VendorReservationResponse collect(@AuthenticationPrincipal User user, @Valid @RequestBody CollectRequest request) {
        return reservationService.collect(user, request.pickupCode());
    }
}
