package com.tsarit.billing.dto;

public class PrintDataDto {
    private BusinessPrintDto business;
    private SupplierPrintDto supplier;

    // Constructors
    public PrintDataDto() {
    }

    public PrintDataDto(BusinessPrintDto business, SupplierPrintDto supplier) {
        this.business = business;
        this.supplier = supplier;
    }

    // Getters and Setters
    public BusinessPrintDto getBusiness() {
        return business;
    }

    public void setBusiness(BusinessPrintDto business) {
        this.business = business;
    }

    public SupplierPrintDto getSupplier() {
        return supplier;
    }

    public void setSupplier(SupplierPrintDto supplier) {
        this.supplier = supplier;
    }
}
