package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.VoucherRedemption;
import java.util.List;
import java.util.Optional;

public interface VoucherRedemptionService {
    VoucherRedemption save(VoucherRedemption entity);
    VoucherRedemption getById(Long id);
    Optional<VoucherRedemption> findById(Long id);
    List<VoucherRedemption> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<VoucherRedemption> findByVoucherId(Long id);
    List<VoucherRedemption> findBySaleOrderId(Long id);
}
