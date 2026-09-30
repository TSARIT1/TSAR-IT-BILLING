package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.UserBusiness;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Older products may be owned through their godown instead of a direct membership.
    @Query("SELECT p FROM Product p LEFT JOIN p.userBusiness ub LEFT JOIN p.godown g " +
           "LEFT JOIN g.userBusiness gub WHERE ub.business.id = :businessId " +
           "OR (ub IS NULL AND gub.business.id = :businessId)")
    List<Product> findForSyncByBusinessId(@Param("businessId") String businessId);

    @Query("SELECT COUNT(p) FROM Product p LEFT JOIN p.userBusiness ub LEFT JOIN p.godown g " +
           "LEFT JOIN g.userBusiness gub WHERE ub.business.id = :businessId " +
           "OR (ub IS NULL AND gub.business.id = :businessId)")
    long countForSyncByBusinessId(@Param("businessId") String businessId);

	 //  Get all products by Godown
    List<Product> findByGodown(Godown godown);

    List<Product> findByGodown_GodownId(String godownId);
    
    //  Get all products by UserBusiness (optional but useful)
    List<Product> findByUserBusiness(UserBusiness userBusiness);

    List<Product> findByUserBusiness_Id(String userBusinessId);
    List<Product> findByUserBusiness_IdAndActiveTrueAndDeletedFalse(String userBusinessId);

    List<Product> findByUserBusiness_IdAndActiveTrueAndDeletedFalseAndRemainingStockGreaterThan(String userBusinessId, int remainingStock);

    
    //  Check unique product code per business
    boolean existsByProductCodeAndUserBusiness(
            String productCode,
            UserBusiness userBusiness
    );
    
    Optional<Product> findByProductName(String productName);

    Optional<Product> findByBarcode(String barcode);

    boolean existsByBarcode(String barcode);
    
    List<Product> findByGodown_GodownIdAndActiveTrueAndDeletedFalseAndRemainingStockGreaterThan(
            String godownId, int remainingStock
    );
    
    List<Product> findByActiveTrueAndDeletedFalseAndRemainingStockGreaterThan(int remainingStock);
    
    List<Product> findByActiveTrueAndDeletedFalse();
}
