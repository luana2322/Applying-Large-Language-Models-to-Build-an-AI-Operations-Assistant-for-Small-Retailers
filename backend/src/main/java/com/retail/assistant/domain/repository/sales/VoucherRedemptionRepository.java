package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.VoucherRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRedemptionRepository extends JpaRepository<VoucherRedemption, Long> {
    List<VoucherRedemption> findByVoucherId(Long id);
    List<VoucherRedemption> findBySaleOrderId(Long id);
}
