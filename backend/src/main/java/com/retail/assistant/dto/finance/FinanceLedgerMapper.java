package com.retail.assistant.dto.finance;

import com.retail.assistant.domain.entity.finance.FinanceLedger;
import com.retail.assistant.domain.entity.system.User;

public final class FinanceLedgerMapper {
    private FinanceLedgerMapper() {}

    public static FinanceLedger toEntity(FinanceLedgerRequest r) {
        FinanceLedger e = new FinanceLedger();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(FinanceLedger e, FinanceLedgerRequest r) {
        if (r.ledgerCode() != null) e.setLedgerCode(r.ledgerCode());
        if (r.transactionDate() != null) e.setTransactionDate(r.transactionDate());
        if (r.transactionType() != null) e.setTransactionType(r.transactionType());
        if (r.referenceType() != null) e.setReferenceType(r.referenceType());
        if (r.referenceId() != null) e.setReferenceId(r.referenceId());
        if (r.amount() != null) e.setAmount(r.amount());
        if (r.description() != null) e.setDescription(r.description());
        if (r.createdById() != null) {
            User ref = new User();
            ref.setId(r.createdById());
            e.setCreatedBy(ref);
        }
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static FinanceLedgerResponse toResponse(FinanceLedger e) {
        if (e == null) return null;
        return new FinanceLedgerResponse(
            e.getId(),
            e.getLedgerCode(),
            e.getTransactionDate(),
            e.getTransactionType(),
            e.getReferenceType(),
            e.getReferenceId(),
            e.getAmount(),
            e.getDescription(),
            e.getCreatedBy() != null ? e.getCreatedBy().getId() : null,
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
