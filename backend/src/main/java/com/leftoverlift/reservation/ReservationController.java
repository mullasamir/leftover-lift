package com.leftoverlift.reservation;

import com.leftoverlift.common.PageResponse;
import com.leftoverlift.reservation.dto.ReservationRequest;
import com.leftoverlift.reservation.dto.ReservationResponse;
import com.leftoverlift.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** A customer's own reservations ("My rescues"). */
@RestController
@RequestMapping("/api/v1/reservations")
@PreAuthorize("hasRole('CONSUMER')")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse reserve(@AuthenticationPrincipal User user, @Valid @RequestBody ReservationRequest request) {
        return reservationService.reserve(user, request.listingId(), request.quantity());
    }

    @GetMapping
    public PageResponse<ReservationResponse> mine(@AuthenticationPrincipal User user,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "50") int size) {
        return reservationService.mine(user, page, size);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return reservationService.getMine(user, id);
    }

    @PostMapping("/{id}/cancel")
    public ReservationResponse cancel(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return reservationService.cancel(user, id);
    }
}
