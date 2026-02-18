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
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Customer.Status;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.BankDetailsRepository;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.CustomerRepository;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.service.PdfService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")

@CrossOrigin(origins = "*") // Allow frontend access
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final BankDetailsRepository bankDetailsRepository;
    private final BusinessRepository businessRepository;
    private final GstDetailsRepository gstDetailsRepository;

    @Autowired
    private PdfService pdfService;

    public CustomerController(CustomerRepository customerRepository,
            BankDetailsRepository bankDetailsRepository,
            BusinessRepository businessRepository,
            GstDetailsRepository gstDetailsRepository) {
        this.customerRepository = customerRepository;
        this.bankDetailsRepository = bankDetailsRepository;
        this.businessRepository = businessRepository;
        this.gstDetailsRepository = gstDetailsRepository;
    }

    @PostMapping("/create")
    @Transactional
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerDto customerDTO) {

        // Check existing customer by UNIQUE phone
        Optional<Customer> existingCustomer = customerRepository.findByPhoneAndStatus(
                customerDTO.getPhone(),
                Customer.Status.ACTIVE);

        if (existingCustomer.isPresent()) {
            // RETURN EXISTING CUSTOMER
            return ResponseEntity.ok(existingCustomer.get());
        }

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

        // 2. Save bank details
        if (customerDTO.getBankDetails() != null) {
            CustomerDto.BankDetailsDTO bankDTO = customerDTO.getBankDetails();

            if (bankDTO.getAccountNumber() != null ||
                    bankDTO.getIfscCode() != null ||
                    bankDTO.getBankName() != null ||
                    bankDTO.getBranchName() != null) {

                // CHECK UNIQUE CONSTRAINT
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
        return ResponseEntity.ok(
                customerRepository.findByStatus(Customer.Status.ACTIVE));
    }

    @GetMapping("/search")
    public List<Customer> searchCustomers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String phone) {
        if (phone != null && !phone.isEmpty()) {
            return customerRepository.findByPhoneContainingAndStatus(
                    phone, Customer.Status.ACTIVE);
        }

        if (query != null && !query.isEmpty()) {
            return customerRepository.findByNameContainingAndStatus(
                    query, Customer.Status.ACTIVE);
        }
        return Collections.emptyList(); // name / id / phone
    }

    @GetMapping("/report/pdf/{businessId}")
    public ResponseEntity<byte[]> downloadPartiesReport(@PathVariable String businessId) {
        try {
            // 1. Fetch all customers for this business using the existing repository method
            List<Customer> customers = customerRepository.findByBusinessId(businessId);

            // 2. Check if customers exist
            if (customers == null || customers.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            // 3. Since your Customer entity doesn't have UserBusiness relationship,
            // you'll need to fetch business details separately
            // For now, we'll create a simplified PDF without business header

            // Generate simplified PDF
            byte[] pdfBytes = pdfService.generateCustomerReport(customers, businessId);

            // 4. Check if PDF was generated successfully
            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity.internalServerError().build();
            }
            // 5. Set response headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData(
                    "attachment",
                    "Parties_Report_" + businessId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            // 6. Return the PDF file
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/report/csv/{businessId}")
    public ResponseEntity<byte[]> downloadPartiesReportCSV(@PathVariable String businessId) {
        try {
            System.out.println("CSV Download Request - Business ID: " + businessId);

            // 1. Fetch all customers for this business
            List<Customer> customers = customerRepository.findByBusinessId(businessId);

            System.out.println("Found " + (customers != null ? customers.size() : 0) + " customers");

            // 2. Check if customers exist
            if (customers == null || customers.isEmpty()) {
                System.out.println("No customers found for business ID: " + businessId);
                return ResponseEntity.noContent().build();
            }

            // 3. Fetch business details
            Business business = businessRepository.findById(businessId).orElse(null);
            GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);

            // 4. Generate CSV content with professional header
            StringBuilder csvContent = new StringBuilder();

            // Business Header Section
            if (business != null) {
                csvContent.append("BUSINESS DETAILS\n");
                csvContent.append("Business Name:," + escapeCsvValue(business.getBusinessName()) + "\n");
                csvContent.append("Phone:," + escapeCsvValue(business.getPhoneNo()) + "\n");
                csvContent.append("Email:," + escapeCsvValue(business.getEmail()) + "\n");
                csvContent.append("GSTIN:,"
                        + escapeCsvValue(gstDetails != null ? gstDetails.getGstNo() : "Not Registered") + "\n");

                // Format address
                String address = String.format("%s, %s, %s - %s",
                        business.getAddress() != null ? business.getAddress() : "",
                        business.getCity() != null ? business.getCity() : "",
                        business.getState() != null ? business.getState() : "",
                        business.getPincode() != null ? business.getPincode() : "")
                        .replaceAll(", ,", ",").replaceAll("^, |, $", "");
                csvContent.append("Address:," + escapeCsvValue(address) + "\n");
                csvContent.append("\n");
            }

            // Calculate summary statistics
            long totalCustomers = customers.stream()
                    .filter(c -> "Customer".equalsIgnoreCase(c.getCustomerType()))
                    .count();
            long totalSuppliers = customers.stream()
                    .filter(c -> "Supplier".equalsIgnoreCase(c.getCustomerType()))
                    .count();
            long totalBoth = customers.stream()
                    .filter(c -> "Both".equalsIgnoreCase(c.getCustomerType()))
                    .count();

            // Get current date
            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                    .ofPattern("dd-MM-yyyy");
            String currentDate = java.time.LocalDate.now().format(dateFormatter);

            // Report Title and Summary Section
            csvContent.append("PARTIES REPORT\n");
            csvContent.append("\n");
            csvContent.append("Report Date:," + currentDate + "\n");
            csvContent.append("\n");
            csvContent.append("SUMMARY\n");
            csvContent.append("Total Customers:," + totalCustomers + "\n");
            csvContent.append("Total Suppliers:," + totalSuppliers + "\n");
            if (totalBoth > 0) {
                csvContent.append("Total Both:," + totalBoth + "\n");
            }
            csvContent.append("Total Parties:," + customers.size() + "\n");
            csvContent.append("\n");
            csvContent.append("\n");

            // CSV Data Table Header
            csvContent.append(
                    "Customer ID,Name,Phone,Email,Customer Type,Status,City,State,Country,Street Address,Zip Code,Notes\n");

            // CSV Data rows
            for (Customer customer : customers) {
                csvContent.append(escapeCsvValue(String.valueOf(customer.getId()))).append(",");
                csvContent.append(escapeCsvValue(customer.getName())).append(",");
                // Format phone number to avoid scientific notation
                csvContent
                        .append(escapeCsvValue(
                                customer.getPhone() != null ? String.format("%s", customer.getPhone()) : ""))
                        .append(",");
                csvContent.append(escapeCsvValue(customer.getEmail())).append(",");
                csvContent.append(escapeCsvValue(customer.getCustomerType())).append(",");
                csvContent.append(escapeCsvValue(customer.getStatus() != null ? customer.getStatus().toString() : ""))
                        .append(",");
                csvContent.append(escapeCsvValue(customer.getCity())).append(",");
                csvContent.append(escapeCsvValue(customer.getState())).append(",");
                csvContent.append(escapeCsvValue(customer.getCountry())).append(",");
                csvContent.append(escapeCsvValue(customer.getStreetAddress())).append(",");
                csvContent.append(escapeCsvValue(customer.getZipCode())).append(",");
                csvContent.append(escapeCsvValue(customer.getNotes())).append("\n");
            }

            // Signature Footer Section
            csvContent.append("\n");
            csvContent.append("\n");
            csvContent.append("\n");
            csvContent.append("AUTHORIZED SIGNATORY\n");
            if (business != null) {
                csvContent.append("For:," + escapeCsvValue(business.getBusinessName()) + "\n");
            }
            csvContent.append("\n");
            csvContent.append("Signature:,_____________________\n");
            csvContent.append("Date:," + java.time.LocalDate.now().format(
                    java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")) + "\n");

            // 4. Convert to bytes
            byte[] csvBytes = csvContent.toString().getBytes("UTF-8");

            System.out.println("Generated CSV with " + csvBytes.length + " bytes");

            // 5. Set response headers for CSV download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData(
                    "attachment",
                    "Parties_Report_" + businessId + ".csv");
            headers.setContentLength(csvBytes.length);

            // 6. Return the CSV file
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            System.err.println("Error generating CSV report:");
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method to escape CSV values (handle commas, quotes, newlines)
    private String escapeCsvValue(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }

        // If value contains comma, quote, or newline, wrap in quotes and escape
        // existing quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            value = value.replace("\"", "\"\""); // Escape quotes by doubling them
            return "\"" + value + "\"";
        }

        return value;
    }

    // Get Customers by Business ID
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Customer>> getCustomersByBusinessId(
            @PathVariable String businessId) {

        return ResponseEntity.ok(
                customerRepository.findByBusinessIdAndStatus(
                        businessId,
                        Customer.Status.ACTIVE));
    }

    // Get Customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository
                .findByIdAndStatus(id, Customer.Status.ACTIVE)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update Customer
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {

        return customerRepository
                .findByIdAndStatus(id, Customer.Status.ACTIVE)
                .map(customer -> {
                    if (!customer.getPhone().equals(customerDetails.getPhone()) &&
                            customerRepository.findByPhone(customerDetails.getPhone()).isPresent()) {
                        throw new RuntimeException("Phone number already exists");
                    }

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
    public ResponseEntity<Object> deleteCustomer(@PathVariable Long id) {

        return customerRepository
                .findByIdAndStatus(id, Customer.Status.ACTIVE)
                .map(customer -> {
                    customer.setStatus(Customer.Status.INACTIVE);
                    customerRepository.save(customer);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

}
