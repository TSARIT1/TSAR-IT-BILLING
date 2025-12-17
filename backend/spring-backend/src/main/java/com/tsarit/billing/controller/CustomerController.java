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

import com.tsarit.billing.model.Customer;
import com.tsarit.billing.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*") // Allow frontend access
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // ✅ Create Customer
    @PostMapping("/create")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    // ✅ Get All Customers
    @GetMapping("/getAll")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerRepository.findAll());
    }

    // ✅ Get Customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id) {
        Optional<Customer> customer = customerRepository.findById(id);
        return customer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Update Customer
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String id, @RequestBody Customer customerDetails) {
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
                    return ResponseEntity.ok(customerRepository.save(customer));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Delete Customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
