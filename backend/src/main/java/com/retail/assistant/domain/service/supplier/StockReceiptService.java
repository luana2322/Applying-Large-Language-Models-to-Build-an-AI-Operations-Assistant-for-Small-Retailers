package com.retail.assistant.domain.service.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceipt;
import java.util.List;
import java.util.Optional;

public interface StockReceiptService {
    StockReceipt save(StockReceipt entity);
    StockReceipt getById(Long id);
    Optional<StockReceipt> findById(Long id);
    List<StockReceipt> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StockReceipt> findBySupplierId(Long id);
    List<StockReceipt> findByStaffId(Long id);
    List<StockReceipt> findByApprovedById(Long id);
}
