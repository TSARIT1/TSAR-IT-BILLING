package com.tsarit.billing.controller;

import com.tsarit.billing.dto.CreatePurchaseReturnDto;
import com.tsarit.billing.dto.PurchaseReturnListDto;
import com.tsarit.billing.dto.PrintDataDto;
import com.tsarit.billing.model.PurchaseReturn;
import com.tsarit.billing.service.PurchaseReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-returns")
@CrossOrigin(origins = "*")
public class PurchaseReturnController {

    @Autowired
    private PurchaseReturnService purchaseReturnService;

    /**
     * Create a new purchase return
     * POST /api/purchase-returns
     */
    @PostMapping
    public ResponseEntity<?> createPurchaseReturn(@RequestBody CreatePurchaseReturnDto dto) {
        try {
            System.out.println("=== PURCHASE RETURN CONTROLLER ===");
            System.out.println("Received DTO: " + dto);
            System.out.println("Invoice ID: " + dto.getInvoiceId());
            System.out.println("Due Date: " + dto.getDueDate());
            System.out.println("Items: " + (dto.getItems() != null ? dto.getItems().size() : 0));

            // Log each item's due date
            if (dto.getItems() != null) {
                for (int i = 0; i < dto.getItems().size(); i++) {
                    var item = dto.getItems().get(i);
                    System.out.println("  Item " + (i + 1) + ": " + item.getItemName() +
                            " | Due Date: " + item.getDueDate() +
                            " | Reason: " + item.getReturnReason());
                }
            }

            PurchaseReturn purchaseReturn = purchaseReturnService.createPurchaseReturn(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Purchase return created successfully");
            response.put("id", purchaseReturn.getId());
            response.put("returnDate", purchaseReturn.getReturnDate());
            // Note: Due dates are at item level, not parent level

            System.out.println("Purchase return created successfully with ID: " + purchaseReturn.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("=== ERROR IN CONTROLLER ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create purchase return: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all purchase returns
     * GET /api/purchase-returns
     */
    @GetMapping
    public ResponseEntity<?> getAllPurchaseReturns() {
        try {
            List<PurchaseReturnListDto> returns = purchaseReturnService.getAllPurchaseReturns();
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch purchase returns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Mark purchase returns as received
     * POST /api/purchase-returns/mark-received
     */
    @PostMapping("/mark-received")
    public ResponseEntity<?> markAsReceived(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> returnIds = request.get("returnIds");

            if (returnIds == null || returnIds.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No return IDs provided");
                return ResponseEntity.badRequest().body(error);
            }

            purchaseReturnService.markAsReceived(returnIds);

            Map<String, Object> response = new HashMap<>();
            response.put("message", returnIds.size() + " return(s) marked as received successfully");
            response.put("updatedCount", returnIds.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark returns as received: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Soft delete a purchase return
     * DELETE /api/purchase-returns/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePurchaseReturn(@PathVariable String id) {
        try {
            purchaseReturnService.deletePurchaseReturn(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Purchase return deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete purchase return: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Download Purchase Invoices PDF Report
     * GET /api/purchase-returns/report/purchase-invoices/pdf/{businessId}
     */
    @GetMapping("/report/purchase-invoices/pdf/{businessId}")
    public ResponseEntity<?> downloadPurchaseInvoicesPdf(@PathVariable String businessId) {
        try {
            System.out.println("=== DOWNLOAD PURCHASE INVOICES PDF ===");
            System.out.println("Business ID: " + businessId);

            byte[] pdfBytes = purchaseReturnService.generatePurchaseInvoicesPdf(businessId);
            System.out.println("PDF generated, size: " + (pdfBytes != null ? pdfBytes.length : 0) + " bytes");

            if (pdfBytes == null || pdfBytes.length == 0) {
                System.err.println("ERROR: Generated PDF is empty");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to generate PDF - no data available");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            System.out.println("Returning PDF response");
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=purchase_invoices_" +
                            java.time.LocalDate.now() + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("=== ERROR GENERATING PURCHASE INVOICES PDF ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate purchase invoices PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Download Purchase Returns PDF Report with Date Range Filter
     * GET
     * /api/purchase-returns/report/purchase-returns/pdf/{businessId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
     */
    @GetMapping("/report/purchase-returns/pdf/{businessId}")
    public ResponseEntity<?> downloadPurchaseReturnsPdf(
            @PathVariable String businessId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            System.out.println("=== DOWNLOAD PURCHASE RETURNS PDF ===");
            System.out.println("Business ID: " + businessId);
            System.out.println("Start Date: " + startDate);
            System.out.println("End Date: " + endDate);

            byte[] pdfBytes = purchaseReturnService.generatePurchaseReturnsPdf(businessId, startDate, endDate);
            System.out.println("PDF generated, size: " + (pdfBytes != null ? pdfBytes.length : 0) + " bytes");

            if (pdfBytes == null || pdfBytes.length == 0) {
                System.err.println("ERROR: Generated PDF is empty");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to generate PDF - no data available");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            System.out.println("Returning PDF response");
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=purchase_returns_" +
                            java.time.LocalDate.now() + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("=== ERROR GENERATING PURCHASE RETURNS PDF ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate purchase returns PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get print data for a purchase return
     * Includes business details (with GSTIN) and supplier information
     * GET /api/purchase-returns/print-data/{returnId}?businessId={businessId}
     */
    @GetMapping("/print-data/{returnId}")
    public ResponseEntity<?> getPrintData(
            @PathVariable String returnId,
            @RequestParam String businessId) {
        try {
            System.out.println("\n========== GET PRINT DATA CONTROLLER ==========");
            System.out.println("Return ID: " + returnId);
            System.out.println("Business ID: " + businessId);

            PrintDataDto printData = purchaseReturnService.getPrintData(returnId, businessId);

            System.out.println("\n--- Response Summary ---");
            System.out.println("Business Name: " + printData.getBusiness().getBusinessName());
            System.out.println("Business GSTIN: " + printData.getBusiness().getGstNo());
            System.out.println("Supplier Name: " + printData.getSupplier().getName());
            System.out.println("========== PRINT DATA CONTROLLER COMPLETE ==========\n");

            return ResponseEntity.ok(printData);
        } catch (Exception e) {
            System.err.println("\n========== ERROR IN PRINT DATA CONTROLLER ==========");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch print data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
