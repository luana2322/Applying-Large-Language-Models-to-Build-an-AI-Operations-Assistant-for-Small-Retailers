package com.retail.assistant.domain.entity.sales;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storeId;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @Column(nullable = false)
    private String status = "COMPLETED"; // COMPLETED, CANCELLED, RETURNED

    private Double totalGross = 0.0;
    private Double discount = 0.0;
    private Double netAmount = 0.0;
    private String paymentMethod = "CASH";

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Order(Long storeId, String orderCode, String status, Double totalGross, Double discount, Double netAmount, String paymentMethod, LocalDateTime createdAt) {
        this.storeId = storeId;
        this.orderCode = orderCode;
        this.status = status;
        this.totalGross = totalGross;
        this.discount = discount;
        this.netAmount = netAmount;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }
    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getTotalGross() { return totalGross; }
    public void setTotalGross(Double totalGross) { this.totalGross = totalGross; }
    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }
    public Double getNetAmount() { return netAmount; }
    public void setNetAmount(Double netAmount) { this.netAmount = netAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
