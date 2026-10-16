package com.retail.assistant.domain.entity.inventory;

import com.retail.assistant.domain.entity.catalog.Product;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_dispatch_lines")
public class StockDispatchLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_id", nullable = false)
    private StockDispatch dispatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @Column(precision = 15, scale = 4, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price_snapshot", precision = 15, scale = 2, nullable = false)
    private BigDecimal unitPriceSnapshot = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public StockDispatchLine() {}

    public StockDispatchLine(StockDispatch dispatch, Product product, Inventory inventory, BigDecimal quantity, BigDecimal unitPriceSnapshot) {
        this.dispatch = dispatch;
        this.product = product;
        this.inventory = inventory;
        this.quantity = quantity;
        this.unitPriceSnapshot = unitPriceSnapshot != null ? unitPriceSnapshot : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StockDispatch getDispatch() { return dispatch; }
    public void setDispatch(StockDispatch dispatch) { this.dispatch = dispatch; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Inventory getInventory() { return inventory; }
    public void setInventory(Inventory inventory) { this.inventory = inventory; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
