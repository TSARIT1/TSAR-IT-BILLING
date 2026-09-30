package com.tsarit.billing.controller;

import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.TenantSubscription;
import com.tsarit.billing.model.Ticket;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.UserRole;
import com.tsarit.billing.repository.AuditLogRepository;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.TenantSubscriptionRepository;
import com.tsarit.billing.repository.TicketRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.security.JwtUtil;
import com.tsarit.billing.service.AuditService;
import com.tsarit.billing.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Super Admin control plane. Every endpoint requires the caller to hold a
 * SUPER_ADMIN membership. Admin actions are written to the CA audit trail.
 */
@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private UserBusinessRepository userBusinessRepository;
    @Autowired private BusinessRepository businessRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private TenantSubscriptionRepository subscriptionRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private SubscriptionService subscriptionService;
    @Autowired private AuditService auditService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    @Autowired private com.tsarit.billing.service.AppConfigService appConfigService;

    /* ------------------------- authorization ------------------------- */

    private User currentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User u ? u : null;
    }

    /** Throws 401/403 unless the caller has a SUPER_ADMIN membership. */
    private User requireSuperAdmin() {
        User user = currentUser();
        if (user == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        boolean isSuper = userBusinessRepository.findByUserId(user.getId()).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
        if (!isSuper) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "SUPER_ADMIN role required");
        }
        return user;
    }

    private void audit(String action, String entityType, String entityId, String note) {
        User admin = currentUser();
        auditService.log("PLATFORM", admin != null ? admin.getId() : "system", "SUPER_ADMIN",
                action, entityType, entityId, null, note);
    }

    /* ------------------------- seeding ------------------------- */

    /**
     * Guarantees the platform super-admin exists (idempotent, runs on every boot).
     * Credentials come from env with safe defaults for this single-tenant deployment.
     */
    @Autowired
    org.springframework.context.ApplicationEventPublisher unusedPublisher;

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void seedSuperAdmin() {
        String email = env("SUPERADMIN_EMAIL", "tsaritservices@gmail.com");
        String password = env("SUPERADMIN_PASSWORD", "Tsarit@12345");
        String mobile = env("SUPERADMIN_MOBILE", "9999999999");

        User admin = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (admin == null) {
            // A user with this mobile may already exist from an earlier partial seed — reuse it.
            admin = userRepository.findByMobileNo(mobile).orElse(null);
        }
        if (admin == null) {
            admin = new User();
            admin.setMobileNo(mobile);
            admin.setPassword(passwordEncoder.encode(password));
        }
        // Ensure the identity points at the configured admin email (unique column).
        if (admin.getEmail() == null || admin.getEmail().isBlank()
                || (!admin.getEmail().equalsIgnoreCase(email) && userRepository.findByEmailIgnoreCase(email).isEmpty())) {
            admin.setEmail(email);
        }
        admin.setOwnerName(admin.getOwnerName() == null || admin.getOwnerName().isBlank()
                ? "TSAR IT Super Admin" : admin.getOwnerName());
        admin.setBusinessName(admin.getBusinessName() == null || admin.getBusinessName().isBlank()
                ? "TSAR IT PLATFORM" : admin.getBusinessName());
        // Guarantee admin access: the seed password is authoritative for this account.
        // Override in production with the SUPERADMIN_PASSWORD environment variable.
        if (admin.getPassword() == null || !passwordEncoder.matches(password, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(password));
        }
        try {
            admin = userRepository.save(admin);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Raced or pre-existing row — reload instead of crashing boot.
            admin = userRepository.findByEmailIgnoreCase(email)
                    .or(() -> userRepository.findByMobileNo(mobile))
                    .orElseThrow();
        }

        final String adminId = admin.getId();
        boolean hasRole = userBusinessRepository.findByUserId(adminId).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
        if (!hasRole) {
            Business platform = businessRepository.findByBusinessName("TSAR IT PLATFORM").orElseGet(() -> {
                Business b = new Business();
                b.setBusinessName("TSAR IT PLATFORM");
                b.setEmail(email);
                b.setPhoneNo(mobile);
                return businessRepository.save(b);
            });
            UserBusiness ub = new UserBusiness();
            ub.setUser(admin);
            ub.setBusiness(platform);
            ub.setRole(UserRole.SUPER_ADMIN);
            userBusinessRepository.save(ub);
        }
    }

    private String env(String key, String def) {
        String v = System.getenv(key);
        return (v == null || v.isBlank()) ? def : v;
    }

    /* ------------------------- real super-admin login ------------------------- */

    /** Dedicated login: same password check as tenant login but response marks the admin session. */
    @PostMapping("/login")
    public ResponseEntity<?> superAdminLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid super-admin credentials"));
        }

        boolean isSuper = userBusinessRepository.findByUserId(user.getId()).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
        if (!isSuper) {
            return ResponseEntity.status(403).body(Map.of("error", "This account is not a super admin"));
        }

        String subject = (user.getMobileNo() != null && !user.getMobileNo().isBlank())
                ? user.getMobileNo() : user.getEmail();
        String token = jwtUtil.generateToken(subject);

        audit("ADMIN_LOGIN", "USER", user.getId(), "Super admin signed in");

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("role", "SUPER_ADMIN");
        resp.put("userId", user.getId());
        resp.put("email", user.getEmail());
        resp.put("ownerName", user.getOwnerName());
        resp.put("message", "Super admin authenticated");
        return ResponseEntity.ok(resp);
    }

    /* ------------------------- platform stats ------------------------- */

    @GetMapping("/stats")
    public ResponseEntity<?> platformStats() {
        requireSuperAdmin();

        long totalUsers = userRepository.count();
        long totalBusinesses = businessRepository.count();
        long totalInvoices = invoiceRepository.count();
        long openTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getStatus() != null && !"closed".equalsIgnoreCase(t.getStatus()) && !"RESOLVED".equalsIgnoreCase(t.getStatus()))
                .count();
        long activeSubs = subscriptionRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || "TRIAL".equalsIgnoreCase(s.getStatus()))
                .count();
        double revenue = subscriptionRepository.findAll().stream()
                .filter(s -> s.getAmountPaid() != null)
                .mapToDouble(TenantSubscription::getAmountPaid)
                .sum();
        long auditEvents = auditLogRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalBusinesses", totalBusinesses);
        stats.put("totalInvoices", totalInvoices);
        stats.put("openTickets", openTickets);
        stats.put("activeSubscriptions", activeSubs);
        stats.put("platformRevenue", Math.round(revenue * 100.0) / 100.0);
        stats.put("auditEvents", auditEvents);
        stats.put("frozenTenants", businessRepository.findAll().stream().filter(b -> Boolean.TRUE.equals(b.getIsFrozen())).count());
        return ResponseEntity.ok(stats);
    }

    /* ------------------------- tenants ------------------------- */

    /** All tenants: user + business + subscription summary in one payload. */
    @GetMapping("/tenants")
    public ResponseEntity<?> allTenants() {
        requireSuperAdmin();

        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            List<UserBusiness> memberships = userBusinessRepository.findByUserId(u.getId());
            boolean isSuper = memberships.stream().anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
            if (isSuper && memberships.size() == 1) continue; // skip the platform admin itself

            Map<String, Object> row = new HashMap<>();
            row.put("userId", u.getId());
            row.put("ownerName", u.getOwnerName());
            row.put("email", u.getEmail());
            row.put("mobileNo", u.getMobileNo());
            row.put("isSuperAdmin", isSuper);

            UserBusiness primary = memberships.stream().findFirst().orElse(null);
            if (primary != null && primary.getBusiness() != null) {
                Business b = primary.getBusiness();
                row.put("businessId", b.getId());
                row.put("businessName", b.getBusinessName());
                row.put("isFrozen", Boolean.TRUE.equals(b.getIsFrozen()));
                row.put("freezeReason", b.getFreezeReason());

                TenantSubscription sub = subscriptionRepository
                        .findFirstByBusinessIdOrderByEndDateDesc(b.getId()).orElse(null);
                if (sub != null) {
                    row.put("planName", sub.getPlanName());
                    row.put("planStatus", sub.getStatus());
                    row.put("planEndDate", sub.getEndDate() != null ? sub.getEndDate().toString() : null);
                    row.put("amountPaid", sub.getAmountPaid());
                } else {
                    row.put("planName", "No subscription");
                    row.put("planStatus", "NONE");
                }
                row.put("invoiceCount", invoiceRepository.countByCustomer_BusinessId(b.getId()));
            }
            out.add(row);
        }
        return ResponseEntity.ok(out);
    }

    /** Freeze / unfreeze a tenant business (killswitch). */
    @PutMapping("/tenants/{businessId}/freeze")
    public ResponseEntity<?> freezeTenant(@PathVariable String businessId, @RequestBody Map<String, String> body) {
        requireSuperAdmin();
        Business b = businessRepository.findById(businessId).orElse(null);
        if (b == null) return ResponseEntity.status(404).body(Map.of("error", "Business not found"));

        boolean freeze = Boolean.parseBoolean(body.getOrDefault("freeze", "true"));
        String reason = body.getOrDefault("reason", freeze ? "Suspended by platform administrator" : null);

        b.setIsFrozen(freeze);
        b.setFreezeReason(freeze ? reason : null);
        businessRepository.save(b);

        audit(freeze ? "TENANT_FREEZE" : "TENANT_UNFREEZE", "BUSINESS", businessId,
                (freeze ? "Froze: " : "Unfroze: ") + b.getBusinessName());

        Map<String, Object> resp = new HashMap<>();
        resp.put("businessId", businessId);
        resp.put("isFrozen", freeze);
        resp.put("freezeReason", b.getFreezeReason());
        return ResponseEntity.ok(resp);
    }

    /**
     * Permanently delete a tenant account and every piece of business data they own.
     * Runs inside one transaction with FK checks suspended; sweeps both FK-linked and
     * plain-column (business_id / user_id) references so nothing is left dangling.
     * Audit history is intentionally retained (compliance trail).
     */
    @DeleteMapping("/tenants/{userId}")
    @Transactional
    public ResponseEntity<?> deleteTenant(@PathVariable String userId) {
        requireSuperAdmin();
        User target = userRepository.findById(userId).orElse(null);
        if (target == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        boolean targetIsSuper = userBusinessRepository.findByUserId(userId).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
        if (targetIsSuper) {
            return ResponseEntity.status(403).body(Map.of("error", "Platform administrator accounts cannot be deleted"));
        }

        Map<String, Integer> removed = new LinkedHashMap<>();

        // Which businesses does this user solely own? A business with ANY other member
        // (including a platform admin) is shared — it must survive, only the target's
        // membership row is removed.
        List<String> ownedBusinessIds = new ArrayList<>();
        List<String> sharedBusinessIds = new ArrayList<>();
        for (UserBusiness ub : userBusinessRepository.findByUserId(userId)) {
            Business b = ub.getBusiness();
            if (b == null) continue;
            if ("TSAR IT PLATFORM".equalsIgnoreCase(b.getBusinessName())) continue; // never touch the platform business
            boolean shared = userBusinessRepository.findByBusiness_Id(b.getId()).stream()
                    .anyMatch(o -> o.getUser() != null && !userId.equals(o.getUser().getId()));
            if (shared) sharedBusinessIds.add(b.getId());
            else ownedBusinessIds.add(b.getId());
        }

        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
        try {
            for (String bid : ownedBusinessIds) {
                removed.putAll(deleteAllBusinessData(bid));
                businessRepository.deleteById(bid);
            }

            // User-keyed rows outside the business graph (audit_logs deliberately kept).
            for (String t : tablesWithColumn("user_id")) {
                if (t.equalsIgnoreCase("audit_logs") || t.equalsIgnoreCase("users")
                        || t.equalsIgnoreCase("user_business")) continue;
                int n = jdbcTemplate.update("DELETE FROM `" + t + "` WHERE user_id = ?", userId);
                if (n > 0) removed.merge(t, n, Integer::sum);
            }

            // Tickets raised by this user, then orphaned reply/attachment rows.
            int t = jdbcTemplate.update("DELETE FROM tickets WHERE created_by = ?", userId);
            if (t > 0) removed.put("tickets", t);
            jdbcTemplate.update("DELETE FROM ticket_replies WHERE ticket_id NOT IN (SELECT id FROM tickets)");
            jdbcTemplate.update("DELETE FROM ticket_attachments WHERE ticket_id NOT IN (SELECT id FROM tickets)");

            userBusinessRepository.deleteAll(userBusinessRepository.findByUserId(userId));
            userRepository.delete(target);
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");
        }

        audit("TENANT_DELETE", "USER", userId,
                "Deleted tenant account + all business data for " + target.getEmail()
                        + " (businesses wiped: " + ownedBusinessIds.size()
                        + ", shared businesses kept: " + sharedBusinessIds.size() + ")");

        Map<String, Object> resp = new HashMap<>();
        resp.put("deleted", true);
        resp.put("userId", userId);
        resp.put("email", target.getEmail());
        resp.put("businessesDeleted", ownedBusinessIds.size());
        resp.put("sharedBusinessesKept", sharedBusinessIds.size());
        resp.put("removedRows", removed);
        return ResponseEntity.ok(resp);
    }

    /** Deletes every row in tables that reference the business, plus orphaned child rows. */
    private Map<String, Integer> deleteAllBusinessData(String businessId) {
        Map<String, Integer> removed = new LinkedHashMap<>();
        for (String t : tablesWithColumn("business_id")) {
            if (t.equalsIgnoreCase("business")) continue;
            int n = jdbcTemplate.update("DELETE FROM `" + t + "` WHERE business_id = ?", businessId);
            if (n > 0) removed.put(t, n);
        }
        // Orphan cleanup for rows keyed only through deleted parents (best-effort).
        safeUpdate(removed, "invoices", "DELETE FROM invoices WHERE customer_id NOT IN (SELECT id FROM customers)");
        safeUpdate(removed, "invoice_items", "DELETE FROM invoice_items WHERE invoice_id NOT IN (SELECT id FROM invoices)");
        safeUpdate(removed, "sale_items", "DELETE FROM sale_items WHERE sale_id NOT IN (SELECT id FROM sales)");
        safeUpdate(removed, "purchase_return_items", "DELETE FROM purchase_return_items WHERE purchase_return_id NOT IN (SELECT id FROM purchase_returns)");
        safeUpdate(removed, "online_order_items", "DELETE FROM online_order_items WHERE order_id NOT IN (SELECT id FROM online_orders)");
        safeUpdate(removed, "journal_entry_lines", "DELETE FROM journal_entry_lines WHERE journal_entry_id NOT IN (SELECT id FROM journal_entries)");
        safeUpdate(removed, "stock_transaction", "DELETE FROM stock_transaction WHERE product_id NOT IN (SELECT id FROM products)");
        return removed;
    }

    private void safeUpdate(Map<String, Integer> removed, String label, String sql) {
        try {
            int n = jdbcTemplate.update(sql);
            if (n > 0) removed.merge(label, n, Integer::sum);
        } catch (Exception ignored) {
            // Table/column naming differs across installs — never block the delete.
        }
    }

    private List<String> tablesWithColumn(String column) {
        return jdbcTemplate.queryForList(
                "SELECT DISTINCT TABLE_NAME FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = ?", String.class, column);
    }

    /** Manually activate a plan for a tenant (comp / offline payment). */
    @PutMapping("/tenants/{businessId}/plan")
    public ResponseEntity<?> setTenantPlan(@PathVariable String businessId, @RequestBody Map<String, String> body) {
        requireSuperAdmin();
        Business b = businessRepository.findById(businessId).orElse(null);
        if (b == null) return ResponseEntity.status(404).body(Map.of("error", "Business not found"));

        String planId = body.get("planId");
        if (planId == null || planId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "planId is required"));
        }

        subscriptionService.upgradePlan(businessId, planId, "MANUAL-" + System.currentTimeMillis(), "MANUAL", 0.0);
        audit("PLAN_ACTIVATE", "BUSINESS", businessId, "Manually activated plan " + planId + " for " + b.getBusinessName());
        return ResponseEntity.ok(Map.of("businessId", businessId, "planId", planId, "status", "ACTIVE"));
    }

    /* ------------------------- tickets ------------------------- */

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> setTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        requireSuperAdmin();
        Ticket t = ticketRepository.findById(id).orElse(null);
        if (t == null) return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));

        String status = body.getOrDefault("status", "closed");
        t.setStatus(status);
        ticketRepository.save(t);
        audit("TICKET_STATUS", "TICKET", String.valueOf(id), "Set ticket " + id + " status to " + status);
        return ResponseEntity.ok(t);
    }

    /* ------------------------- broadcast ------------------------- */

    /** Guarded broadcast — the legacy notification endpoint stays for compat, the panel uses this. */
    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, String> body) {
        requireSuperAdmin();
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        String title = body.getOrDefault("title", "Platform Announcement");
        String type = body.getOrDefault("type", "INFO");
        String target = body.getOrDefault("target", "ALL");

        return ResponseEntity.ok(notificationService.broadcastPortalNotification(title, message, type, target));
    }

    @Autowired
    private com.tsarit.billing.service.NotificationService notificationService;

    /* ------------------------- audit access ------------------------- */

    @GetMapping("/audit")
    public ResponseEntity<?> platformAudit(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "100") int size) {
        requireSuperAdmin();
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 500),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        var slice = auditLogRepository.findAll(pageable);
        Map<String, Object> resp = new HashMap<>();
        resp.put("content", slice.getContent());
        resp.put("totalElements", slice.getTotalElements());
        return ResponseEntity.ok(resp);
    }

    /* ------------------------- Android APK remote control ------------------------- */

    /**
     * Everything the super admin can change about the Android app without shipping
     * a new build: module feature flags, forced-update gate, maintenance mode,
     * blocked tenants, plan catalogue/prices, in-app banner and support contacts.
     */
    @GetMapping("/app-config")
    public ResponseEntity<?> getAppConfig() {
        requireSuperAdmin();
        return ResponseEntity.ok(appConfigService.adminPayload());
    }

    /** Partial patch: send only the keys you want to change. */
    @PutMapping("/app-config")
    public ResponseEntity<?> updateAppConfig(@RequestBody Map<String, Object> patch) {
        User admin = requireSuperAdmin();
        var saved = appConfigService.patch(patch, admin.getEmail());
        audit("APP_CONFIG_UPDATE", "APP_CONFIG", String.valueOf(saved.getId()),
                "Updated keys: " + String.join(", ", patch.keySet()));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "config", appConfigService.adminPayload(),
                "updatedBy", saved.getUpdatedBy(),
                "updatedAt", String.valueOf(saved.getUpdatedAt())));
    }

    /** Plan catalogue currently served to the app. */
    @GetMapping("/app-plans")
    public ResponseEntity<?> getAppPlans() {
        requireSuperAdmin();
        var builtin = subscriptionService.getAvailablePlans().stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("planId", p.planId);
                    m.put("name", p.name);
                    m.put("tagline", p.tagline);
                    m.put("price", p.price);
                    m.put("duration", p.duration);
                    m.put("durationDays", p.durationDays);
                    m.put("badge", p.badge);
                    m.put("isPopular", p.isPopular);
                    return m;
                })
                .toList();
        return ResponseEntity.ok(appConfigService.effectivePlans(builtin));
    }
}
