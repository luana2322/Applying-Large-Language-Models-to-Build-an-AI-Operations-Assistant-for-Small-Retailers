package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.Voucher;
import java.util.List;
import java.util.Optional;

public interface VoucherService {
    Voucher save(Voucher entity);
    Voucher getById(Long id);
    Optional<Voucher> findById(Long id);
    List<Voucher> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
