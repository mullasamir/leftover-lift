package com.leftoverlift.admin;

import com.leftoverlift.common.PageResponse;
import com.leftoverlift.listing.ListingController;
import com.leftoverlift.listing.ListingService;
import com.leftoverlift.listing.VendorListingController;
import com.leftoverlift.security.JwtService;
import com.leftoverlift.security.SecurityConfig;
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
@WebMvcTest(controllers = {AdminController.class, VendorListingController.class, ListingController.class})
@Import(SecurityConfig.class)
class RoleAccessTest {

    @Autowired MockMvc mvc;

    @MockitoBean AdminService adminService;
    @MockitoBean ListingService listingService;
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
}
