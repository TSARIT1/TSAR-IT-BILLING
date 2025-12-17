package com.tsarit.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.UserBusiness;

public interface UserBusinessRepository extends JpaRepository<UserBusiness, String> {
	  List<UserBusiness> findByUserId(String userId);
	  List<UserBusiness> findByUser_IdAndBusiness_Id(
	            String userId,
	            String businessId
	    );
}
