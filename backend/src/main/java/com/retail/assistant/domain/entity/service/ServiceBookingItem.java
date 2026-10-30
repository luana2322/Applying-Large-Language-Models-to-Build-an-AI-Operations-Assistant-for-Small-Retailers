package com.retail.assistant.domain.entity.service;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_booking_items", indexes = {
    @Index(name = "idx_booking_items_booking", columnList = "booking_id"),
    @Index(name = "idx_booking_items_service", columnList = "service_id")
})
public class ServiceBookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private ServiceBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(name = "price_at_time", precision = 15, scale = 2, nullable = false)
    private BigDecimal priceAtTime;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "line_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ServiceBookingItem() {}

    public ServiceBookingItem(ServiceBooking booking, Service service, BigDecimal priceAtTime, Integer quantity) {
        this.booking = booking;
        this.service = service;
        this.priceAtTime = priceAtTime;
        this.quantity = quantity != null ? quantity : 1;
        this.lineTotal = priceAtTime.multiply(BigDecimal.valueOf(this.quantity));
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ServiceBooking getBooking() { return booking; }
    public void setBooking(ServiceBooking booking) { this.booking = booking; }
    public Service getService() { return service; }
    public void setService(Service service) { this.service = service; }
    public BigDecimal getPriceAtTime() { return priceAtTime; }
    public void setPriceAtTime(BigDecimal priceAtTime) { this.priceAtTime = priceAtTime; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
