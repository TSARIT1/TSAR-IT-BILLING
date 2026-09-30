package com.tsarit.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.UserBusiness;

public interface UserBusinessRepository extends JpaRepository<UserBusiness, String> {
	/**
	 * Tenant resolution query — eagerly loads the business so callers can read
	 * real attributes (freeze flag, name…) outside a session (open-in-view=false).
	 */
	@EntityGraph(attributePaths = {"business", "user"})
	List<UserBusiness> findByUserId(String userId);
	  List<UserBusiness> findByUser_IdAndBusiness_Id(
	            String userId,
	            String businessId
	    );
	//  Optional<UserBusiness> findByUserBusinessId(String userBusinessId);
	// Find UserBusiness by its own id
	    Optional<UserBusiness> findById(String id);

	    // Find UserBusiness by Business id (List — a business can have several members)
	    List<UserBusiness> findByBusiness_Id(String businessId);

	    // Find UserBusiness by User id
	    Optional<UserBusiness> findByUser_Id(String userId);
}
