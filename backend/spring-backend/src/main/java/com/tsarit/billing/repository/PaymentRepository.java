package com.tsarit.billing.repository;

import com.tsarit.billing.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByBusinessIdAndPaymentNo(String businessId, String paymentNo);

    List<Payment> findByBusinessIdOrderByPaymentDateDescIdDesc(String businessId);

    List<Payment> findByBusinessIdAndCustomerIdOrderByPaymentDateDescIdDesc(String businessId, Long customerId);

    long countByBusinessId(String businessId);
}
