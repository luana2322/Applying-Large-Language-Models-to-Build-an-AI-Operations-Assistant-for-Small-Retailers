package com.retail.assistant.domain.entity.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "product_units",
    uniqueConstraints = @UniqueConstraint(name = "uk_product_unit", columnNames = {"product_id", "unit_name"})
)
public class ProductUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "unit_name", nullable = false, length = 50)
    private String unitName;

    @Column(name = "conversion_rate", precision = 12, scale = 4, nullable = false)
    private BigDecimal conversionRate = BigDecimal.ONE;

    @Column(name = "is_base_unit", nullable = false)
    private Boolean isBaseUnit = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ProductUnit() {}

    public ProductUnit(Product product, String unitName, BigDecimal conversionRate, Boolean isBaseUnit) {
        this.product = product;
        this.unitName = unitName;
        this.conversionRate = conversionRate != null ? conversionRate : BigDecimal.ONE;
        this.isBaseUnit = isBaseUnit != null ? isBaseUnit : false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }
    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate; }
    public Boolean getIsBaseUnit() { return isBaseUnit; }
    public void setIsBaseUnit(Boolean isBaseUnit) { this.isBaseUnit = isBaseUnit; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
