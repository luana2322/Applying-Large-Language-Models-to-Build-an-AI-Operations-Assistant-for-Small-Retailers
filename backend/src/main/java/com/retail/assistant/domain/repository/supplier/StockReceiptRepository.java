package com.retail.assistant.domain.repository.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockReceiptRepository extends JpaRepository<StockReceipt, Long> {
    List<StockReceipt> findBySupplierId(Long id);
    List<StockReceipt> findByStaffId(Long id);
    List<StockReceipt> findByApprovedById(Long id);
}
