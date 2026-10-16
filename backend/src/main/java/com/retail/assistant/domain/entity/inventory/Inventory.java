package com.retail.assistant.domain.entity.inventory;

import com.retail.assistant.domain.entity.catalog.Product;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "inventory",
    uniqueConstraints = @UniqueConstraint(name = "uk_inventory_batch", columnNames = {"product_id", "location_id", "batch_number"})
)
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "batch_number", nullable = false, length = 100)
    private String batchNumber = "DEFAULT";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(precision = 15, scale = 4, nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "min_quantity", precision = 15, scale = 4, nullable = false)
    private BigDecimal minQuantity = BigDecimal.ZERO;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Inventory() {}

    public Inventory(Product product, Location location, BigDecimal quantity, BigDecimal minQuantity) {
        this.product = product;
        this.location = location;
        this.batchNumber = "DEFAULT";
        this.quantity = quantity != null ? quantity : BigDecimal.ZERO;
        this.minQuantity = minQuantity != null ? minQuantity : BigDecimal.ZERO;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getMinQuantity() { return minQuantity; }
    public void setMinQuantity(BigDecimal minQuantity) { this.minQuantity = minQuantity; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
