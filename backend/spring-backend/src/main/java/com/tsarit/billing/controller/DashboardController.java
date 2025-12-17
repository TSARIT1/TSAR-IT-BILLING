package com.tsarit.billing.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.tsarit.billing.repository.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000/") // Allow frontend access
public class DashboardController {
    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping("/stats/")
    public Map<String,Object> stats(){
        long totalSales = saleRepository.count();
        double revenue = saleRepository.findAll().stream().mapToDouble(s -> s.getTotalAmount()==null?0:s.getTotalAmount()).sum();
        long products = productRepository.count();
        long customers = customerRepository.count();
        return Map.of("totalSales", totalSales, "revenue", revenue, "products", products, "customers", customers);
    }
}
