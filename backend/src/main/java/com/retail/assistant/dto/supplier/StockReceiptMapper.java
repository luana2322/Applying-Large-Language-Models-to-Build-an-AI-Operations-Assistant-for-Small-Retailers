package com.retail.assistant.dto.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceipt;
import com.retail.assistant.domain.entity.supplier.Supplier;
import com.retail.assistant.domain.entity.system.User;

public final class StockReceiptMapper {
    private StockReceiptMapper() {}

    public static StockReceipt toEntity(StockReceiptRequest r) {
        StockReceipt e = new StockReceipt();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StockReceipt e, StockReceiptRequest r) {
        if (r.receiptCode() != null) e.setReceiptCode(r.receiptCode());
        if (r.supplierId() != null) {
            Supplier ref = new Supplier();
            ref.setId(r.supplierId());
            e.setSupplier(ref);
        }
        if (r.staffId() != null) {
            User ref = new User();
            ref.setId(r.staffId());
            e.setStaff(ref);
        }
        if (r.receiptDate() != null) e.setReceiptDate(r.receiptDate());
        if (r.status() != null) e.setStatus(r.status());
        if (r.invoiceNumber() != null) e.setInvoiceNumber(r.invoiceNumber());
        if (r.totalAmount() != null) e.setTotalAmount(r.totalAmount());
        if (r.notes() != null) e.setNotes(r.notes());
        if (r.approvedById() != null) {
            User ref = new User();
            ref.setId(r.approvedById());
            e.setApprovedBy(ref);
        }
        if (r.approvedAt() != null) e.setApprovedAt(r.approvedAt());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static StockReceiptResponse toResponse(StockReceipt e) {
        if (e == null) return null;
        return new StockReceiptResponse(
            e.getId(),
            e.getReceiptCode(),
            e.getSupplier() != null ? e.getSupplier().getId() : null,
            e.getStaff() != null ? e.getStaff().getId() : null,
            e.getReceiptDate(),
            e.getStatus(),
            e.getInvoiceNumber(),
            e.getTotalAmount(),
            e.getNotes(),
            e.getApprovedBy() != null ? e.getApprovedBy().getId() : null,
            e.getApprovedAt(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
