package com.leftoverlift.listing;

import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.dto.ListingRequest;
import com.leftoverlift.listing.dto.ListingResponse;
import com.leftoverlift.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** A vendor's own listings. Enforced twice: by URL rule in SecurityConfig and by method security here. */
@RestController
@RequestMapping("/api/v1/vendor/listings")
@PreAuthorize("hasRole('VENDOR')")
public class VendorListingController {

    private final ListingService listingService;

    public VendorListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListingResponse create(@AuthenticationPrincipal User user, @Valid @RequestBody ListingRequest request) {
        return listingService.create(user, request);
    }

    @GetMapping
    public PageResponse<ListingResponse> mine(@AuthenticationPrincipal User user,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "50") int size) {
        return listingService.mine(user, page, size);
    }

    @GetMapping("/{id}")
    public ListingResponse get(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return listingService.getOwned(user, id);
    }

    @PutMapping("/{id}")
    public ListingResponse update(@AuthenticationPrincipal User user, @PathVariable UUID id,
                                  @Valid @RequestBody ListingRequest request) {
        return listingService.update(user, id, request);
    }

    @PostMapping("/{id}/cancel")
    public ListingResponse cancel(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return listingService.cancel(user, id);
    }
}
