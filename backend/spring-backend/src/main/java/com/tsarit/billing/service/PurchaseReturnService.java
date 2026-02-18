package com.tsarit.billing.service;

import com.tsarit.billing.dto.CreatePurchaseReturnDto;
import com.tsarit.billing.dto.PurchaseReturnItemDto;
import com.tsarit.billing.dto.PurchaseReturnItemListDto;
import com.tsarit.billing.dto.PurchaseReturnListDto;
import com.tsarit.billing.dto.PrintDataDto;
import com.tsarit.billing.dto.BusinessPrintDto;
import com.tsarit.billing.dto.SupplierPrintDto;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.PurchaseReturn;
import com.tsarit.billing.model.PurchaseReturnItem;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.PurchaseReturnRepository;
import com.tsarit.billing.repository.PurchaseReturnItemRepository;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PurchaseReturnService {

    @Autowired
    private PurchaseReturnRepository purchaseReturnRepository;

    @Autowired
    private PurchaseReturnItemRepository purchaseReturnItemRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private InvoiceItemsRepository invoiceItemsRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private GstDetailsRepository gstDetailsRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional
    public PurchaseReturn createPurchaseReturn(CreatePurchaseReturnDto dto) {
        System.out.println("=== CREATE PURCHASE RETURN SERVICE ===");
        System.out.println("DTO Invoice ID: " + dto.getInvoiceId());
        System.out.println("DTO Due Date: " + dto.getDueDate());
        System.out.println("DTO Items count: " + (dto.getItems() != null ? dto.getItems().size() : 0));

        // Create purchase return entity
        // Fetch and set Invoice entity
        if (dto.getInvoiceId() != null) {
            System.out.println("Looking up invoice with ID: " + dto.getInvoiceId());
            // Validate invoice exists and is not already returned
            Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            if (invoice.isDeleted()) {
                throw new RuntimeException("Cannot create return for deleted invoice");
            }

            System.out.println("Invoice found: " + invoice.getInvoiceId());
            System.out.println("Invoice isPartiallyReturned: " + invoice.isPartiallyReturned());
            System.out.println("Invoice isFullyReturned: " + invoice.isFullyReturned());

            // Create purchase return
            PurchaseReturn purchaseReturn = new PurchaseReturn();
            purchaseReturn.setInvoice(invoice);
            purchaseReturn.setReturnDate(LocalDate.now());
            purchaseReturn.setStatus("NOT_RECEIVED");

            PurchaseReturn savedReturn = purchaseReturnRepository.save(purchaseReturn);
            System.out.println("Purchase return created with ID: " + savedReturn.getId());

            // Create and add items
            if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                System.out.println("Processing " + dto.getItems().size() + " items...");
                for (int i = 0; i < dto.getItems().size(); i++) {
                    PurchaseReturnItemDto itemDto = dto.getItems().get(i);
                    System.out.println("Item " + (i + 1) + ": " + itemDto.getItemName() +
                            ", Qty: " + itemDto.getQuantityReturned() +
                            ", Price: " + itemDto.getPrice() +
                            ", Due Date: " + itemDto.getDueDate());

                    PurchaseReturnItem item = new PurchaseReturnItem();
                    item.setItemId(itemDto.getItemId());
                    item.setItemName(itemDto.getItemName());
                    item.setQuantityReturned(itemDto.getQuantityReturned());
                    item.setPrice(itemDto.getPrice());
                    item.setTax(itemDto.getTax());
                    item.setDiscount(itemDto.getDiscount());
                    item.setTotalAmount(itemDto.getTotalAmount());
                    item.setReturnReason(itemDto.getReturnReason());
                    item.setDueDate(itemDto.getDueDate()); // Set item-level due date
                    item.setPurchaseReturn(savedReturn);

                    purchaseReturnItemRepository.save(item);
                    System.out.println("Item saved: " + item.getItemName() + " with due date: " + item.getDueDate());
                }
            } else {
                System.err.println("WARNING: No items provided in DTO");
            }

            // Calculate and update return status for the invoice
            updateInvoiceReturnStatus(savedReturn.getInvoice());

            System.out.println("Purchase return created successfully!");
            return savedReturn;
        } else {
            System.err.println("ERROR: Invoice ID is null");
            throw new RuntimeException("Invoice ID is required");
        }
    }

    /**
     * Calculate and update the return status flags for an invoice
     * based on all its purchase returns and their quantities
     */
    private void updateInvoiceReturnStatus(Invoice invoice) {
        System.out.println("=== UPDATING INVOICE RETURN STATUS ===");
        System.out.println("Invoice ID: " + invoice.getInvoiceId());
        System.out.println("Total items in invoice: " + invoice.getTotalItems());

        // Get all invoice items with their original quantities
        List<InvoiceItems> invoiceItems = invoiceItemsRepository
                .findByInvoice_InvoiceIdAndIsDeletedFalse(invoice.getInvoiceId());

        System.out.println("Invoice items count: " + invoiceItems.size());

        // Create a map to track: itemId -> original quantity
        java.util.Map<String, Integer> originalQuantities = new java.util.HashMap<>();
        for (InvoiceItems item : invoiceItems) {
            originalQuantities.put(item.getId(), item.getQty());
            System.out.println(
                    "  Item " + item.getItemName() + " (ID: " + item.getId() + "): Original Qty = " + item.getQty());
        }

        // Get all purchase returns for this invoice
        List<PurchaseReturn> allReturns = purchaseReturnRepository
                .findByInvoice_InvoiceIdAndIsDeletedFalse(invoice.getInvoiceId());
        System.out.println("Total returns for this invoice: " + allReturns.size());

        // Create a map to track: itemId -> total returned quantity
        java.util.Map<String, Integer> returnedQuantities = new java.util.HashMap<>();

        for (PurchaseReturn pr : allReturns) {
            // Fetch items directly from repository to avoid lazy loading issues
            List<PurchaseReturnItem> items = purchaseReturnItemRepository
                    .findByPurchaseReturn_IdAndIsDeletedFalse(pr.getId());

            System.out.println("Return " + pr.getId() + " has " + items.size() + " items");

            for (PurchaseReturnItem item : items) {
                String itemId = item.getItemId();
                int returnedQty = item.getQuantityReturned();

                // Add to total returned quantity for this item
                returnedQuantities.put(itemId,
                        returnedQuantities.getOrDefault(itemId, 0) + returnedQty);

                System.out.println(
                        "    Item " + item.getItemName() + " (ID: " + itemId + "): Returned Qty = " + returnedQty);
            }
        }

        // Now compare returned quantities against original quantities
        int totalItemsInInvoice = invoiceItems.size();
        int fullyReturnedItemsCount = 0;
        int partiallyReturnedItemsCount = 0;

        System.out.println("\n=== QUANTITY COMPARISON ===");
        for (InvoiceItems item : invoiceItems) {
            String itemId = item.getId();
            int originalQty = originalQuantities.get(itemId);
            int returnedQty = returnedQuantities.getOrDefault(itemId, 0);

            System.out
                    .println("Item " + item.getItemName() + ": Original=" + originalQty + ", Returned=" + returnedQty);

            if (returnedQty >= originalQty) {
                fullyReturnedItemsCount++;
                System.out.println("  -> FULLY RETURNED");
            } else if (returnedQty > 0) {
                partiallyReturnedItemsCount++;
                System.out.println("  -> PARTIALLY RETURNED");
            } else {
                System.out.println("  -> NOT RETURNED");
            }
        }

        System.out.println("\n=== FINAL STATUS ===");
        System.out.println("Total items in invoice: " + totalItemsInInvoice);
        System.out.println("Fully returned items: " + fullyReturnedItemsCount);
        System.out.println("Partially returned items: " + partiallyReturnedItemsCount);

        // Determine return status
        if (returnedQuantities.isEmpty()) {
            // No returns at all
            invoice.setPartiallyReturned(false);
            invoice.setFullyReturned(false);
            System.out.println("Status: NOT RETURNED (no items returned)");
        } else if (fullyReturnedItemsCount == totalItemsInInvoice) {
            // All items have been fully returned with their complete quantities
            invoice.setPartiallyReturned(false);
            invoice.setFullyReturned(true);
            System.out.println("Status: FULLY RETURNED (all " + totalItemsInInvoice + " items fully returned)");
        } else {
            // Some items returned (either partially or fully, but not all items fully
            // returned)
            invoice.setPartiallyReturned(true);
            invoice.setFullyReturned(false);
            System.out.println("Status: PARTIALLY RETURNED (" + fullyReturnedItemsCount + " fully + " +
                    partiallyReturnedItemsCount + " partially out of " + totalItemsInInvoice + " items)");
        }

        // Save updated invoice
        invoiceRepository.save(invoice);
        System.out.println("\nInvoice status updated successfully");
        System.out.println("isPartiallyReturned: " + invoice.isPartiallyReturned());
        System.out.println("isFullyReturned: " + invoice.isFullyReturned());
    }

    public List<PurchaseReturnListDto> getAllPurchaseReturns() {
        List<PurchaseReturn> returns = purchaseReturnRepository.findByIsDeletedFalseOrderByReturnDateDesc();

        return returns.stream().map(pr -> {
            int totalItems = pr.getItems() != null ? pr.getItems().size() : 0;

            // Calculate total amount from items
            BigDecimal totalAmount = pr.getItems() != null
                    ? pr.getItems().stream()
                            .map(PurchaseReturnItem::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                    : BigDecimal.ZERO;

            String purchaseNo = "-";
            String supplierName = "N/A";

            if (pr.getInvoice() != null && pr.getInvoice().getInvoiceId() != null) {
                String invoiceId = pr.getInvoice().getInvoiceId();
                purchaseNo = "#" + invoiceId.substring(0, Math.min(8, invoiceId.length()));

                // Get supplier name from invoice's customer name
                if (pr.getInvoice().getCustomer() != null) {
                    supplierName = pr.getInvoice().getCustomer().getName();
                }
            }

            // Map items to DTOs including due dates and original quantities
            List<PurchaseReturnItemListDto> itemDtos = pr.getItems() != null
                    ? pr.getItems().stream()
                            .filter(item -> !item.isDeleted())
                            .map(item -> {
                                // Fetch original quantity from invoice item
                                Integer originalQuantity = item.getQuantityReturned(); // Default fallback

                                if (pr.getInvoice() != null && pr.getInvoice().getInvoiceId() != null) {
                                    // Find the original invoice item by itemId
                                    List<InvoiceItems> invoiceItems = invoiceItemsRepository
                                            .findByInvoice_InvoiceIdAndIsDeletedFalse(pr.getInvoice().getInvoiceId());

                                    for (InvoiceItems invItem : invoiceItems) {
                                        if (invItem.getId().equals(item.getItemId())) {
                                            originalQuantity = invItem.getQty();
                                            break;
                                        }
                                    }
                                }

                                return new PurchaseReturnItemListDto(
                                        item.getId(),
                                        item.getItemId(),
                                        item.getItemName(),
                                        item.getQuantityReturned(),
                                        originalQuantity, // Include original quantity from invoice
                                        item.getPrice(),
                                        item.getTax(),
                                        item.getDiscount(),
                                        item.getTotalAmount(),
                                        item.getReturnReason(),
                                        item.getDueDate() // Include item-level due date
                                );
                            })
                            .collect(Collectors.toList())
                    : new ArrayList<>();

            return new PurchaseReturnListDto(
                    pr.getId(),
                    purchaseNo,
                    supplierName,
                    pr.getReturnDate(),
                    pr.getStatus(),
                    totalItems,
                    totalAmount,
                    itemDtos // Include items with their individual due dates
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void markAsReceived(List<String> returnIds) {
        for (String returnId : returnIds) {
            PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(returnId)
                    .orElseThrow(() -> new RuntimeException("Purchase return not found: " + returnId));

            purchaseReturn.setStatus("RECEIVED");
            purchaseReturn.setReceivedAt(LocalDateTime.now());
            purchaseReturnRepository.save(purchaseReturn);
        }
    }

    @Transactional
    public void deletePurchaseReturn(String returnId) {
        PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Purchase return not found: " + returnId));

        purchaseReturn.setDeleted(true);
        purchaseReturnRepository.save(purchaseReturn);
    }

    /**
     * Generate PDF for Purchase Invoices that have been added to returns
     */
    public byte[] generatePurchaseInvoicesPdf(String businessId) {
        System.out.println("=== GENERATE PURCHASE INVOICES PDF SERVICE ===");
        System.out.println("Business ID: " + businessId);

        // Fetch all invoices where items have been returned (partially or fully)
        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(inv -> (inv.isPartiallyReturned() || inv.isFullyReturned()) && !inv.isDeleted())
                .collect(Collectors.toList());

        System.out.println("Found " + invoices.size() + " purchase invoices");

        // Fetch all invoice items for these invoices
        List<InvoiceItems> allItems = invoices.stream()
                .flatMap(inv -> invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId())
                        .stream())
                .collect(Collectors.toList());

        System.out.println("Found " + allItems.size() + " invoice items");
        System.out.println("Calling PDF service...");

        return pdfService.generatePurchaseInvoicesPdf(invoices, allItems, businessId);
    }

    /**
     * Generate PDF for Purchase Returns with optional date range filter
     */
    public byte[] generatePurchaseReturnsPdf(String businessId, String startDateStr, String endDateStr) {
        // Fetch all purchase returns where isDeleted = false
        List<PurchaseReturn> returns = purchaseReturnRepository.findByIsDeletedFalseOrderByReturnDateDesc();

        // Filter by date range if provided
        if (startDateStr != null && endDateStr != null && !startDateStr.isEmpty() && !endDateStr.isEmpty()) {
            try {
                LocalDate startDate = LocalDate.parse(startDateStr);
                LocalDate endDate = LocalDate.parse(endDateStr);

                System.out.println("Filtering returns by date range: " + startDate + " to " + endDate);

                returns = returns.stream()
                        .filter(pr -> pr.getReturnDate() != null &&
                                !pr.getReturnDate().isBefore(startDate) &&
                                !pr.getReturnDate().isAfter(endDate))
                        .collect(Collectors.toList());

                System.out.println("Filtered returns count: " + returns.size());
            } catch (Exception e) {
                System.err.println("Error parsing dates: " + e.getMessage());
                // If date parsing fails, return all returns
            }
        }

        return pdfService.generatePurchaseReturnsPdf(returns, businessId);
    }

    /**
     * Get all print data for a purchase return
     * Includes business details (with GSTIN) and supplier information
     */

    public PrintDataDto getPrintData(String returnId, String businessId) {
        System.out.println("\n========== GET PRINT DATA SERVICE ==========");
        System.out.println("Return ID: " + returnId);
        System.out.println("Business ID: " + businessId);

        // 1. Fetch Purchase Return
        System.out.println("\n--- Step 1: Fetching Purchase Return ---");
        PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Purchase return not found: " + returnId));
        System.out.println("✓ Purchase Return found");
        System.out.println("  Return Date: " + purchaseReturn.getReturnDate());
        System.out.println("  Status: " + purchaseReturn.getStatus());

        // 2. Get Invoice to find Customer/Supplier
        System.out.println("\n--- Step 2: Fetching Invoice for Supplier Info ---");
        Invoice invoice = purchaseReturn.getInvoice();
        if (invoice == null) {
            throw new RuntimeException("Invoice not found for purchase return: " + returnId);
        }
        System.out.println("✓ Invoice found: " + invoice.getInvoiceId());

        Customer supplier = invoice.getCustomer();
        if (supplier == null) {
            throw new RuntimeException("Supplier/Customer not found for invoice: " + invoice.getInvoiceId());
        }
        System.out.println("✓ Supplier found: " + supplier.getName());

        // 3. Fetch Business Details
        System.out.println("\n--- Step 3: Fetching Business Details ---");
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found: " + businessId));

        System.out.println("✓ Business Data Retrieved:");
        System.out.println("  Business ID: " + business.getId());
        System.out.println("  Business Name: " + business.getBusinessName());
        System.out.println("  Address: " + business.getAddress());
        System.out.println("  City: " + business.getCity());
        System.out.println("  State: " + business.getState());
        System.out.println("  Pincode: " + business.getPincode());
        System.out.println("  Phone No: " + business.getPhoneNo());
        System.out.println("  Email: " + business.getEmail());
        System.out.println("  Logo: "
                + (business.getBusinessLogo() != null ? "Available (" + business.getBusinessLogo().length + " bytes)"
                        : "Not available"));
        System.out.println("  Signature: "
                + (business.getSignature() != null ? "Available (" + business.getSignature().length + " bytes)"
                        : "Not available"));

        // 4. Fetch GST Details
        System.out.println("\n--- Step 4: Fetching GST Details ---");
        String gstNo = null;
        try {
            GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId).orElse(null);
            if (gstDetails != null && gstDetails.getGstNo() != null) {
                gstNo = gstDetails.getGstNo();
                System.out.println("✓ GST Number found: " + gstNo);
            } else {
                System.out.println("⚠ GST Details not found for business");
                gstNo = "Not Registered";
            }
        } catch (Exception e) {
            System.out.println("⚠ Error fetching GST details: " + e.getMessage());
            gstNo = "Not Available";
        }

        // 5. Build Business Print DTO
        System.out.println("\n--- Step 5: Building Business Print DTO ---");
        BusinessPrintDto businessDto = new BusinessPrintDto();
        businessDto.setBusinessId(business.getId());
        businessDto.setBusinessName(business.getBusinessName());
        businessDto.setAddress(business.getAddress());
        businessDto.setCity(business.getCity());
        businessDto.setState(business.getState());
        businessDto.setPincode(business.getPincode());
        businessDto.setPhoneNo(business.getPhoneNo());
        businessDto.setEmail(business.getEmail());
        businessDto.setGstNo(gstNo);

        // Convert logo and signature to Base64
        if (business.getBusinessLogo() != null) {
            String logoBase64 = java.util.Base64.getEncoder().encodeToString(business.getBusinessLogo());
            businessDto.setLogo(logoBase64);
            System.out.println("✓ Logo converted to Base64 (" + logoBase64.length() + " characters)");
        } else {
            businessDto.setLogo(null);
            System.out.println("  Logo: Not available");
        }

        if (business.getSignature() != null) {
            String signatureBase64 = java.util.Base64.getEncoder().encodeToString(business.getSignature());
            businessDto.setSignature(signatureBase64);
            System.out.println("✓ Signature converted to Base64 (" + signatureBase64.length() + " characters)");
        } else {
            businessDto.setSignature(null);
            System.out.println("  Signature: Not available");
        }

        // 6. Build Supplier Print DTO
        System.out.println("\n--- Step 6: Building Supplier Print DTO ---");
        SupplierPrintDto supplierDto = new SupplierPrintDto();
        supplierDto.setCustomerId(supplier.getId());
        supplierDto.setName(supplier.getName());
        supplierDto.setMobileNo(supplier.getPhone());
        supplierDto.setCity(supplier.getCity());
        supplierDto.setAddress(supplier.getStreetAddress() + supplier.getCity() + supplier.getState()
                + supplier.getCountry() + supplier.getZipCode());

        System.out.println("✓ Supplier Data Retrieved:");
        System.out.println("  Customer ID: " + supplier.getId());
        System.out.println("  Name: " + supplier.getName());
        System.out.println("  Mobile No: " + supplier.getPhone());
        System.out.println("  City: " + supplier.getCity());
        System.out.println("  Address: " + supplier.getStreetAddress() + supplier.getCity() + supplier.getState()
                + supplier.getCountry() + supplier.getZipCode());

        // 7. Combine into Print Data DTO
        System.out.println("\n--- Step 7: Combining Print Data ---");
        PrintDataDto printData = new PrintDataDto();
        printData.setBusiness(businessDto);
        printData.setSupplier(supplierDto);

        System.out.println("✓ Print Data DTO created successfully");
        System.out.println("========== PRINT DATA SERVICE COMPLETE ==========\n");

        return printData;
    }
}
