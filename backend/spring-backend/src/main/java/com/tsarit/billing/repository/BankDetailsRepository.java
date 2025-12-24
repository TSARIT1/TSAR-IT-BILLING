package com.tsarit.billing.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.BankDetails;
import com.tsarit.billing.model.Customer;

import java.util.Optional;

	public interface BankDetailsRepository extends JpaRepository<BankDetails, String>{ 
	    Optional<BankDetails> findByCustomerId(Long customerId);
	    void deleteByCustomerId(Long customerId);
	    boolean existsByCustomer(Customer customer);
}
