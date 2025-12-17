package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.Vendor;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, String> {
    Optional<Vendor> findByName(String name);
}
