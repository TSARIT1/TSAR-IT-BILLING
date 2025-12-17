package com.tsarit.billing.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tsarit.billing.dto.InvoiceItemsDto;
import com.tsarit.billing.dto.InvoiceRequestDto;
import com.tsarit.billing.dto.InvoiceResponseDto;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.User;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.UserRepository;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {
	
	 @Autowired
	 private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private InvoiceItemsRepository itemRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequestDto request) {

    	 // Fetch user object
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save invoice
        Invoice invoice = new Invoice();
        invoice.setUser(user); // FK relation
        invoice.setCustomerName(request.getCustomerName());
        invoice.setMobileNo(request.getMobileNo());
        invoice.setCity(request.getCity());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setTotalItems(request.getTotalItems());
        invoice.setTotalAmount(request.getTotalAmount());

        Invoice savedInvoice = invoiceRepo.save(invoice);

        // Save each item
        for (InvoiceItemsDto dto : request.getItems()) {

            InvoiceItems item = new InvoiceItems();
            item.setItemNo(dto.getItemNo());
            item.setItemName(dto.getItemName());
            item.setQty(dto.getQty());
            item.setPrice(dto.getPrice());
            item.setDiscount(dto.getDiscount());
            item.setTax(dto.getTax());
            item.setTotalLineAmount(dto.getTotalLineAmount());

            item.setInvoice(savedInvoice);  // foreign key setup

            itemRepo.save(item);
        }

        return ResponseEntity.ok("Invoice created successfully.");
    }
    
    // Get invoices by user ID
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<InvoiceResponseDto>> getInvoicesByUser(@PathVariable String userId) {
    	
    	// List<Invoice> invoices = invoiceRepo.findByUser_Id(userId);

    	 List<Invoice> invoices =
    		        invoiceRepo.findByUser_IdOrderByInvoiceDateDesc(userId);
    	 
    	 List<InvoiceResponseDto> response = invoices.stream()
    	            .map(inv -> {

    	                //  Count items from invoice_items table
    	                int totalItems = itemRepo.countByInvoice_InvoiceId(
    	                        inv.getInvoiceId()
    	                );

    	                return new InvoiceResponseDto(
    	                        inv.getInvoiceId(),
    	                        inv.getInvoiceDate(),
    	                        inv.getCustomerName(),
    	                        inv.getMobileNo(),
    	                        inv.getCity(),
    	                        inv.getTotalAmount(),
    	                        totalItems   // derived value
    	                );
    	            })
    	            .toList();

            return ResponseEntity.ok(response);
    }
    
 // Update invoice by ID
    @PutMapping("/update/{invoiceId}")
    public ResponseEntity<?> updateInvoice(
            @PathVariable String invoiceId, 
            @RequestBody InvoiceRequestDto request) {
        
        // Find existing invoice
        Invoice existingInvoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        // Update invoice fields
        existingInvoice.setCustomerName(request.getCustomerName());
        existingInvoice.setMobileNo(request.getMobileNo());
        existingInvoice.setCity(request.getCity());
        existingInvoice.setInvoiceDate(request.getInvoiceDate());
        existingInvoice.setTotalItems(request.getTotalItems());
        existingInvoice.setTotalAmount(request.getTotalAmount());
        
        // Save updated invoice
        Invoice updatedInvoice = invoiceRepo.save(existingInvoice);
        
        // Delete existing items for this invoice
        List<InvoiceItems> existingItems = itemRepo.findByInvoice_InvoiceId(invoiceId);
        itemRepo.deleteAll(existingItems);
        
        // Save new items
        for (InvoiceItemsDto dto : request.getItems()) {
            InvoiceItems item = new InvoiceItems();
            item.setItemNo(dto.getItemNo());
            item.setItemName(dto.getItemName());
            item.setQty(dto.getQty());
            item.setPrice(dto.getPrice());
            item.setDiscount(dto.getDiscount());
            item.setTax(dto.getTax());
            item.setTotalLineAmount(dto.getTotalLineAmount());
            item.setInvoice(updatedInvoice);
            
            itemRepo.save(item);
        }
        
        return ResponseEntity.ok("Invoice updated successfully.");
    }
    
    // Delete invoice by ID
    @DeleteMapping("/delete/{invoiceId}")
    public ResponseEntity<?> deleteInvoice(@PathVariable String invoiceId) {
        
        // Check if invoice exists
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        // Delete all associated items first (due to foreign key constraint)
        List<InvoiceItems> items = itemRepo.findByInvoice_InvoiceId(invoiceId);
        itemRepo.deleteAll(items);
        
        // Delete the invoice
        invoiceRepo.delete(invoice);
        
        return ResponseEntity.ok("Invoice deleted successfully.");
    }
    
    /// For Invoice Items 
    
    @GetMapping("/{invoiceId}/items")
    public ResponseEntity<List<InvoiceItemsDto>> getInvoiceItems(
            @PathVariable String invoiceId) {

        List<InvoiceItems> items =
                itemRepo.findByInvoice_InvoiceIdOrderByItemNoAsc(invoiceId);

        List<InvoiceItemsDto> response = items.stream()
                .map(item -> new InvoiceItemsDto(
                        item.getId(),
                        item.getItemNo(),
                        item.getItemName(),
                        item.getQty(),
                        item.getPrice(),
                        item.getDiscount(),
                        item.getTax(),
                        item.getTotalLineAmount()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
   
    @DeleteMapping("/{invoiceId}/items/{id}")
    public ResponseEntity<?> deleteInvoiceItem(
            @PathVariable String invoiceId,
            @PathVariable String id) {

        InvoiceItems item = itemRepo.findByIdAndInvoice_InvoiceId(id, invoiceId)
        		.orElseThrow(() -> new RuntimeException("Invoice Item not found with ID: " + id)
        				);

        itemRepo.delete(item);

        return ResponseEntity.ok("Invoice item deleted successfully.");
    }
    
    
}

