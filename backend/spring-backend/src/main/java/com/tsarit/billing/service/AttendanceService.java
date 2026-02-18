package com.tsarit.billing.service;

import com.tsarit.billing.dto.AttendanceDto;
import com.tsarit.billing.model.Attendance;
import com.tsarit.billing.model.Staff;
import com.tsarit.billing.repository.AttendanceRepository;
import com.tsarit.billing.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StaffRepository staffRepository;

    /**
     * Mark attendance as present for a specific day
     * Adds day to present_days array if not already present
     */
    @Transactional
    public AttendanceDto markPresent(String staffId, LocalDate date, String businessId) {
        // Verify staff belongs to the business
        Staff staff = staffRepository.findByIdAndBusinessId(staffId, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found or does not belong to this business"));

        int month = date.getMonthValue();
        int year = date.getYear();
        int day = date.getDayOfMonth();

        // Get or create monthly record
        Attendance attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseGet(() -> createMonthlyRecord(staffId, businessId, month, year));

        // Add day to present_days if not already present
        if (!attendance.getPresentDays().contains(day)) {
            attendance.getPresentDays().add(day);
        }

        // Save and return
        Attendance saved = attendanceRepository.save(attendance);
        return convertToDto(saved);
    }

    /**
     * Remove a day from present_days (unmark attendance)
     */
    @Transactional
    public AttendanceDto unmarkPresent(String staffId, LocalDate date, String businessId) {
        int month = date.getMonthValue();
        int year = date.getYear();
        int day = date.getDayOfMonth();

        Attendance attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseThrow(() -> new RuntimeException("No attendance record found for this month"));

        // Remove day from present_days
        attendance.getPresentDays().remove(Integer.valueOf(day));

        Attendance saved = attendanceRepository.save(attendance);
        return convertToDto(saved);
    }

    /**
     * Mark attendance as absent for a specific day
     * Adds day to absent_days array if not already present
     */
    @Transactional
    public AttendanceDto markAbsent(String staffId, LocalDate date, String businessId) {
        // Verify staff belongs to the business
        Staff staff = staffRepository.findByIdAndBusinessId(staffId, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found or does not belong to this business"));

        int month = date.getMonthValue();
        int year = date.getYear();
        int day = date.getDayOfMonth();

        // Get or create monthly record
        Attendance attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseGet(() -> createMonthlyRecord(staffId, businessId, month, year));

        // Initialize absentDays if null (for existing records before column was added)
        if (attendance.getAbsentDays() == null) {
            attendance.setAbsentDays(new ArrayList<>());
        }

        // Initialize presentDays if null
        if (attendance.getPresentDays() == null) {
            attendance.setPresentDays(new ArrayList<>());
        }

        // Add day to absent_days if not already present
        if (!attendance.getAbsentDays().contains(day)) {
            attendance.getAbsentDays().add(day);
        }

        // Remove from present_days if it was marked present
        attendance.getPresentDays().remove(Integer.valueOf(day));

        // Save and return
        Attendance saved = attendanceRepository.save(attendance);
        return convertToDto(saved);
    }

    /**
     * Remove a day from absent_days (unmark absent)
     */
    @Transactional
    public AttendanceDto unmarkAbsent(String staffId, LocalDate date, String businessId) {
        int month = date.getMonthValue();
        int year = date.getYear();
        int day = date.getDayOfMonth();

        Attendance attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseThrow(() -> new RuntimeException("No attendance record found for this month"));

        // Initialize absentDays if null (for existing records)
        if (attendance.getAbsentDays() == null) {
            attendance.setAbsentDays(new ArrayList<>());
        }

        // Remove day from absent_days
        attendance.getAbsentDays().remove(Integer.valueOf(day));

        Attendance saved = attendanceRepository.save(attendance);
        return convertToDto(saved);
    }

    /**
     * Check if a specific day is marked as present
     */
    public boolean isPresent(String staffId, LocalDate date) {
        int month = date.getMonthValue();
        int year = date.getYear();
        int day = date.getDayOfMonth();

        Optional<Attendance> attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year);

        return attendance.isPresent() &&
                attendance.get().getPresentDays() != null &&
                attendance.get().getPresentDays().contains(day);
    }

    /**
     * Get monthly attendance for a staff member
     */
    public AttendanceDto getMonthlyAttendance(String staffId, int month, int year, String businessId) {
        // Verify staff belongs to business
        staffRepository.findByIdAndBusinessId(staffId, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found or does not belong to this business"));

        Attendance attendance = attendanceRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseGet(() -> createMonthlyRecord(staffId, businessId, month, year));

        return convertToDto(attendance);
    }

    /**
     * Get all staff attendance for a month
     */
    public List<AttendanceDto> getBusinessMonthlyAttendance(String businessId, int month, int year) {
        return attendanceRepository
                .findByBusinessIdAndMonthAndYear(businessId, month, year)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance for all staff for a specific date
     */
    public List<AttendanceDto> getAttendanceByDate(String businessId, LocalDate date) {
        int month = date.getMonthValue();
        int year = date.getYear();

        return attendanceRepository
                .findByBusinessIdAndMonthAndYear(businessId, month, year)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Helper methods
    private Attendance createMonthlyRecord(String staffId, String businessId, int month, int year) {
        Attendance attendance = new Attendance();
        attendance.setStaffId(staffId);
        attendance.setBusinessId(businessId);
        attendance.setMonth(month);
        attendance.setYear(year);
        attendance.setPresentDays(new ArrayList<>());
        attendance.setAbsentDays(new ArrayList<>());
        attendance.setTotalWorkingDays(0);
        return attendance;
    }

    private AttendanceDto convertToDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setStaffId(attendance.getStaffId());
        dto.setMonth(attendance.getMonth());
        dto.setYear(attendance.getYear());
        dto.setPresentDays(attendance.getPresentDays() != null ? attendance.getPresentDays() : new ArrayList<>());
        dto.setAbsentDays(attendance.getAbsentDays() != null ? attendance.getAbsentDays() : new ArrayList<>());
        dto.setTotalWorkingDays(attendance.getTotalWorkingDays());
        return dto;
    }
}
