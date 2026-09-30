package com.tsarit.billing.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.tsarit.billing.model.User;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.UserRole;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.GodownRepository;
import com.tsarit.billing.service.AuditService;
import com.tsarit.billing.service.SubscriptionService;
import com.tsarit.billing.service.SmsGatewayService;
import com.tsarit.billing.service.WhatsAppCloudService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {
    private static final SecureRandom OTP_RANDOM = new SecureRandom();
    private static final java.time.Duration OTP_TTL = java.time.Duration.ofMinutes(10);

    private record OtpChallenge(String code, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private User currentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User user ? user : null;
    }

    private void requireOwnAccount(String userId) {
        User user = currentUser();
        if (user == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        if (!java.util.Objects.equals(user.getId(), userId))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    @Autowired
    private AuditService auditService;

    @Autowired
    private WhatsAppCloudService whatsappCloudService;

    @Autowired(required = false)
    private SmsGatewayService smsGatewayService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private BusinessRepository businessRepository;
    @Autowired
    private UserBusinessRepository userBusinessRepository;
    @Autowired
    private SubscriptionService subscriptionService;
    @Autowired(required = false)
    private GodownRepository godownRepository;

 // ----------------------- REGISTER -----------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Registration is intentionally friction-free: only a mobile OR email plus a
        // password are hard requirements (login identity + security). Everything else
        // is optional and auto-defaulted so no user is ever blocked from signing up.
        user.setEmail(user.getEmail() == null || user.getEmail().isBlank()
                ? null : user.getEmail().trim().toLowerCase(java.util.Locale.ROOT));
        // Email uniqueness (case-insensitive)
        if (user.getEmail() != null && !user.getEmail().isBlank() && userRepository.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
        }

        if (user.getMobileNo() != null && !user.getMobileNo().isBlank()) {
            user.setMobileNo(user.getMobileNo().trim());
            if (!user.getMobileNo().matches("^[6-9]\\d{9}$")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Enter a valid 10-digit Indian mobile number"));
            }
            if (userRepository.findByMobileNo(user.getMobileNo()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Mobile number already exists"));
            }
        } else {
            user.setMobileNo(null);
        }

        if ((user.getMobileNo() == null || user.getMobileNo().isBlank())
                && (user.getEmail() == null || user.getEmail().isBlank())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Provide a mobile number or an email so you can sign in"));
        }

        // Basic required field validation
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password is required"));
        }

        if (user.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 8 characters"));
        }

        // Optional identity fields — defaulted instead of rejected.
        if (user.getOwnerName() == null || user.getOwnerName().isBlank()) {
            user.setOwnerName("Business Owner");
        }

        if (user.getBusinessName() == null || user.getBusinessName().isBlank()) {
            user.setBusinessName(user.getOwnerName() + "'s Business");
        }
        
        String userId = "USR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        user.setId(userId);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Capture transient fields BEFORE save — the managed entity returned by JPA
        // does not carry @Transient values.
        String industrySelection = user.getIndustryType();
        User savedUser = userRepository.save(user);

        // 1. Automatically Provision Tenant Business
        Business business = new Business();
        business.setId("BIZ-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10));
        business.setBusinessName(savedUser.getBusinessName());
        business.setEmail(savedUser.getEmail());
        business.setPhoneNo(savedUser.getMobileNo());
        if (industrySelection != null && !industrySelection.isBlank()) {
            business.setIndustryType(industrySelection);
        }
        Business savedBusiness = businessRepository.save(business);

        // 2. Automatically Link User to Business with Role TENANT_OWNER
        UserBusiness userBusiness = new UserBusiness();
        userBusiness.setUser(savedUser);
        userBusiness.setBusiness(savedBusiness);
        userBusiness.setRole(UserRole.TENANT_OWNER);
        UserBusiness savedUserBusiness = userBusinessRepository.save(userBusiness);

        // 3. Automatically Activate 15-Day Enterprise Free Trial
        subscriptionService.provisionFreeTrial(savedBusiness.getId());

        // 4. Automatically Create Default Godown
        if (godownRepository != null) {
            try {
                Godown defaultGodown = new Godown();
                defaultGodown.setGodownName("Main Warehouse / Store");
                defaultGodown.setLocation("Head Office");
                defaultGodown.setUserBusiness(savedUserBusiness);
                godownRepository.save(defaultGodown);
            } catch (Exception ignored) {}
        }

        // Generate JWT Token
        String subject = savedUser.getMobileNo() != null && !savedUser.getMobileNo().isBlank() ? savedUser.getMobileNo() : savedUser.getEmail();
        String token = jwtUtil.generateToken(subject);


        Map<String, Object> response = new HashMap<>();
        response.put("userId", savedUser.getId());
        response.put("businessId", savedBusiness.getId());
        response.put("userBusinessId", savedUserBusiness.getId());
        response.put("businessName", savedBusiness.getBusinessName());
        response.put("ownerName", savedUser.getOwnerName());
        response.put("role", "TENANT_OWNER");
        response.put("userRole", "TENANT_OWNER");
        response.put("activePlan", "15 Days Free Trial");
        response.put("trialDaysRemaining", 15);
        response.put("token", token);
        response.put("user", savedUser);
        response.put("message", "Tenant business account registered successfully!");

        return ResponseEntity.ok(response);
    }

 // ----------------------- LOGIN -----------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {

        String username = loginRequest.get("username");
        if (username == null || username.isBlank()) {
            username = loginRequest.get("email");
        }
        if (username == null || username.isBlank()) {
            username = loginRequest.get("mobileNo");
        }
        if (username == null || username.isBlank()) {
            username = loginRequest.get("phone");
        }
        if (username == null || username.isBlank()) {
            username = loginRequest.get("mobile");
        }

        String password = loginRequest.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username/email/mobile and password are required"));
        }

        final String loginId = username.trim();
        User user = null;

        // Check if input looks like email
        if (loginId.contains("@")) {
            // Case-insensitive email lookup
            user = userRepository.findByEmailIgnoreCase(loginId).orElse(null);
        } else {
            // Try mobile number first
            user = userRepository.findByMobileNo(loginId).orElse(null);
            // If not found by mobile, try username/ownerName field (the DB user_name column)
            if (user == null) {
                user = userRepository.findAll().stream()
                    .filter(u -> loginId.equalsIgnoreCase(u.getOwnerName()))
                    .findFirst().orElse(null);
            }
        }
        // Final fallback: try both
        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(loginId)
                    .or(() -> userRepository.findByMobileNo(loginId))
                    .orElse(null);
        }

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid email/mobile or password"));
        }

        // Super-admin killswitch: frozen tenant businesses cannot log in.
        List<UserBusiness> preCheck = userBusinessRepository.findByUserId(user.getId());
        boolean frozen = preCheck.stream()
                .anyMatch(ub -> ub.getBusiness() != null && Boolean.TRUE.equals(ub.getBusiness().getIsFrozen()));
        if (frozen) {
            String reason = preCheck.stream()
                    .filter(ub -> ub.getBusiness() != null && Boolean.TRUE.equals(ub.getBusiness().getIsFrozen()))
                    .map(ub -> ub.getBusiness().getFreezeReason())
                    .filter(r -> r != null && !r.isBlank())
                    .findFirst().orElse("Account suspended by platform administrator");
            if (auditService != null) {
                auditService.log("PLATFORM", user.getId(), "TENANT_OWNER", "LOGIN_BLOCKED", "AUTH",
                        user.getId(), null, "Frozen tenant login attempt: " + user.getOwnerName());
            }
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Your business account is suspended.", "reason", reason));
        }


        String subject = user.getMobileNo();
        if (subject == null || subject.isBlank()) {
            subject = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : user.getId();
        }
        String token = jwtUtil.generateToken(subject);

        // Resolve or automatically provision tenant context
        List<UserBusiness> ubList = userBusinessRepository.findByUserId(user.getId());
        UserBusiness userBusiness;
        if (ubList == null || ubList.isEmpty()) {
            Business business = new Business();
            business.setId("BIZ-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10));
            business.setBusinessName(user.getBusinessName() != null ? user.getBusinessName() : "My Business");
            business.setEmail(user.getEmail());
            business.setPhoneNo(user.getMobileNo());
            Business savedBusiness = businessRepository.save(business);

            userBusiness = new UserBusiness();
            userBusiness.setUser(user);
            userBusiness.setBusiness(savedBusiness);
            userBusiness.setRole(UserRole.TENANT_OWNER);
            userBusiness = userBusinessRepository.save(userBusiness);

            subscriptionService.provisionFreeTrial(savedBusiness.getId());
        } else {
            userBusiness = ubList.get(0);
        }

        Map<String, Object> subMap = subscriptionService.getCurrentTenantUsage(userBusiness.getBusiness().getId());

        // CA-audit: successful login (tenant-scoped; never fail login if audit is down)
        if (auditService != null) {
            auditService.log(userBusiness.getBusiness().getId(), user.getId(), tenantRoleOf(userBusiness), "LOGIN", "AUTH",
                    user.getId(), null, "Login successful for " + user.getOwnerName());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("businessId", userBusiness.getBusiness().getId());
        response.put("userBusinessId", userBusiness.getId());
        response.put("businessName", userBusiness.getBusiness().getBusinessName());
        response.put("ownerName", user.getOwnerName());
        response.put("email", user.getEmail());
        response.put("mobileNo", user.getMobileNo());
        String tenantRole = userBusiness.getRole() != null ? userBusiness.getRole().name() : "TENANT_OWNER";
        response.put("role", tenantRole);
        response.put("userRole", tenantRole);
        response.put("activePlan", subMap.get("planName"));
        response.put("planId", subMap.get("activePlan"));
        response.put("daysRemaining", subMap.get("daysRemaining"));
        response.put("isTrialActive", subMap.get("isTrialActive"));
        response.put("token", token);
        response.put("user", user);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }

    // In-memory OTP cache (identifier -> OTP); replace with a persistent store before multi-node deployment.
    private static final Map<String, OtpChallenge> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    private String tenantRoleOf(com.tsarit.billing.model.UserBusiness ub) {
        try {
            return ub.getRole() != null ? ub.getRole().name() : "TENANT_OWNER";
        } catch (Exception e) {
            return "TENANT_OWNER";
        }
    }

    // ----------------------- GET PROFILE -----------------------
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        requireOwnAccount(userId);
        return userRepository.findById(userId).map(user -> {
            return ResponseEntity.ok((Object) user);
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    // ----------------------- UPDATE PROFILE -----------------------
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody User userDetails,
                                           jakarta.servlet.http.HttpServletResponse response) {
        requireOwnAccount(userId);
        return userRepository.findById(userId).map(user -> {
            String oldEmail = user.getEmail();
            String oldMobile = user.getMobileNo();
            if (userDetails.getOwnerName() != null && !userDetails.getOwnerName().isBlank()) {
                user.setOwnerName(userDetails.getOwnerName());
            }
            if (userDetails.getBusinessName() != null && !userDetails.getBusinessName().isBlank()) {
                user.setBusinessName(userDetails.getBusinessName());
            }
            if (userDetails.getEmail() != null && !userDetails.getEmail().isBlank()) {
                user.setEmail(userDetails.getEmail());
            }
            if (userDetails.getMobileNo() != null && !userDetails.getMobileNo().isBlank()) {
                user.setMobileNo(userDetails.getMobileNo());
            }
            if (userDetails.getReferredBy() != null) {
                user.setReferredBy(userDetails.getReferredBy());
            }
            User saved = userRepository.save(user);

            // The JWT subject is the sign-in identifier (email/mobile). If it changed,
            // existing tokens stop resolving — issue a fresh one so open sessions survive.
            boolean emailChanged = saved.getEmail() != null && !saved.getEmail().equals(oldEmail);
            boolean mobileChanged = saved.getMobileNo() != null && !saved.getMobileNo().equals(oldMobile);
            if (emailChanged || mobileChanged) {
                String newIdentifier = (saved.getEmail() != null && !saved.getEmail().isBlank())
                        ? saved.getEmail() : saved.getMobileNo();
                response.setHeader("X-New-Token", jwtUtil.generateToken(newIdentifier));
            }

            return ResponseEntity.ok((Object) saved);
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    // ----------------------- FORGOT PASSWORD -----------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email or mobile number is required"));
        }
        identifier = identifier.trim();
        if (identifier.contains("@")) {
            identifier = identifier.toLowerCase(java.util.Locale.ROOT);
        }

        User user = identifier.contains("@")
                ? userRepository.findByEmailIgnoreCase(identifier).orElse(null)
                : userRepository.findByMobileNo(identifier).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No user found with provided identifier"));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
        otpStore.put(identifier, new OtpChallenge(otp, Instant.now().plus(OTP_TTL)));

        // Real WhatsApp Cloud API OTP dispatch to customer mobile
        try {
            String phone = whatsappCloudService.normalizePhone(
                    user.getMobileNo() != null && !user.getMobileNo().isBlank() ? user.getMobileNo() : identifier);
            Map<String, Object> waResult = whatsappCloudService.sendOtp(phone, otp);
            System.out.println("[WHATSAPP OTP] To: " + phone + " success=" + waResult.get("success")
                    + (waResult.get("error") != null ? " error=" + waResult.get("error") : ""));
        } catch (Exception e) {
            System.out.println("[WHATSAPP OTP NOTICE] " + e.getMessage());
        }

        // Free route: queue same OTP on own-SIM gateway (zero cost)
        try {
            if (smsGatewayService != null) {
                String phone = user.getMobileNo() != null && !user.getMobileNo().isBlank() ? user.getMobileNo() : identifier;
                smsGatewayService.enqueue(phone, otp + " is your verification code for All In One Bill. Do not share.",
                        com.tsarit.billing.model.SmsMessage.Kind.OTP, null);
                System.out.println("[SMS-GATEWAY OTP] queued for " + phone);
            }
        } catch (Exception e) {
            System.out.println("[SMS-GATEWAY OTP NOTICE] " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Verification code sent to WhatsApp and Email successfully",
            "identifier", identifier
        ));
    }

    // ----------------------- RESET PASSWORD -----------------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (identifier == null || otp == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identifier, OTP, and new password are required"));
        }
        identifier = identifier.trim();
        if (identifier.contains("@")) {
            identifier = identifier.toLowerCase(java.util.Locale.ROOT);
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }

        OtpChallenge storedOtp = otpStore.get(identifier);
        if (storedOtp == null || storedOtp.isExpired() || !storedOtp.code().equals(otp)) {
            otpStore.remove(identifier);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code"));
        }

        User user = identifier.contains("@")
                ? userRepository.findByEmailIgnoreCase(identifier).orElse(null)
                : userRepository.findByMobileNo(identifier).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(identifier);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }

    // ----------------------- CHANGE PASSWORD -----------------------
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        requireOwnAccount(userId);
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (userId == null || oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID, current password, and new password are required"));
        }

        if (newPassword.isBlank() || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Incorrect current password"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ----------------------- GET ALL USERS (SuperAdmin) -----------------------
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        User current = currentUser();
        if (current == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        boolean superAdmin = userBusinessRepository.findByUserId(current.getId()).stream()
                .anyMatch(membership -> membership.getRole() == UserRole.SUPER_ADMIN);
        if (!superAdmin) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN);
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}
