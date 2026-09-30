package com.tsarit.billing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_series",
        uniqueConstraints = @UniqueConstraint(columnNames = {"business_id", "fin_year"}))
public class InvoiceSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false, length = 64)
    private String businessId;

    @Column(name = "fin_year", nullable = false, length = 8)
    private String finYear;

    @Column(name = "last_seq", nullable = false)
    private Long lastSeq = 0L;

    @Version
    private Long version;

    public InvoiceSeries() {}

    public InvoiceSeries(String businessId, String finYear) {
        this.businessId = businessId;
        this.finYear = finYear;
        this.lastSeq = 0L;
    }

    public Long getId() { return id; }
    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }
    public String getFinYear() { return finYear; }
    public void setFinYear(String finYear) { this.finYear = finYear; }
    public Long getLastSeq() { return lastSeq; }
    public void setLastSeq(Long lastSeq) { this.lastSeq = lastSeq; }
}
