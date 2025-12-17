package com.tsarit.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.UserBusiness;

public interface GodownRepository extends JpaRepository<Godown, String> {

    boolean existsByGodownName(String godownName);
    List<Godown> findByUserBusiness_User_Id(String userId);
    List<Godown> findByUserBusiness_User_IdAndUserBusiness_Business_Id(
    	    String userId,
    	    String businessId
    	);
    List<Godown> findByUserBusiness_IdOrderByCreatedDateDesc(String userBusinessId);
    // Find all godowns by UserBusiness ID
    List<Godown> findByUserBusiness_Id(String userBusinessId);
 // Get all godowns for a business
    List<Godown> findByUserBusiness(UserBusiness userBusiness);
    
}
