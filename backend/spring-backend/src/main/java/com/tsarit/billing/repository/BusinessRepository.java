package com.tsarit.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.Godown;

public interface BusinessRepository extends JpaRepository<Business, String> {
	Optional<Business> findById(String businessId);
	Optional<Business> findByBusinessName(String businessName);
}
