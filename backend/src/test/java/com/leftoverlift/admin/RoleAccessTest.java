package com.leftoverlift.admin;

import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.ListingController;
import com.leftoverlift.listing.ListingService;
import com.leftoverlift.listing.VendorListingController;
import com.leftoverlift.reservation.ReservationController;
import com.leftoverlift.reservation.ReservationService;
import com.leftoverlift.reservation.VendorReservationController;
import com.leftoverlift.security.JwtService;
import com.leftoverlift.security.SecurityConfig;
import com.leftoverlift.stats.PublicStatsController;
import com.leftoverlift.listing.ListingRepository;
import com.leftoverlift.reservation.ReservationRepository;
import com.leftoverlift.user.VendorProfileRepository;
import java.time.Clock;
import com.leftoverlift.config.CorsProperties;
import com.leftoverlift.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Proves the role rules in SecurityConfig and the @PreAuthorize annotations actually hold. */
@WebMvcTest(controllers = {AdminController.class, VendorListingController.class, ListingController.class,
        ReservationController.class, VendorReservationController.class, PublicStatsController.class})
@Import({SecurityConfig.class, CorsProperties.class})
class RoleAccessTest {

    @Autowired MockMvc mvc;

    @MockitoBean AdminService adminService;
    @MockitoBean ListingService listingService;
    @MockitoBean ReservationService reservationService;
    @MockitoBean VendorProfileRepository vendorProfileRepository;
    @MockitoBean ListingRepository listingRepository;
    @MockitoBean ReservationRepository reservationRepository;
    @MockitoBean Clock clock;
    @MockitoBean UserRepository userRepository; // needed by the JWT filter built in SecurityConfig
    @MockitoBean JwtService jwtService;

    @Test
    void adminAreaRejectsAnonymousVisitorsWith401() throws Exception {
        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CONSUMER")
    void adminAreaRejectsCustomersWith403() throws Exception {
        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/stats")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "VENDOR")
    void adminAreaRejectsVendorsWith403() throws Exception {
        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminsCanListUsers() throws Exception {
        when(adminService.listUsers(any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true));

        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CONSUMER")
    void customersCannotUseTheVendorListingTools() throws Exception {
        mvc.perform(get("/api/v1/vendor/listings")).andExpect(status().isForbidden());
    }

    @Test
    void vendorListingToolsRequireSignIn() throws Exception {
        mvc.perform(get("/api/v1/vendor/listings")).andExpect(status().isUnauthorized());
    }

    @Test
    void browsingFoodIsOpenToEveryone() throws Exception {
        when(listingService.search(any())).thenReturn(new PageResponse<>(List.of(), 0, 12, 0, 0, true));

        mvc.perform(get("/api/v1/listings")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "VENDOR")
    void businessesCannotReserveFood() throws Exception {
        mvc.perform(get("/api/v1/reservations")).andExpect(status().isForbidden());
    }

    @Test
    void reservationsRequireSignIn() throws Exception {
        mvc.perform(get("/api/v1/reservations")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CONSUMER")
    void customersCannotUseThePickupDesk() throws Exception {
        mvc.perform(get("/api/v1/vendor/reservations")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CONSUMER")
    void customersCanViewTheirOwnRescues() throws Exception {
        when(reservationService.mine(any(), anyInt(), anyInt())).thenReturn(new PageResponse<>(List.of(), 0, 50, 0, 0, true));

        mvc.perform(get("/api/v1/reservations")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "VENDOR")
    void businessesCannotSeeTheOwnersOverview() throws Exception {
        mvc.perform(get("/api/v1/admin/vendors")).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/listings")).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/reservations")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CONSUMER")
    void customersCannotCancelOtherPeoplesFoodOrPickups() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/v1/admin/listings/" + java.util.UUID.randomUUID() + "/cancel")).andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/v1/admin/reservations/" + java.util.UUID.randomUUID() + "/collect")).andExpect(status().isForbidden());
    }

    @Test
    void theHomepageTotalsAreOpenToEveryone() throws Exception {
        mvc.perform(get("/api/v1/stats")).andExpect(status().isOk());
    }
}
