package com.tsarit.billing.repository;

import com.tsarit.billing.model.InvoiceSeries;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceSeriesRepository extends JpaRepository<InvoiceSeries, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM InvoiceSeries s WHERE s.businessId = :businessId AND s.finYear = :finYear")
    Optional<InvoiceSeries> findForUpdate(@Param("businessId") String businessId,
                                          @Param("finYear") String finYear);
}
