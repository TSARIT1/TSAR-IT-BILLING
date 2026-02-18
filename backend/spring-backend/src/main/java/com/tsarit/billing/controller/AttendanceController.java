package com.tsarit.billing.controller;

import com.tsarit.billing.dto.AttendanceDto;
import com.tsarit.billing.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    /**
     * Mark attendance as present for a specific day
     * POST /api/attendance/mark?staffId=...&date=2024-02-11
     */
    @PostMapping("/mark")
    public ResponseEntity<?> markPresent(
            @RequestParam String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Business-Id") String businessId) {
        try {
            AttendanceDto result = attendanceService.markPresent(staffId, date, businessId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Unmark attendance (remove from present days)
     * DELETE /api/attendance/mark?staffId=...&date=2024-02-11
     */
    @DeleteMapping("/mark")
    public ResponseEntity<?> unmarkPresent(
            @RequestParam String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Business-Id") String businessId) {
        try {
            AttendanceDto result = attendanceService.unmarkPresent(staffId, date, businessId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Mark attendance as absent for a specific day
     * POST /api/attendance/mark-absent?staffId=...&date=2024-02-11
     */
    @PostMapping("/mark-absent")
    public ResponseEntity<?> markAbsent(
            @RequestParam String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Business-Id") String businessId) {
        try {
            AttendanceDto result = attendanceService.markAbsent(staffId, date, businessId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Unmark absent (remove from absent days)
     * DELETE /api/attendance/mark-absent?staffId=...&date=2024-02-11
     */
    @DeleteMapping("/mark-absent")
    public ResponseEntity<?> unmarkAbsent(
            @RequestParam String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Business-Id") String businessId) {
        try {
            AttendanceDto result = attendanceService.unmarkAbsent(staffId, date, businessId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Check if a specific day is marked as present
     * GET /api/attendance/check?staffId=...&date=2024-02-11
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkPresent(
            @RequestParam String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isPresent = attendanceService.isPresent(staffId, date);
        return ResponseEntity.ok(isPresent);
    }

    /**
     * Get monthly attendance for a staff member
     * GET /api/attendance/monthly?staffId=...&month=2&year=2024
     */
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyAttendance(
            @RequestParam String staffId,
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Business-Id") String businessId) {
        try {
            AttendanceDto attendance = attendanceService.getMonthlyAttendance(staffId, month, year, businessId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all staff attendance for a month
     * GET /api/attendance/business?month=2&year=2024
     */
    @GetMapping("/business")
    public ResponseEntity<List<AttendanceDto>> getBusinessMonthlyAttendance(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Business-Id") String businessId) {
        List<AttendanceDto> attendance = attendanceService.getBusinessMonthlyAttendance(businessId, month, year);
        return ResponseEntity.ok(attendance);
    }

    /**
     * Get attendance for a specific date (all staff)
     * GET /api/attendance?date=2024-02-11
     */
    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAttendanceByDate(
            @RequestHeader("Business-Id") String businessId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDto> attendanceList = attendanceService.getAttendanceByDate(businessId, date);
        return ResponseEntity.ok(attendanceList);
    }

    /**
     * Export attendance as PDF
     * GET /api/attendance/export-pdf?month=2&year=2024
     */

}
