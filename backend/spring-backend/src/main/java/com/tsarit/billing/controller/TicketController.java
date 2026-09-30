package com.tsarit.billing.controller;

import com.tsarit.billing.model.Ticket;
import com.tsarit.billing.model.TicketReply;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.UserRole;
import com.tsarit.billing.repository.TicketReplyRepository;
import com.tsarit.billing.repository.TicketRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.tsarit.billing.service.NotificationService notificationService;


    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketReplyRepository ticketReplyRepository;

    @Autowired
    private UserBusinessRepository userBusinessRepository;

    @Autowired
    private UserRepository userRepository;

    /* ---------------- helpers ---------------- */

    private User currentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User u ? u : null;
    }

    private boolean isSuperAdmin(User user) {
        return user != null && userBusinessRepository.findByUserId(user.getId()).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
    }

    /** Only the ticket creator or a super admin may access the ticket; 404 otherwise. */
    private Optional<Ticket> accessibleTicket(User user, Long id) {
        Optional<Ticket> ticket = ticketRepository.findById(id);
        if (ticket.isEmpty()) return Optional.empty();
        if (isSuperAdmin(user)) return ticket;
        return user != null && user.getId() != null && user.getId().equals(ticket.get().getCreatedBy())
                ? ticket : Optional.empty();
    }

    /* ===== Create a new Ticket ===== */
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        User caller = currentUser();
        if (caller == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
        // Stamp the creator so tenants only ever see their own tickets
        ticket.setCreatedBy(caller.getId());
        Ticket savedTicket = ticketRepository.save(ticket);
        return ResponseEntity.ok(savedTicket);
    }

    // ===== Get all Tickets =====
    // Tenants see only tickets they created; SUPER_ADMIN sees everything.
    @GetMapping
    public List<Ticket> getAllTickets() {
        User caller = currentUser();
        if (caller == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
        if (isSuperAdmin(caller)) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findAll().stream()
                .filter(t -> caller.getId().equals(t.getCreatedBy()))
                .toList();
    }

    // ===== Get Ticket by ID (creator or super admin only) =====
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        User caller = currentUser();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        return accessibleTicket(caller, id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Ticket not found")));
    }

    // ===== Update Ticket by ID (creator or super admin only) =====
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id, @RequestBody Ticket ticketDetails) {
        User caller = currentUser();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        return accessibleTicket(caller, id)
                .<ResponseEntity<?>>map(ticket -> {
                    if (ticketDetails.getSubject() != null) ticket.setSubject(ticketDetails.getSubject());
                    if (ticketDetails.getMessage() != null) ticket.setMessage(ticketDetails.getMessage());
                    if (ticketDetails.getStatus() != null) ticket.setStatus(ticketDetails.getStatus());
                    if (ticketDetails.getPriority() != null) ticket.setPriority(ticketDetails.getPriority());
                    if (ticketDetails.getAttachments() != null) ticket.setAttachments(ticketDetails.getAttachments());
                    return ResponseEntity.ok(ticketRepository.save(ticket));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Ticket not found")));
    }

    // ===== Delete Ticket by ID (creator or super admin only) =====
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        User caller = currentUser();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        return accessibleTicket(caller, id)
                .<ResponseEntity<?>>map(ticket -> {
                    ticketReplyRepository.findByTicketIdOrderByIdAsc(id)
                            .forEach(r -> ticketReplyRepository.delete(r));
                    ticketRepository.delete(ticket);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Ticket not found")));
    }

    /* ---------------- replies (conversation thread) ---------------- */

    /** Full conversation for a ticket — visible to its creator and to super admins. */
    @GetMapping("/{id}/replies")
    public ResponseEntity<?> getReplies(@PathVariable Long id) {
        User caller = currentUser();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        return accessibleTicket(caller, id)
                .<ResponseEntity<?>>map(ticket -> ResponseEntity.ok(Map.of(
                        "ticketId", ticket.getId(),
                        "ticketCode", "TCK-" + String.format("%04d", ticket.getId()),
                        "replies", ticketReplyRepository.findByTicketIdOrderByIdAsc(id)
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Ticket not found")));
    }

    /** Add a reply. Tenants reply on their own tickets; super admins answer any ticket. */
    @PostMapping("/{id}/replies")
    public ResponseEntity<?> addReply(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User caller = currentUser();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        Ticket ticket = accessibleTicket(caller, id).orElse(null);
        if (ticket == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
        }

        boolean fromSupport = isSuperAdmin(caller);
        TicketReply reply = new TicketReply();
        reply.setTicketId(id);
        reply.setAuthorId(caller.getId());
        String name = caller.getOwnerName() != null && !caller.getOwnerName().isBlank()
                ? caller.getOwnerName() : caller.getBusinessName();
        reply.setAuthorName(fromSupport ? "TSAR IT Support" : (name != null ? name : "Merchant"));
        reply.setFromSupport(fromSupport);
        reply.setMessage(message.trim());

        TicketReply saved = ticketReplyRepository.save(reply);

        // First support answer flips the ticket into in-progress; merchant reply reopens it.
        if (fromSupport && ("open".equalsIgnoreCase(ticket.getStatus()))) {
            ticket.setStatus("in-progress");
            ticketRepository.save(ticket);
        } else if (!fromSupport && "closed".equalsIgnoreCase(ticket.getStatus())) {
            ticket.setStatus("open");
            ticketRepository.save(ticket);
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("reply", saved);
        resp.put("status", ticket.getStatus());
        return ResponseEntity.ok(resp);
    }
}
