package com.retail.assistant.domain.repository.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockReceiptDetailRepository extends JpaRepository<StockReceiptDetail, Long> {
    List<StockReceiptDetail> findByReceiptId(Long id);
    List<StockReceiptDetail> findByProductId(Long id);
    List<StockReceiptDetail> findByUnitId(Long id);
}
