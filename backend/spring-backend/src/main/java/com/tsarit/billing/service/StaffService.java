package com.tsarit.billing.service;

import com.tsarit.billing.dto.StaffDto;
import com.tsarit.billing.model.Staff;
import com.tsarit.billing.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private com.tsarit.billing.service.AuditService auditService;

    private static String orDefault(String v, String dflt) {
        return (v == null || v.isBlank()) ? dflt : v.trim();
    }

    @Transactional
    public StaffDto createStaff(StaffDto dto, String businessId) {
        // All fields optional — sensible defaults keep users unblocked
        String name = orDefault(dto.getName(), "Unnamed Staff");
        String mobile = orDefault(dto.getMobileNumber(), "0000000000");
        String role = orDefault(dto.getRole(), "Staff");
        String payout = orDefault(dto.getSalaryPayoutType(), "MONTHLY");

        // Check if mobile number already exists for this business
        if (staffRepository.existsByBusinessIdAndMobileNumber(businessId, mobile)) {
            throw new RuntimeException("Mobile number already exists for another staff member");
        }

        Staff staff = new Staff();
        staff.setBusinessId(businessId);
        staff.setName(name);
        staff.setMobileNumber(mobile);
        staff.setRole(role);
        try {
            staff.setSalaryPayoutType(Staff.SalaryPayoutType.valueOf(payout.toUpperCase()));
        } catch (Exception e) {
            staff.setSalaryPayoutType(Staff.SalaryPayoutType.MONTHLY);
        }
        staff.setSalary(dto.getSalary() != null ? dto.getSalary() : BigDecimal.ZERO);
        staff.setSalaryCycle(dto.getSalaryCycle());
        staff.setOpeningBalance(dto.getOpeningBalance() != null ? dto.getOpeningBalance() : BigDecimal.ZERO);

        if (dto.getBalanceType() != null) {
            try {
                staff.setBalanceType(Staff.BalanceType.valueOf(dto.getBalanceType().toUpperCase()));
            } catch (Exception ignored) {}
        }

        Staff savedStaff = staffRepository.save(staff);
        auditService.log(businessId, "owner", "OWNER", "CREATE", "STAFF",
                savedStaff.getId(), savedStaff.getSalary() != null ? savedStaff.getSalary().doubleValue() : 0.0,
                "Staff added: " + savedStaff.getName() + " (" + savedStaff.getRole() + ")");
        return convertToDto(savedStaff);
    }

    @Transactional
    public StaffDto updateStaff(String id, StaffDto dto, String businessId) {
        Staff staff = staffRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        String name = orDefault(dto.getName(), staff.getName());
        String mobile = orDefault(dto.getMobileNumber(), staff.getMobileNumber());
        String role = orDefault(dto.getRole(), staff.getRole());
        String payout = orDefault(dto.getSalaryPayoutType(),
                staff.getSalaryPayoutType() != null ? staff.getSalaryPayoutType().name() : "MONTHLY");

        // Check if mobile number is being changed and if it already exists
        if (!staff.getMobileNumber().equals(mobile)) {
            if (staffRepository.existsByBusinessIdAndMobileNumberAndIdNot(businessId, mobile, id)) {
                throw new RuntimeException("Mobile number already exists for another staff member");
            }
        }

        staff.setName(name);
        staff.setMobileNumber(mobile);
        staff.setRole(role);
        try {
            staff.setSalaryPayoutType(Staff.SalaryPayoutType.valueOf(payout.toUpperCase()));
        } catch (Exception e) {
            staff.setSalaryPayoutType(Staff.SalaryPayoutType.MONTHLY);
        }
        if (dto.getSalary() != null) {
            staff.setSalary(dto.getSalary());
        }
        staff.setSalaryCycle(dto.getSalaryCycle());
        if (dto.getOpeningBalance() != null) {
            staff.setOpeningBalance(dto.getOpeningBalance());
        }

        if (dto.getBalanceType() != null) {
            try {
                staff.setBalanceType(Staff.BalanceType.valueOf(dto.getBalanceType().toUpperCase()));
            } catch (Exception ignored) {}
        }

        Staff updatedStaff = staffRepository.save(staff);
        auditService.log(businessId, "owner", "OWNER", "UPDATE", "STAFF",
                updatedStaff.getId(), updatedStaff.getSalary() != null ? updatedStaff.getSalary().doubleValue() : 0.0,
                "Staff updated: " + updatedStaff.getName());
        return convertToDto(updatedStaff);
    }

    @Transactional
    public void deleteStaff(String id, String businessId) {
        Staff staff = staffRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Soft delete - set status to INACTIVE
        staff.setStatus(Staff.Status.INACTIVE);
        staffRepository.save(staff);
        auditService.log(businessId, "owner", "OWNER", "DELETE", "STAFF",
                id, null, "Staff deleted: " + staff.getName());
    }

    public StaffDto getStaffById(String id, String businessId) {
        Staff staff = staffRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return convertToDto(staff);
    }

    public List<StaffDto> getAllStaff(String businessId) {
        return staffRepository.findByBusinessId(businessId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<StaffDto> getActiveStaff(String businessId) {
        return staffRepository.findByBusinessIdAndStatus(businessId, Staff.Status.ACTIVE).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private StaffDto convertToDto(Staff staff) {
        StaffDto dto = new StaffDto();
        dto.setId(staff.getId());
        dto.setName(staff.getName());
        dto.setMobileNumber(staff.getMobileNumber());
        dto.setRole(staff.getRole());
        dto.setSalaryPayoutType(staff.getSalaryPayoutType().name());
        dto.setSalary(staff.getSalary());
        dto.setSalaryCycle(staff.getSalaryCycle());
        dto.setOpeningBalance(staff.getOpeningBalance());
        dto.setBalanceType(staff.getBalanceType() != null ? staff.getBalanceType().name() : null);
        dto.setStatus(staff.getStatus().name());
        return dto;
    }
}
