package com.retail.assistant.domain.entity.supplier;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_receipt_detail")
public class StockReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private StockReceipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProductUnit unit;

    @Column(precision = 15, scale = 4, nullable = false)
    private BigDecimal quantity;

    @Column(name = "cost_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal costPrice;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "line_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public StockReceiptDetail() {}

    public StockReceiptDetail(StockReceipt receipt, Product product, BigDecimal quantity, BigDecimal costPrice) {
        this.receipt = receipt;
        this.product = product;
        this.quantity = quantity;
        this.costPrice = costPrice;
        this.lineTotal = (quantity != null && costPrice != null) ? quantity.multiply(costPrice) : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StockReceipt getReceipt() { return receipt; }
    public void setReceipt(StockReceipt receipt) { this.receipt = receipt; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
