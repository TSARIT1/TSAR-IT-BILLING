package com.tsarit.billing.security;

import com.tsarit.billing.model.User;
import com.tsarit.billing.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SecurityBoundaryTest.Probe.class)
@Import({SecurityConfig.class, JwtFilter.class, SecurityBoundaryTest.Probe.class})
class SecurityBoundaryTest {
    @Autowired MockMvc http;
    @MockBean JwtUtil jwt;
    @MockBean UserRepository users;

    @RestController static class Probe {
        @GetMapping("/api/security-probe") String protectedEndpoint() { return "ok"; }
        @PostMapping("/api/auth/login") String login() { return "public"; }
    }

    @Test void missingTokenCannotReachBusinessEndpoints() throws Exception {
        http.perform(get("/api/security-probe")).andExpect(status().isUnauthorized());
    }

    @Test void loginRemainsPublic() throws Exception {
        http.perform(post("/api/auth/login")).andExpect(status().isOk());
    }

    @Test void invalidTokenIsRejected() throws Exception {
        http.perform(get("/api/security-probe").header("Authorization", "Bearer invalid"))
            .andExpect(status().isUnauthorized());
    }

    @Test void validTokenForExistingUserIsAccepted() throws Exception {
        when(jwt.validateToken("test-token")).thenReturn(true);
        when(jwt.getEmailFromToken("test-token")).thenReturn("Dummy@Example.Invalid");
        when(users.findByEmailIgnoreCase("Dummy@Example.Invalid")).thenReturn(Optional.of(new User()));
        http.perform(get("/api/security-probe").header("Authorization", "Bearer test-token"))
            .andExpect(status().isOk());
    }
}
