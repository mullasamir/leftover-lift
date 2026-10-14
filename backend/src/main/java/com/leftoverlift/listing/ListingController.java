package com.leftoverlift.listing;

import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.dto.ListingResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/** Public browsing: no sign-in needed to see what is available. */
@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public PageResponse<ListingResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ListingCategory category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minDiscount,
            @RequestParam(defaultValue = "CLOSING") ListingSort sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return listingService.search(new ListingSearch(q, category, city, minDiscount, sort, page, size));
    }

    @GetMapping("/{id}")
    public ListingResponse get(@PathVariable UUID id) {
        return listingService.getPublic(id);
    }
}
