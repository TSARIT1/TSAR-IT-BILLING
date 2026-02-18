package com.tsarit.billing.repository;

import com.tsarit.billing.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

        // Find attendance for a staff member for a specific month
        Optional<Attendance> findByStaffIdAndMonthAndYear(String staffId, Integer month, Integer year);

        // Find all attendance for a business for a specific month
        List<Attendance> findByBusinessIdAndMonthAndYear(String businessId, Integer month, Integer year);

        // Find all attendance for a staff member for a specific year
        List<Attendance> findByStaffIdAndYear(String staffId, Integer year);

        // Find all attendance for a business for a specific year
        List<Attendance> findByBusinessIdAndYear(String businessId, Integer year);
}
