package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tsarit.billing.model.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByName(String name);

	List<Customer> findByBusinessId(String businessId);
	Optional<Customer> findByPhone(String phone);
	
	Optional<Customer> findByPhoneAndStatus(String phone, Customer.Status status);

	List<Customer> findByStatus(Customer.Status status);

	List<Customer> findByBusinessIdAndStatus(String businessId, Customer.Status status);

	//List<Customer> searchActiveCustomers(String query);
	
	List<Customer> findByNameContainingAndStatus(
            String customerName,
            Customer.Status status
    );

    List<Customer> findByPhoneContainingAndStatus(
            String phone,
            Customer.Status status
    );
    
    Optional<Customer> findByIdAndStatus(Long id, Customer.Status status);

  //  Optional<Customer> findByPhone(String phone)
    
	// Optional<Customer> findByNameContainingAndStatus(String customerName, Customer.Status status);
}

