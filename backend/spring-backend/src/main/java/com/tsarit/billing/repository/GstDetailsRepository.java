package com.tsarit.billing.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.GstDetails;

public interface GstDetailsRepository extends JpaRepository<GstDetails, String> {
	  Optional<GstDetails> findByBusiness_Id(String businessId);
	  
}
