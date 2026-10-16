package com.retail.assistant.domain.entity.inventory;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.entity.supplier.StockReceipt;
import com.retail.assistant.domain.entity.system.User;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_log")
public class InventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;

    @Column(name = "quantity_change", precision = 15, scale = 4, nullable = false)
    private BigDecimal quantityChange;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProductUnit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_id")
    private StockDispatch dispatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    private StockReceipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_location_id")
    private Location fromLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_location_id")
    private Location toLocation;

    @Column(name = "reference_note", length = 255)
    private String referenceNote;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public InventoryLog() {}

    public InventoryLog(Product product, String actionType, BigDecimal quantityChange, User user) {
        this.product = product;
        this.actionType = actionType;
        this.quantityChange = quantityChange;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public BigDecimal getQuantityChange() { return quantityChange; }
    public void setQuantityChange(BigDecimal quantityChange) { this.quantityChange = quantityChange; }
    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public StockDispatch getDispatch() { return dispatch; }
    public void setDispatch(StockDispatch dispatch) { this.dispatch = dispatch; }
    public StockReceipt getReceipt() { return receipt; }
    public void setReceipt(StockReceipt receipt) { this.receipt = receipt; }
    public Location getFromLocation() { return fromLocation; }
    public void setFromLocation(Location fromLocation) { this.fromLocation = fromLocation; }
    public Location getToLocation() { return toLocation; }
    public void setToLocation(Location toLocation) { this.toLocation = toLocation; }
    public String getReferenceNote() { return referenceNote; }
    public void setReferenceNote(String referenceNote) { this.referenceNote = referenceNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
