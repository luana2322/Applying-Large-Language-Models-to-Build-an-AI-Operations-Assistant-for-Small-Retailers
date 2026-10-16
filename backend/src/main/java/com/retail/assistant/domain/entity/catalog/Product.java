package com.retail.assistant.domain.entity.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "sku_code", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(unique = true, length = 100)
    private String barcode;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 4)
    private BigDecimal weight = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Operational/convenience fields for ERP & POS services
    @Column(name = "store_id")
    private Long storeId = 1L;

    @Column(name = "unit", length = 50)
    private String unit = "Cái";

    @Column(name = "cost_price")
    private Double costPrice;

    @Column(name = "selling_price")
    private Double sellingPrice;

    @Column(name = "min_stock_level")
    private Integer minStockLevel = 10;

    @Column(name = "category_name")
    private String categoryName;

    public Product() {}

    public Product(Long storeId, String sku, String name, String categoryName, String unit, Double costPrice, Double sellingPrice, Integer minStockLevel) {
        this.storeId = storeId != null ? storeId : 1L;
        this.sku = sku;
        this.name = name;
        this.categoryName = categoryName;
        this.unit = unit != null ? unit : "Cái";
        this.costPrice = costPrice;
        this.sellingPrice = sellingPrice;
        this.minStockLevel = minStockLevel != null ? minStockLevel : 10;
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() {
        if (category != null) return category.getName();
        return categoryName;
    }
    public void setCategory(String categoryName) {
        this.categoryName = categoryName;
    }
    public Category getCategoryEntity() { return category; }
    public void setCategoryEntity(Category category) { this.category = category; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getSkuCode() { return sku; }
    public void setSkuCode(String skuCode) { this.sku = skuCode; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    // Backward-compatibility getters/setters
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Double getCostPrice() { return costPrice; }
    public void setCostPrice(Double costPrice) { this.costPrice = costPrice; }
    public Double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }
    public Integer getMinStockLevel() { return minStockLevel; }
    public void setMinStockLevel(Integer minStockLevel) { this.minStockLevel = minStockLevel; }

    public String getCategoryName() {
        if (category != null) return category.getName();
        return categoryName;
    }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
