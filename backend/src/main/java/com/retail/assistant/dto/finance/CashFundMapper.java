package com.retail.assistant.dto.finance;

import com.retail.assistant.domain.entity.finance.CashFund;

public final class CashFundMapper {
    private CashFundMapper() {}

    public static CashFund toEntity(CashFundRequest r) {
        CashFund e = new CashFund();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(CashFund e, CashFundRequest r) {
        if (r.code() != null) e.setCode(r.code());
        if (r.name() != null) e.setName(r.name());
        if (r.fundType() != null) e.setFundType(r.fundType());
        if (r.balance() != null) e.setBalance(r.balance());
        if (r.isDefault() != null) e.setIsDefault(r.isDefault());
        if (r.isActive() != null) e.setIsActive(r.isActive());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static CashFundResponse toResponse(CashFund e) {
        if (e == null) return null;
        return new CashFundResponse(
            e.getId(),
            e.getCode(),
            e.getName(),
            e.getFundType(),
            e.getBalance(),
            e.getIsDefault(),
            e.getIsActive(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
