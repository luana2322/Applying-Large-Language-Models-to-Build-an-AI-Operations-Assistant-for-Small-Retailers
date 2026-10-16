package com.retail.assistant.dto.finance;

import com.retail.assistant.domain.entity.finance.CashTransaction;
import com.retail.assistant.domain.entity.finance.CashFund;
import com.retail.assistant.domain.entity.finance.FinanceLedger;
import com.retail.assistant.domain.entity.system.User;

public final class CashTransactionMapper {
    private CashTransactionMapper() {}

    public static CashTransaction toEntity(CashTransactionRequest r) {
        CashTransaction e = new CashTransaction();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(CashTransaction e, CashTransactionRequest r) {
        if (r.transactionCode() != null) e.setTransactionCode(r.transactionCode());
        if (r.fundId() != null) {
            CashFund ref = new CashFund();
            ref.setId(r.fundId());
            e.setFund(ref);
        }
        if (r.direction() != null) e.setDirection(r.direction());
        if (r.amount() != null) e.setAmount(r.amount());
        if (r.category() != null) e.setCategory(r.category());
        if (r.description() != null) e.setDescription(r.description());
        if (r.paymentMethod() != null) e.setPaymentMethod(r.paymentMethod());
        if (r.status() != null) e.setStatus(r.status());
        if (r.transactionDate() != null) e.setTransactionDate(r.transactionDate());
        if (r.financeLedgerId() != null) {
            FinanceLedger ref = new FinanceLedger();
            ref.setId(r.financeLedgerId());
            e.setFinanceLedger(ref);
        }
        if (r.createdById() != null) {
            User ref = new User();
            ref.setId(r.createdById());
            e.setCreatedBy(ref);
        }
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static CashTransactionResponse toResponse(CashTransaction e) {
        if (e == null) return null;
        return new CashTransactionResponse(
            e.getId(),
            e.getTransactionCode(),
            e.getFund() != null ? e.getFund().getId() : null,
            e.getDirection(),
            e.getAmount(),
            e.getCategory(),
            e.getDescription(),
            e.getPaymentMethod(),
            e.getStatus(),
            e.getTransactionDate(),
            e.getFinanceLedger() != null ? e.getFinanceLedger().getId() : null,
            e.getCreatedBy() != null ? e.getCreatedBy().getId() : null,
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
