package com.tsarit.billing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = { "staff_id", "month", "year" }))
public class Attendance {

    @Id
    @Column(length = 20)
    private String id;

    @NotNull
    @Column(name = "staff_id", nullable = false, length = 20)
    private String staffId;

    @NotNull
    @Column(name = "business_id", nullable = false, length = 50)
    private String businessId;

    @NotNull
    @Min(1)
    @Max(12)
    @Column(nullable = false)
    private Integer month;

    @NotNull
    @Column(nullable = false)
    private Integer year;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "present_days", columnDefinition = "JSON", nullable = false)
    private List<Integer> presentDays = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "absent_days", columnDefinition = "JSON", nullable = false)
    private List<Integer> absentDays = new ArrayList<>();

    @Column(name = "total_working_days", nullable = false)
    private Integer totalWorkingDays = 0;

    @Column(name = "marked_at", nullable = false)
    private LocalDateTime markedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = IdGenerator.attendanceId();
        }
        this.markedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.presentDays == null) {
            this.presentDays = new ArrayList<>();
        }
        if (this.absentDays == null) {
            this.absentDays = new ArrayList<>();
        }
        // Auto-calculate total working days
        this.totalWorkingDays = this.presentDays != null ? this.presentDays.size() : 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Auto-calculate total working days
        this.totalWorkingDays = this.presentDays != null ? this.presentDays.size() : 0;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getBusinessId() {
        return businessId;
    }

    public void setBusinessId(String businessId) {
        this.businessId = businessId;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public List<Integer> getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(List<Integer> presentDays) {
        this.presentDays = presentDays;
    }

    public List<Integer> getAbsentDays() {
        return absentDays;
    }

    public void setAbsentDays(List<Integer> absentDays) {
        this.absentDays = absentDays;
    }

    public Integer getTotalWorkingDays() {
        return totalWorkingDays;
    }

    public void setTotalWorkingDays(Integer totalWorkingDays) {
        this.totalWorkingDays = totalWorkingDays;
    }

    public LocalDateTime getMarkedAt() {
        return markedAt;
    }

    public void setMarkedAt(LocalDateTime markedAt) {
        this.markedAt = markedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
