package com.tsarit.billing.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journal_entries", indexes = {
    @Index(name = "idx_journal_tenant", columnList = "tenant_id"),
    @Index(name = "idx_journal_date", columnList = "entry_date"),
    @Index(name = "idx_journal_ref", columnList = "reference_number")
})
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "journal_id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "company_id", length = 50)
    private String companyId;

    @Column(name = "entry_number", length = 50, nullable = false)
    private String entryNumber;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "reference_number")
    private String referenceNumber; // Invoice No, Receipt No, Bill No

    @Column(name = "reference_type")
    private String referenceType; // SALES_INVOICE, PURCHASE_BILL, PAYMENT_IN, PAYMENT_OUT, EXPENSE, CONTRA, JOURNAL

    @Column(name = "narration", length = 500)
    private String narration;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "is_posted")
    private Boolean isPosted = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<JournalEntryLine> lines = new ArrayList<>();

    public JournalEntry() {}

    public JournalEntry(String tenantId, String companyId, String entryNumber, LocalDate entryDate,
                        String referenceNumber, String referenceType, String narration, BigDecimal totalAmount) {
        this.tenantId = tenantId;
        this.companyId = companyId;
        this.entryNumber = entryNumber;
        this.entryDate = entryDate;
        this.referenceNumber = referenceNumber;
        this.referenceType = referenceType;
        this.narration = narration;
        this.totalAmount = totalAmount;
        this.isPosted = true;
        this.createdAt = LocalDateTime.now();
    }

    public void addLine(JournalEntryLine line) {
        lines.add(line);
        line.setJournalEntry(this);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getEntryNumber() { return entryNumber; }
    public void setEntryNumber(String entryNumber) { this.entryNumber = entryNumber; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public String getNarration() { return narration; }
    public void setNarration(String narration) { this.narration = narration; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Boolean getIsPosted() { return isPosted; }
    public void setIsPosted(Boolean isPosted) { this.isPosted = isPosted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<JournalEntryLine> getLines() { return lines; }
    public void setLines(List<JournalEntryLine> lines) { this.lines = lines; }
}
