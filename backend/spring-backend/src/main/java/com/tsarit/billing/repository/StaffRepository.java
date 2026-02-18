package com.tsarit.billing.repository;

import com.tsarit.billing.model.Staff;
import com.tsarit.billing.model.Staff.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {

    // Find all staff for a business
    List<Staff> findByBusinessId(String businessId);

    // Find staff by business and status
    List<Staff> findByBusinessIdAndStatus(String businessId, Status status);

    // Find single staff with business verification
    Optional<Staff> findByIdAndBusinessId(String id, String businessId);

    // Check if mobile number already exists for a business
    boolean existsByBusinessIdAndMobileNumber(String businessId, String mobileNumber);

    // Check if mobile number exists for another staff (for updates)
    boolean existsByBusinessIdAndMobileNumberAndIdNot(String businessId, String mobileNumber, String id);
}
