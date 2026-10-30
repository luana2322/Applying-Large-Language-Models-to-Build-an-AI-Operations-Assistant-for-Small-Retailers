package com.retail.assistant.domain.entity.catalog;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_attributes", indexes = {
    @Index(name = "idx_product_attr_product", columnList = "product_id"),
    @Index(name = "idx_product_attr_code", columnList = "attribute_code")
})
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "attribute_code", nullable = false, length = 50)
    private String attributeCode;

    @Column(name = "attribute_value", nullable = false, length = 255)
    private String attributeValue;

    @Column(length = 50)
    private String source = "MANUFACTURER_LABEL";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProductAttribute() {}

    public ProductAttribute(Product product, String attributeCode, String attributeValue, String source) {
        this.product = product;
        this.attributeCode = attributeCode;
        this.attributeValue = attributeValue;
        this.source = source != null ? source : "MANUFACTURER_LABEL";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getAttributeCode() { return attributeCode; }
    public void setAttributeCode(String attributeCode) { this.attributeCode = attributeCode; }
    public String getAttributeValue() { return attributeValue; }
    public void setAttributeValue(String attributeValue) { this.attributeValue = attributeValue; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
