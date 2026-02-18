package com.tsarit.billing.dto;

import java.time.LocalDate;
import java.util.List;

public class CreatePurchaseReturnDto {
    private String invoiceId;
    private LocalDate dueDate;
    private List<PurchaseReturnItemDto> items;

    // Constructors
    public CreatePurchaseReturnDto() {
    }

    // Getters and Setters
    public String getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public List<PurchaseReturnItemDto> getItems() {
        return items;
    }

    public void setItems(List<PurchaseReturnItemDto> items) {
        this.items = items;
    }
}
