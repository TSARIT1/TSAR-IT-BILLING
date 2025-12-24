//package com.tsarit.billing.controller;
//
//import org.springframework.web.bind.annotation.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import com.tsarit.billing.model.Customer;
//import com.tsarit.billing.repository.CustomerRepository;
//
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api")
//public class CustomerController {
//    @Autowired
//    private CustomerRepository repo;
//
//    @GetMapping("/customers/")
//    public List<Customer> list(@RequestParam(name="search", required=false) String search){
//        if (search==null || search.isEmpty()){
//            return repo.findAll();
//        } else {
//            return repo.findAll().stream().filter(c->c.getName()!=null && c.getName().toLowerCase().contains(search.toLowerCase())).toList();
//        }
//    }
//
//    @PostMapping("/customers/")
//    public Customer create(@RequestBody Customer c){ return repo.save(c); }
//
//    @PutMapping("/customers/{id}/")
//    public Customer update(@PathVariable Long id, @RequestBody Customer c){
//        Optional<Customer> op = repo.findById(id);
//        if (op.isEmpty()) return null;
//        Customer ex = op.get();
//        ex.setName(c.getName()); ex.setEmail(c.getEmail()); ex.setPhone(c.getPhone()); ex.setAddress(c.getAddress());
//        return repo.save(ex);
//    }
//
//    @DeleteMapping("/customers/{id}/")
//    public void delete(@PathVariable Long id){ repo.deleteById(id); }
//}


package com.tsarit.billing.controller;

import com.tsarit.billing.dto.CustomerDto;
import com.tsarit.billing.model.BankDetails;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.repository.BankDetailsRepository;
import com.tsarit.billing.repository.CustomerRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")

@CrossOrigin(origins = "*") // Allow frontend access
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final BankDetailsRepository bankDetailsRepository;

    public CustomerController(CustomerRepository customerRepository, 
            BankDetailsRepository bankDetailsRepository) {
    		this.customerRepository = customerRepository;
    		this.bankDetailsRepository = bankDetailsRepository;  
          }
    
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerDto customerDTO) {

        // 1. Save customer
        Customer customer = new Customer();
        customer.setName(customerDTO.getName());
        customer.setBusinessId(customerDTO.getBusinessId());
        customer.setPhone(customerDTO.getPhone());
        customer.setEmail(customerDTO.getEmail());
        customer.setCustomerType(customerDTO.getCustomerType());
        customer.setStatus(Customer.Status.valueOf(customerDTO.getStatus()));
        customer.setStreetAddress(customerDTO.getStreetAddress());
        customer.setCity(customerDTO.getCity());
        customer.setState(customerDTO.getState());
        customer.setCountry(customerDTO.getCountry());
        customer.setZipCode(customerDTO.getZipCode());
        customer.setTaxId(customerDTO.getTaxId());
        customer.setNotes(customerDTO.getNotes());

        Customer savedCustomer = customerRepository.save(customer);

        // 2. Save bank details (optional)
        if (customerDTO.getBankDetails() != null) {
            CustomerDto.BankDetailsDTO bankDTO = customerDTO.getBankDetails();

            if (bankDTO.getAccountNumber() != null ||
                bankDTO.getIfscCode() != null ||
                bankDTO.getBankName() != null ||
                bankDTO.getBranchName() != null) {

                // ✅ CHECK UNIQUE CONSTRAINT
                if (bankDetailsRepository.existsByCustomer(savedCustomer)) {
                    throw new RuntimeException("Bank details already exist for this customer");
                }

                BankDetails bankDetails = new BankDetails();
                bankDetails.setCustomer(savedCustomer);
                bankDetails.setAccountNumber(bankDTO.getAccountNumber());
                bankDetails.setIfscCode(bankDTO.getIfscCode());
                bankDetails.setBankName(bankDTO.getBankName());
                bankDetails.setBranchName(bankDTO.getBranchName());

                bankDetailsRepository.save(bankDetails);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCustomer);
    }

    // Get All Customers
    @GetMapping("/getAll")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return ResponseEntity.ok(customers);
    }
    
 // Get Customers by Business ID
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Customer>> getCustomersByBusinessId(@PathVariable String businessId) {
        List<Customer> customers = customerRepository.findByBusinessId(businessId);
        return ResponseEntity.ok(customers);
    }

    // Get Customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        Optional<Customer> customer = customerRepository.findById(id);
        return customer.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update Customer
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setName(customerDetails.getName());
                    customer.setPhone(customerDetails.getPhone());
                    customer.setEmail(customerDetails.getEmail());
                    customer.setStreetAddress(customerDetails.getStreetAddress());
                    customer.setCity(customerDetails.getCity());
                    customer.setState(customerDetails.getState());
                    customer.setZipCode(customerDetails.getZipCode());
                    customer.setCountry(customerDetails.getCountry());
                    customer.setCustomerType(customerDetails.getCustomerType());
                    customer.setTaxId(customerDetails.getTaxId());
                    customer.setNotes(customerDetails.getNotes());
                    customer.setStatus(customerDetails.getStatus());
                    Customer updatedCustomer = customerRepository.save(customer);
                    return ResponseEntity.ok(updatedCustomer);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // Delete Customer
    @DeleteMapping("/{id}")
    @Transactional 
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
