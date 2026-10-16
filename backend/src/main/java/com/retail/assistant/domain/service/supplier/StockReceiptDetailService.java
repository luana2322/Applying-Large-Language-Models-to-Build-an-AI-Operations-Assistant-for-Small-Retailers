package com.retail.assistant.domain.service.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceiptDetail;
import java.util.List;
import java.util.Optional;

public interface StockReceiptDetailService {
    StockReceiptDetail save(StockReceiptDetail entity);
    StockReceiptDetail getById(Long id);
    Optional<StockReceiptDetail> findById(Long id);
    List<StockReceiptDetail> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StockReceiptDetail> findByReceiptId(Long id);
    List<StockReceiptDetail> findByProductId(Long id);
    List<StockReceiptDetail> findByUnitId(Long id);
}
