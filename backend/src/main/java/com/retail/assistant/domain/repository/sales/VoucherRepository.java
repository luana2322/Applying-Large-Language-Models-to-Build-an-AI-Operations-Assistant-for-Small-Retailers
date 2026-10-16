package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
}
