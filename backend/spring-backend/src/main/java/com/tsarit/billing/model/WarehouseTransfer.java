package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_transfers", indexes = {
    @Index(name = "idx_transfer_challan", columnList = "challan_number"),
    @Index(name = "idx_transfer_status", columnList = "status")
})
public class WarehouseTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transfer_id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "challan_number", nullable = false)
    private String challanNumber;

    @Column(name = "from_godown_id", nullable = false)
    private String fromGodownId;

    @Column(name = "from_godown_name", nullable = false)
    private String fromGodownName;

    @Column(name = "to_godown_id", nullable = false)
    private String toGodownId;

    @Column(name = "to_godown_name", nullable = false)
    private String toGodownName;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(name = "status", nullable = false)
    private String status = "COMPLETED"; // PENDING, IN_TRANSIT, COMPLETED, CANCELLED

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WarehouseTransfer() {}

    public WarehouseTransfer(String challanNumber, String fromGodownId, String fromGodownName,
                             String toGodownId, String toGodownName, LocalDate transferDate,
                             Long productId, String productName, Integer quantity,
                             String vehicleNumber, String notes) {
        this.challanNumber = challanNumber;
        this.fromGodownId = fromGodownId;
        this.fromGodownName = fromGodownName;
        this.toGodownId = toGodownId;
        this.toGodownName = toGodownName;
        this.transferDate = transferDate != null ? transferDate : LocalDate.now();
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.vehicleNumber = vehicleNumber;
        this.notes = notes;
        this.status = "COMPLETED";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getChallanNumber() { return challanNumber; }
    public void setChallanNumber(String challanNumber) { this.challanNumber = challanNumber; }

    public String getFromGodownId() { return fromGodownId; }
    public void setFromGodownId(String fromGodownId) { this.fromGodownId = fromGodownId; }

    public String getFromGodownName() { return fromGodownName; }
    public void setFromGodownName(String fromGodownName) { this.fromGodownName = fromGodownName; }

    public String getToGodownId() { return toGodownId; }
    public void setToGodownId(String toGodownId) { this.toGodownId = toGodownId; }

    public String getToGodownName() { return toGodownName; }
    public void setToGodownName(String toGodownName) { this.toGodownName = toGodownName; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
