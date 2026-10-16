package com.retail.assistant.domain.entity.sales;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "vouchers_redemptions",
    uniqueConstraints = @UniqueConstraint(name = "uk_voucher_order", columnNames = {"voucher_id", "sales_order_id"})
)
public class VoucherRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SaleOrder saleOrder;

    @Column(name = "discount_used", precision = 15, scale = 2, nullable = false)
    private BigDecimal discountUsed = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VoucherRedemption() {}

    public VoucherRedemption(Voucher voucher, SaleOrder saleOrder, BigDecimal discountUsed) {
        this.voucher = voucher;
        this.saleOrder = saleOrder;
        this.discountUsed = discountUsed != null ? discountUsed : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Voucher getVoucher() { return voucher; }
    public void setVoucher(Voucher voucher) { this.voucher = voucher; }
    public SaleOrder getSaleOrder() { return saleOrder; }
    public void setSaleOrder(SaleOrder saleOrder) { this.saleOrder = saleOrder; }
    public BigDecimal getDiscountUsed() { return discountUsed; }
    public void setDiscountUsed(BigDecimal discountUsed) { this.discountUsed = discountUsed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
