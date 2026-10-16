package com.retail.assistant.domain.entity.sales;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_detail")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SaleOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProductUnit unit;

    @Column(precision = 15, scale = 4, nullable = false)
    private BigDecimal quantity;

    @Column(name = "price_at_time", precision = 15, scale = 2, nullable = false)
    private BigDecimal priceAtTime;

    @Column(name = "line_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "dispatched_qty", precision = 15, scale = 4, nullable = false)
    private BigDecimal dispatchedQty = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OrderDetail() {}

    public OrderDetail(SaleOrder order, Product product, BigDecimal quantity, BigDecimal priceAtTime) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.priceAtTime = priceAtTime;
        this.lineTotal = (quantity != null && priceAtTime != null) ? quantity.multiply(priceAtTime) : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SaleOrder getOrder() { return order; }
    public void setOrder(SaleOrder order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getPriceAtTime() { return priceAtTime; }
    public void setPriceAtTime(BigDecimal priceAtTime) { this.priceAtTime = priceAtTime; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public BigDecimal getDispatchedQty() { return dispatchedQty; }
    public void setDispatchedQty(BigDecimal dispatchedQty) { this.dispatchedQty = dispatchedQty; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
