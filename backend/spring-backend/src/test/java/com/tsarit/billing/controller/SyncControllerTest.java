package com.tsarit.billing.controller;

import com.tsarit.billing.model.*;
import com.tsarit.billing.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SyncControllerTest {
    @Mock ProductRepository products;
    @Mock CustomerRepository customers;
    @Mock UserBusinessRepository memberships;
    @Mock SaleRepository sales;
    @Mock InvoiceRepository invoices;
    @InjectMocks SyncController controller;
    MockMvc http;

    @BeforeEach void setup() {
        SecurityContextHolder.clearContext();
        http = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @AfterEach void clearSession() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate() {
        User user = new User();
        user.setId("user-one");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        Business business = new Business();
        business.setId("business-one");
        business.setBusinessName("Own Business");
        UserBusiness membership = new UserBusiness();
        membership.setUser(user);
        membership.setBusiness(business);
        when(memberships.findByUserId("user-one")).thenReturn(List.of(membership));
    }

    @Test void allSyncEndpointsRequireAuthenticatedUser() throws Exception {
        http.perform(get("/api/v1/sync/pull")).andExpect(status().isUnauthorized());
        http.perform(get("/api/v1/sync/status")).andExpect(status().isUnauthorized());
        http.perform(post("/api/v1/sync/push")).andExpect(status().isUnauthorized());
        verifyNoInteractions(products, customers, memberships, sales, invoices);
    }

    @Test void defaultPullUsesMembershipAndOnlyQueriesThatBusiness() throws Exception {
        authenticate();
        Product product = new Product();
        product.setId(11L);
        product.setProductName("Own Product");
        Customer customer = new Customer();
        customer.setId(21L);
        customer.setName("Own Customer");
        when(products.findForSyncByBusinessId("business-one")).thenReturn(List.of(product));
        when(customers.findByBusinessId("business-one")).thenReturn(List.of(customer));

        http.perform(get("/api/v1/sync/pull"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.business.id").value("business-one"))
                .andExpect(jsonPath("$.products.length()").value(1))
                .andExpect(jsonPath("$.products[0].productName").value("Own Product"))
                .andExpect(jsonPath("$.customers[0].name").value("Own Customer"));
        verify(products).findForSyncByBusinessId("business-one");
        verify(customers).findByBusinessId("business-one");
        verifyNoMoreInteractions(products, customers);
        verifyNoInteractions(sales, invoices);
    }

    @Test void arbitraryBusinessCannotBePulledCountedOrPushed() throws Exception {
        authenticate();
        http.perform(get("/api/v1/sync/pull").param("businessId", "business-two"))
                .andExpect(status().isForbidden());
        http.perform(get("/api/v1/sync/status").param("businessId", "business-two"))
                .andExpect(status().isForbidden());
        http.perform(post("/api/v1/sync/push").contentType("application/json")
                        .content("{\"businessId\":\"business-two\",\"deviceId\":\"test-device\"}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(products, customers, sales, invoices);
    }

    @Test void accountWithoutMembershipCannotUseGlobalFallback() throws Exception {
        authenticate();
        when(memberships.findByUserId("user-one")).thenReturn(List.of());
        http.perform(get("/api/v1/sync/pull")).andExpect(status().isForbidden());
        verifyNoInteractions(products, customers, sales, invoices);
    }

    @Test void statusCountsOnlyTheAuthenticatedBusiness() throws Exception {
        authenticate();
        when(products.countForSyncByBusinessId("business-one")).thenReturn(2L);
        when(customers.countByBusinessId("business-one")).thenReturn(3L);
        when(sales.countByCustomerBusinessId("business-one")).thenReturn(4L);
        when(invoices.countByCustomer_BusinessId("business-one")).thenReturn(5L);
        http.perform(get("/api/v1/sync/status").param("businessId", " business-one "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessId").value("business-one"))
                .andExpect(jsonPath("$.productsCount").value(2))
                .andExpect(jsonPath("$.customersCount").value(3))
                .andExpect(jsonPath("$.salesCount").value(4))
                .andExpect(jsonPath("$.invoicesCount").value(5));
        verify(products).countForSyncByBusinessId("business-one");
        verify(customers).countByBusinessId("business-one");
        verify(sales).countByCustomerBusinessId("business-one");
        verify(invoices).countByCustomer_BusinessId("business-one");
        verifyNoMoreInteractions(products, customers, sales, invoices);
    }
}
