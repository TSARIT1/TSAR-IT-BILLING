package com.tsarit.billing.controller;

import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Payment;
import com.tsarit.billing.model.Sale;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.CustomerRepository;
import com.tsarit.billing.repository.PaymentRepository;
import com.tsarit.billing.repository.SaleRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Payment In (customer receipts) — real server-side payments.
 *
 * Creating a payment applies it to the customer's oldest unpaid sales:
 * sales fully covered by payments are automatically marked paid, so the
 * "To Collect" receivable on the dashboard reduces the moment money lands.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final UserBusinessRepository userBusinessRepository;

    public PaymentController(PaymentRepository paymentRepository,
                             CustomerRepository customerRepository,
                             SaleRepository saleRepository,
                             UserBusinessRepository userBusinessRepository) {
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.userBusinessRepository = userBusinessRepository;
    }

    // ------------------------------------------------------------------
    // Auth helpers
    // ------------------------------------------------------------------

    private User requireCaller() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User caller = authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User u ? u : null;
        if (caller == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return caller;
    }

    private Set<String> callerBusinessIds(User caller) {
        return userBusinessRepository.findByUserId(caller.getId()).stream()
                .map(ub -> ub.getBusiness().getId())
                .collect(Collectors.toSet());
    }

    private void requireMembership(User caller, String businessId) {
        if (!callerBusinessIds(caller).contains(businessId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have access to this business");
        }
    }

    // ------------------------------------------------------------------
    // Endpoints
    // ------------------------------------------------------------------

    /** List payments for the caller's business, newest first. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Payment> listPayments(@RequestParam(required = false) String businessId) {
        User caller = requireCaller();
        Set<String> businessIds = callerBusinessIds(caller);

        if (businessId != null && !businessId.isBlank()) {
            requireMembership(caller, businessId);
            return paymentRepository.findByBusinessIdOrderByPaymentDateDescIdDesc(businessId);
        }

        // No explicit business → union across the caller's businesses
        return businessIds.stream()
                .flatMap(bid -> paymentRepository
                        .findByBusinessIdOrderByPaymentDateDescIdDesc(bid).stream())
                .sorted((a, b) -> {
                    int byDate = b.getPaymentDate().compareTo(a.getPaymentDate());
                    return byDate != 0 ? byDate : Long.compare(b.getId(), a.getId());
                })
                .toList();
    }

    /** Per-customer payment history. */
    @GetMapping("/customer/{customerId}")
    @Transactional(readOnly = true)
    public List<Payment> customerPayments(@PathVariable Long customerId) {
        User caller = requireCaller();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        requireMembership(caller, customer.getBusinessId());
        return paymentRepository
                .findByBusinessIdAndCustomerIdOrderByPaymentDateDescIdDesc(
                        customer.getBusinessId(), customerId);
    }

    /** Record a payment and auto-apply it to the customer's unpaid sales. */
    @PostMapping
    @Transactional
    public Payment createPayment(@RequestBody PaymentRequest request) {
        User caller = requireCaller();

        // Resolve business: from customer, or request, or caller's first business
        String businessId = request.getBusinessId();
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Customer not found"));
            requireMembership(caller, customer.getBusinessId());
            businessId = customer.getBusinessId();
        } else if (businessId == null || businessId.isBlank()) {
            businessId = callerBusinessIds(caller).stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "No business found for this account"));
        } else {
            requireMembership(caller, businessId);
        }

        Double amount = request.getAmount();
        if (amount == null || amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero");
        }

        // Build the receipt
        Payment payment = new Payment();
        payment.setBusinessId(businessId);
        payment.setCustomerId(customer != null ? customer.getId() : null);
        payment.setCustomerName(customer != null && customer.getName() != null
                ? customer.getName()
                : (request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName().trim() : "Walk-in"));
        payment.setAmount(amount);
        payment.setPaymentDate(parseDate(request.getPaymentDate()));
        payment.setPaymentMode(notBlank(request.getPaymentMode(), "Cash"));
        payment.setReceivedIn(request.getReceivedIn());
        payment.setNotes(request.getNotes());
        payment.setCreatedBy(caller.getId());

        // Human number, unique per business: PAY-0001
        long seq = paymentRepository.countByBusinessId(businessId) + 1;
        String candidate;
        do {
            candidate = String.format("PAY-%04d", seq++);
        } while (paymentRepository.existsByBusinessIdAndPaymentNo(businessId, candidate));
        payment.setPaymentNo(candidate);

        payment = paymentRepository.save(payment);
        // ---- Auto-settlement: apply to oldest unpaid sales of this customer ----
        if (customer != null) {
            applyToUnpaidSales(businessId, customer.getId(), amount);
        }

        return payment;
    }

    /** Delete a receipt (ownership-checked). Does not retro-open settled sales. */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        User caller = requireCaller();
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        requireMembership(caller, payment.getBusinessId());
        paymentRepository.delete(payment);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** Incoming JSON body for creating a payment (all fields optional except amount). */
    public static class PaymentRequest {
        private String businessId;
        private Long customerId;
        private String customerName;
        private Double amount;
        private String paymentDate;   // ISO yyyy-MM-dd
        private String paymentMode;
        private String receivedIn;
        private String notes;

        public String getBusinessId() { return businessId; }
        public void setBusinessId(String businessId) { this.businessId = businessId; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getPaymentDate() { return paymentDate; }
        public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }
        public String getPaymentMode() { return paymentMode; }
        public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
        public String getReceivedIn() { return receivedIn; }
        public void setReceivedIn(String receivedIn) { this.receivedIn = receivedIn; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Apply the received amount to the customer's oldest unpaid sales (FIFO).
     * A sale whose total is fully covered by this payment flips to paid.
     */
    private void applyToUnpaidSales(String businessId, Long customerId, Double amount) {
        double remaining = amount;
        List<Sale> unpaid = saleRepository.findByCustomerId(customerId).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsPaid()))
                .sorted((a, b) -> {
                    int byDate = a.getCreatedAt().compareTo(b.getCreatedAt());
                    return byDate != 0 ? byDate : Long.compare(a.getId(), b.getId());
                })
                .toList();

        for (Sale sale : unpaid) {
            if (remaining <= 0) break;
            double total = sale.getTotalAmount() != null ? sale.getTotalAmount() : 0.0;
            if (remaining + 0.005 >= total) { // cover within half a paisa
                sale.setIsPaid(true);
                saleRepository.save(sale);
                remaining -= total;
            } else {
                remaining = 0; // partial payment — keep sale open
                break;
            }
        }
        // Any remainder is credit on account (advance) — future sales consume it
        // implicitly via FIFO order; nothing else to persist for now.
    }

    private LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) return LocalDate.now();
        try {
            return LocalDate.parse(raw);
        } catch (DateTimeParseException e) {
            return LocalDate.now();
        }
    }

    private String notBlank(String value, String fallback) {
        return value != null && !value.isBlank() ? value.trim() : fallback;
    }
}
