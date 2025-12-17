//package com.tsarit.billing.controller;
//
//import org.springframework.web.bind.annotation.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import com.tsarit.billing.model.*;
//import com.tsarit.billing.repository.*;
//
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api")
//public class SaleController {
//
//    @Autowired
//    private SaleRepository saleRepository;
//    @Autowired
//    private ProductRepository productRepository;
//    @Autowired
//    private CustomerRepository customerRepository;
//
//    @GetMapping("/sales/")
//    public List<Sale> listSales(){ return saleRepository.findAll(); }
//
//    @PostMapping("/sales/")
//    public Sale createSale(@RequestBody Sale sale){
//        // decrease product stock
//        if (sale.getItems()!=null){
//            for (SaleItem it: sale.getItems()){
//                if (it.getProduct()!=null && it.getProduct().getId()!=null){
//                    productRepository.findById(it.getProduct().getId()).ifPresent(p -> {
//                        int newStock = (p.getStock()==null?0:p.getStock()) - (it.getQuantity()==null?0:it.getQuantity());
//                        p.setStock(newStock);
//                        productRepository.save(p);
//                        it.setPrice(p.getPrice());
//                    });
//                }
//            }
//        }
//        // compute total if not set
//        if (sale.getTotalAmount()==null){
//            double total=0;
//            if (sale.getItems()!=null){
//                for (SaleItem it: sale.getItems()){
//                    total += (it.getPrice()==null?0:it.getPrice()) * (it.getQuantity()==null?0:it.getQuantity());
//                }
//            }
//            sale.setTotalAmount(total);
//        }
//        // attach customer if exists by id
//        if (sale.getCustomer()!=null && sale.getCustomer().getId()!=null){
//            customerRepository.findById(sale.getCustomer().getId()).ifPresent(sale::setCustomer);
//        }
//        return saleRepository.save(sale);
//    }
//
//    @GetMapping("/sales/{id}/sale_pdf/")
//    public java.util.Map<String,String> salePdf(@PathVariable Long id){
//        // For simplicity return a stub URL - in production generate PDF and return path
//        return java.util.Map.of("url", "/api/sales/"+id+"/sale_pdf/download/");
//    }
//
//    @GetMapping("/sales/{id}/sale_pdf/download/")
//    public String salePdfDownload(@PathVariable Long id){
//        return "PDF download not implemented in this demo. Generate a PDF here.";
//    }
//}
