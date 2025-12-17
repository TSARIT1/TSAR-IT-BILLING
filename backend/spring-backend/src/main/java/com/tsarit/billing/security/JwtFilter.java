package com.tsarit.billing.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.model.User;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
    	 try {
             String jwt = parseJwt(request);
             // 1. Check if Token exists and is valid
             if (jwt != null && jwtUtil.validateToken(jwt)) {
                 
                 // 2. Extract Email
                 String email = jwtUtil.getEmailFromToken(jwt);

                 // 3. Load User from DB
                 User user = userRepository.findByEmail(email).orElse(null);

                 // 4. THIS IS THE MISSING PART: Tell Spring Security the user is authenticated
                 if (user != null) {
                     // Create an Authentication Token (User, Password(null), Authorities)
                     UsernamePasswordAuthenticationToken authentication = 
                         new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>()); // Add Roles here if needed
                     
                     authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                     // Set the Authentication in the Context
                     SecurityContextHolder.getContext().setAuthentication(authentication);
                 }
             }
         } catch (Exception e) {
             System.out.println("Cannot set user authentication: " + e.getMessage());
         }

    	 filterChain.doFilter(request, response);
    }
    // Helper method to extract "Bearer "
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
