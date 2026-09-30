package com.tsarit.billing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tsarit.billing.model.*;
import com.tsarit.billing.repository.*;
import com.tsarit.billing.security.JwtUtil;
import com.tsarit.billing.service.AuditService;
import com.tsarit.billing.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.Spy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Isolated HTTP contract tests: no live database, OTP provider, or customer data. */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    @Mock UserRepository users;
    @Mock BusinessRepository businesses;
    @Mock UserBusinessRepository memberships;
    @Mock GodownRepository godowns;
    @Mock SubscriptionService subscriptions;
    @Mock AuditService auditService;
    @Mock JwtUtil jwt;
    @Spy PasswordEncoder encoder = new BCryptPasswordEncoder();
    @InjectMocks AuthController controller;
    MockMvc http;
    ObjectMapper json = new ObjectMapper();

    @BeforeEach void setup() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        http = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @org.junit.jupiter.api.AfterEach void clearSession() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    private void authenticate(String id) {
        User user = new User(); user.setId(id);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(user, null, List.of()));
    }

    @Test void passwordIsAcceptedButNeverSerialized() throws Exception {
        User user = json.readValue("{\"password\":\"Dummy password 123\"}", User.class);
        assertEquals("Dummy password 123", user.getPassword());
        assertFalse(json.readTree(json.writeValueAsString(user)).has("password"));
    }

    @Test void mobileOnlyAccountsKeepOptionalEmailNullAndPasswordHashIntact() throws Exception {
        when(users.save(any())).thenAnswer(i -> i.getArgument(0));
        when(businesses.save(any())).thenAnswer(i -> i.getArgument(0));
        when(memberships.save(any())).thenAnswer(i -> { UserBusiness ub = i.getArgument(0); ub.setId(UUID.randomUUID().toString()); return ub; });
        when(jwt.generateToken(anyString())).thenReturn("isolated-test-token");
        for (String mobile : List.of("9000000001", "9000000002")) {
            http.perform(post("/api/auth/register").contentType("application/json").content(json.writeValueAsString(Map.of(
                "mobileNo", mobile, "email", "  ", "ownerName", "Dummy Owner", "businessName", "Test Business", "password", "Dummy password 123"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.role").value("TENANT_OWNER"));
        }
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users, times(2)).save(captor.capture());
        for (User user : captor.getAllValues()) {
            assertNull(user.getEmail());
            assertTrue(encoder.matches("Dummy password 123", user.getPassword()));
        }
    }

    @Test void normalizedEmailCannotBypassDuplicateCheck() throws Exception {
        when(users.findByEmailIgnoreCase("dummy@example.invalid")).thenReturn(Optional.of(new User()));
        http.perform(post("/api/auth/register").contentType("application/json")
            .content("{\"email\":\"  Dummy@Example.Invalid  \"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Email already exists"));
        verify(users, never()).save(any());
    }

    @Test void repeatedLoginTrimsIdentifierButPreservesPasswordWhitespace() throws Exception {
        User user = new User(); user.setId("dummy-user"); user.setMobileNo("9000000001");
        user.setPassword(encoder.encode(" password 123 "));
        Business business = new Business(); business.setId("dummy-business");
        UserBusiness membership = new UserBusiness(); membership.setBusiness(business);
        when(users.findByMobileNo("9000000001")).thenReturn(Optional.of(user));
        when(memberships.findByUserId("dummy-user")).thenReturn(List.of(membership));
        when(subscriptions.getCurrentTenantUsage("dummy-business")).thenReturn(Map.of());
        when(jwt.generateToken("9000000001")).thenReturn("isolated-test-token");
        for (int i = 0; i < 2; i++) {
            http.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"mobileNo\":\" 9000000001 \",\"password\":\" password 123 \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.password").doesNotExist());
            assertTrue(encoder.matches(" password 123 ", user.getPassword()));
        }
    }

    @Test void profileResponseDoesNotEraseStoredPassword() throws Exception {
        authenticate("dummy-user");
        User user = new User(); user.setPassword("hash-to-preserve");
        when(users.findById("dummy-user")).thenReturn(Optional.of(user));
        http.perform(get("/api/auth/profile/dummy-user")).andExpect(status().isOk())
            .andExpect(jsonPath("$.password").doesNotExist());
        assertEquals("hash-to-preserve", user.getPassword());
    }

    @Test void anotherAccountCannotReadOrChangeProfile() throws Exception {
        authenticate("different-user");
        http.perform(get("/api/auth/profile/dummy-user")).andExpect(status().isForbidden());
        http.perform(put("/api/auth/profile/dummy-user").contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
        verifyNoInteractions(users);
    }

    @Test void ordinaryAccountCannotListAllUsers() throws Exception {
        authenticate("dummy-user");
        http.perform(get("/api/auth/users")).andExpect(status().isForbidden());
        verifyNoInteractions(users);
    }

    @Test void profileRequiresAuthentication() throws Exception {
        http.perform(get("/api/auth/profile/dummy-user")).andExpect(status().isUnauthorized());
        verifyNoInteractions(users);
    }

    @Test void forgotPasswordNormalizesEmailAndDoesNotReturnOtp() throws Exception {
        User user = new User(); user.setEmail("dummy@example.invalid"); user.setMobileNo("9000000001");
        when(users.findByEmailIgnoreCase("dummy@example.invalid")).thenReturn(Optional.of(user));
        http.perform(post("/api/auth/forgot-password").contentType("application/json")
            .content("{\"identifier\":\"  Dummy@Example.Invalid  \"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.identifier").value("dummy@example.invalid"))
            .andExpect(jsonPath("$.otp").doesNotExist());
    }

    @Test void resetPasswordRejectsWeakPasswordBeforeChangingAccount() throws Exception {
        http.perform(post("/api/auth/reset-password").contentType("application/json")
            .content("{\"identifier\":\"dummy@example.invalid\",\"otp\":\"123456\",\"newPassword\":\"short\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Password must be at least 8 characters"));
        verify(users, never()).save(any());
    }
}
