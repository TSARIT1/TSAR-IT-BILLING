package com.tsarit.billing.controller;

import com.tsarit.billing.dto.StaffDto;
import com.tsarit.billing.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private StaffService staffService;

    /**
     * Create a new staff member
     * POST /api/staff
     */
    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody StaffDto staffDto,
            @RequestHeader("Business-Id") String businessId) {
        try {
            StaffDto createdStaff = staffService.createStaff(staffDto, businessId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStaff);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all staff members for a business
     * GET /api/staff?status=ACTIVE (optional status filter)
     */
    @GetMapping
    public ResponseEntity<List<StaffDto>> getAllStaff(@RequestHeader("Business-Id") String businessId,
            @RequestParam(required = false) String status) {
        List<StaffDto> staffList;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            staffList = staffService.getActiveStaff(businessId);
        } else {
            staffList = staffService.getAllStaff(businessId);
        }
        return ResponseEntity.ok(staffList);
    }

    /**
     * Get a single staff member by ID
     * GET /api/staff/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable String id,
            @RequestHeader("Business-Id") String businessId) {
        try {
            StaffDto staff = staffService.getStaffById(id, businessId);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Update a staff member
     * PUT /api/staff/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable String id,
            @Valid @RequestBody StaffDto staffDto,
            @RequestHeader("Business-Id") String businessId) {
        try {
            StaffDto updatedStaff = staffService.updateStaff(id, staffDto, businessId);
            return ResponseEntity.ok(updatedStaff);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete a staff member (soft delete - sets status to INACTIVE)
     * DELETE /api/staff/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable String id,
            @RequestHeader("Business-Id") String businessId) {
        try {
            staffService.deleteStaff(id, businessId);
            return ResponseEntity.ok().body("Staff member deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
