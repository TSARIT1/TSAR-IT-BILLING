package com.tsarit.billing.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.tsarit.billing.model.User;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

 // ----------------------- REGISTER -----------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
    	// Email uniqueness
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
        }

        // Mobile uniqueness
        if (userRepository.findByMobileNo(user.getMobileNo()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Mobile number already exists"));
        }

        // Basic required field validation
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password is required"));
        }

        if (user.getOwnerName() == null || user.getOwnerName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Owner name is required"));
        }

        if (user.getBusinessName() == null || user.getBusinessName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Business name is required"));
        }
        
        String userId = "USR-" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        user.setId(userId);
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user
        User savedUser = userRepository.save(user);

        // Hide password in response
        savedUser.setPassword(null);

        return ResponseEntity.ok(savedUser);
    }

 // ----------------------- LOGIN -----------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

    	String username = loginRequest.get("username"); // email or mobile
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username and password are required"));
        }

        User user;

        // Check if input is email or mobile
        if (username.contains("@")) {
            user = userRepository.findByEmail(username).orElse(null);
        } else {
            user = userRepository.findByMobileNo(username).orElse(null);
        }

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid email/mobile or password"));
        }

        String token = jwtUtil.generateToken(user.getMobileNo());

        user.setPassword(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("token", token);
        response.put("user", user);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }
}
