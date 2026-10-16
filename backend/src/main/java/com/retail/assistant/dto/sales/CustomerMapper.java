package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.Customer;

public final class CustomerMapper {
    private CustomerMapper() {}

    public static Customer toEntity(CustomerRequest r) {
        Customer e = new Customer();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Customer e, CustomerRequest r) {
        if (r.customerCode() != null) e.setCustomerCode(r.customerCode());
        if (r.name() != null) e.setName(r.name());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.email() != null) e.setEmail(r.email());
        if (r.addr() != null) e.setAddr(r.addr());
        if (r.loyaltyPoints() != null) e.setLoyaltyPoints(r.loyaltyPoints());
        if (r.totalSpent() != null) e.setTotalSpent(r.totalSpent());
        if (r.status() != null) e.setStatus(r.status());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
    }

    public static CustomerResponse toResponse(Customer e) {
        if (e == null) return null;
        return new CustomerResponse(
            e.getId(),
            e.getCustomerCode(),
            e.getName(),
            e.getPhone(),
            e.getEmail(),
            e.getAddr(),
            e.getLoyaltyPoints(),
            e.getTotalSpent(),
            e.getStatus(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getDeletedAt()
        );
    }
}
