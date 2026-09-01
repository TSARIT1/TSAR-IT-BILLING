package com.tsarit.billing.service;

import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.repository.CustomerRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAssistantService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AccountingService accountingService;

    public Map<String, Object> askAssistant(String question, String userId) {
        if (question == null) question = "";
        String q = question.toLowerCase().trim();

        Map<String, Object> response = new HashMap<>();
        response.put("query", question);
        response.put("timestamp", new Date());

        List<Invoice> invoices = (userId != null && !userId.isEmpty()) ?
                invoiceRepository.findByUser_Id(userId) : invoiceRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Customer> customers = customerRepository.findAll();

        if (q.contains("sales") || q.contains("revenue") || q.contains("sell") || q.contains("sold")) {
            double totalSales = invoices.stream().mapToDouble(Invoice::getTotalAmount).sum();
            response.put("intent", "SALES_SUMMARY");
            response.put("answer", String.format("Total sales revenue is ₹ %,.2f across %d invoices.", totalSales, invoices.size()));
            response.put("metrics", Map.of(
                "totalRevenue", totalSales,
                "invoiceCount", invoices.size(),
                "averageBillValue", invoices.isEmpty() ? 0 : totalSales / invoices.size()
            ));
            response.put("actionLink", "/sales-invoices");
        } else if (q.contains("customer") || q.contains("top client") || q.contains("debtor") || q.contains("owe")) {
            response.put("intent", "TOP_CUSTOMERS");
            List<Map<String, Object>> topList = customers.stream().limit(5).map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("name", c.getName());
                m.put("mobile", c.getPhone());
                m.put("gstin", c.getTaxId() != null ? c.getTaxId() : "Unregistered");
                m.put("city", c.getCity());
                return m;
            }).collect(Collectors.toList());

            response.put("answer", String.format("Found %d registered customers. Here are your top key accounts:", customers.size()));
            response.put("data", topList);
            response.put("actionLink", "/parties");
        } else if (q.contains("stock") || q.contains("inventory") || q.contains("reorder") || q.contains("low")) {
            response.put("intent", "INVENTORY_STATUS");
            List<Product> lowStock = products.stream()
                    .filter(p -> p.getTotalStock() != null && p.getTotalStock() <= 10)
                    .limit(10)
                    .collect(Collectors.toList());

            response.put("answer", String.format("You have %d total catalog products. %d items are at or below reorder threshold.", products.size(), lowStock.size()));
            response.put("data", lowStock.stream().map(p -> Map.of(
                "productName", p.getProductName() != null ? p.getProductName() : "Item",
                "currentStock", p.getTotalStock() != null ? p.getTotalStock() : 0,
                "salePrice", p.getSellingPrice() != null ? p.getSellingPrice() : 0,
                "productCode", p.getProductCode() != null ? p.getProductCode() : "N/A"
            )).collect(Collectors.toList()));
            response.put("actionLink", "/inventory");
        } else if (q.contains("gst") || q.contains("tax") || q.contains("gstr")) {
            response.put("intent", "GST_LIABILITY");
            double totalSales = invoices.stream().mapToDouble(Invoice::getTotalAmount).sum();
            double taxLiability = totalSales * 0.18;
            double cgst = taxLiability / 2.0;
            double sgst = taxLiability / 2.0;

            response.put("answer", String.format("Current estimated net GST liability is ₹ %,.2f (CGST: ₹ %,.2f, SGST: ₹ %,.2f).",
                    taxLiability, cgst, sgst));
            response.put("metrics", Map.of(
                "totalTaxLiability", taxLiability,
                "cgst", cgst,
                "sgst", sgst,
                "igst", 0.0
            ));
            response.put("actionLink", "/reports");
        } else if (q.contains("profit") || q.contains("loss") || q.contains("p&l")) {
            response.put("intent", "PROFIT_AND_LOSS");
            Map<String, Object> pnl = accountingService.generateProfitAndLoss(userId);
            response.put("answer", "Here is your latest Profit & Loss performance based on automated double-entry ledger postings.");
            response.put("data", pnl);
            response.put("actionLink", "/reports");
        } else if (q.contains("pending") || q.contains("due") || q.contains("receivable") || q.contains("unpaid")) {
            response.put("intent", "PENDING_DUES");
            List<Invoice> unpaid = invoices.stream()
                    .filter(i -> !i.isDeleted())
                    .collect(Collectors.toList());
            double totalDue = unpaid.stream().mapToDouble(Invoice::getTotalAmount).sum();
            response.put("answer", String.format("You have %d pending/unpaid invoices totaling ₹ %,.2f in receivables.", unpaid.size(), totalDue));
            response.put("metrics", Map.of(
                "unpaidCount", unpaid.size(),
                "totalOutstanding", totalDue
            ));
            response.put("actionLink", "/sales-invoices");
        } else if (q.contains("whatsapp") || q.contains("sms") || q.contains("bot") || q.contains("campaign")) {
            response.put("intent", "WHATSAPP_AUTOMATION");
            response.put("answer", "TSAR IT Billing supports automated WhatsApp Invoice Dispatch and bulk Promotional SMS campaigns. Invoices can be shared instantly with payment links directly to customer WhatsApp numbers.");
            response.put("actionLink", "/sms-promotion");
        } else {
            response.put("intent", "GENERAL_ASSISTANT");
            response.put("answer", "I can help you analyze Sales Revenue, Top Customers, Low Stock Reorders, Outstanding Receivables, GST Liability, Profit & Loss, and WhatsApp billing bot. Try asking: 'What are my pending dues?' or 'How much did we sell this month?'");
        }

        return response;
    }
}
