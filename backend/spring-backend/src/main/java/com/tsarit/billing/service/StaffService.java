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

    @Transactional
    public StaffDto createStaff(StaffDto dto, String businessId) {
        // Check if mobile number already exists for this business
        if (staffRepository.existsByBusinessIdAndMobileNumber(businessId, dto.getMobileNumber())) {
            throw new RuntimeException("Mobile number already exists for another staff member");
        }

        Staff staff = new Staff();
        staff.setBusinessId(businessId);
        staff.setName(dto.getName());
        staff.setMobileNumber(dto.getMobileNumber());
        staff.setRole(dto.getRole());
        staff.setSalaryPayoutType(Staff.SalaryPayoutType.valueOf(dto.getSalaryPayoutType()));
        staff.setSalary(dto.getSalary());
        staff.setSalaryCycle(dto.getSalaryCycle());
        staff.setOpeningBalance(dto.getOpeningBalance() != null ? dto.getOpeningBalance() : BigDecimal.ZERO);

        if (dto.getBalanceType() != null) {
            staff.setBalanceType(Staff.BalanceType.valueOf(dto.getBalanceType()));
        }

        Staff savedStaff = staffRepository.save(staff);
        return convertToDto(savedStaff);
    }

    @Transactional
    public StaffDto updateStaff(String id, StaffDto dto, String businessId) {
        Staff staff = staffRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Check if mobile number is being changed and if it already exists
        if (!staff.getMobileNumber().equals(dto.getMobileNumber())) {
            if (staffRepository.existsByBusinessIdAndMobileNumberAndIdNot(businessId, dto.getMobileNumber(), id)) {
                throw new RuntimeException("Mobile number already exists for another staff member");
            }
        }

        staff.setName(dto.getName());
        staff.setMobileNumber(dto.getMobileNumber());
        staff.setRole(dto.getRole());
        staff.setSalaryPayoutType(Staff.SalaryPayoutType.valueOf(dto.getSalaryPayoutType()));
        staff.setSalary(dto.getSalary());
        staff.setSalaryCycle(dto.getSalaryCycle());
        staff.setOpeningBalance(dto.getOpeningBalance());

        if (dto.getBalanceType() != null) {
            staff.setBalanceType(Staff.BalanceType.valueOf(dto.getBalanceType()));
        }

        Staff updatedStaff = staffRepository.save(staff);
        return convertToDto(updatedStaff);
    }

    @Transactional
    public void deleteStaff(String id, String businessId) {
        Staff staff = staffRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Soft delete - set status to INACTIVE
        staff.setStatus(Staff.Status.INACTIVE);
        staffRepository.save(staff);
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
