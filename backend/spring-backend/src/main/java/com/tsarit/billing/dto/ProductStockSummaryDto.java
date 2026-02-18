package com.tsarit.billing.dto;

public class ProductStockSummaryDto {

    private Long productId;
    private String productName;
    private String category;
    private Integer totalStock;
    private Integer currentStock;
    private Integer totalSold;
    
    public ProductStockSummaryDto(
            Long productId,
            String productName,
            String category,
            Integer totalStock,
            Integer currentStock,
            Integer totalSold
    ) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.totalStock = totalStock;
        this.currentStock = currentStock;
        this.totalSold = totalSold;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getCategory() {
        return category;
    }

    public Integer getTotalStock() {
        return totalStock;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public Integer getTotalSold() {
        return totalSold;
    }
}

