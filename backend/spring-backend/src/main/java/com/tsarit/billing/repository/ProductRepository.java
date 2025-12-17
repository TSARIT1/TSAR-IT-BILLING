package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.UserBusiness;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
	 //  Get all products by Godown
    List<Product> findByGodown(Godown godown);

    List<Product> findByGodown_GodownId(String godownId);
    
    //  Get all products by UserBusiness (optional but useful)
    List<Product> findByUserBusiness(UserBusiness userBusiness);

    List<Product> findByUserBusiness_Id(String userBusinessId);
    
    //  Check unique product code per business
    boolean existsByProductCodeAndUserBusiness(
            String productCode,
            UserBusiness userBusiness
    );
    
    
}
