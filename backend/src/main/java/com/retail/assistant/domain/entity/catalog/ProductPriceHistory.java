package com.retail.assistant.domain.entity.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_price_history")
public class ProductPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "cost_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "sale_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal salePrice = BigDecimal.ZERO;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProductPriceHistory() {}

    public ProductPriceHistory(Product product, BigDecimal costPrice, BigDecimal salePrice, LocalDate effectiveDate) {
        this.product = product;
        this.costPrice = costPrice != null ? costPrice : BigDecimal.ZERO;
        this.salePrice = salePrice != null ? salePrice : BigDecimal.ZERO;
        this.effectiveDate = effectiveDate != null ? effectiveDate : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
