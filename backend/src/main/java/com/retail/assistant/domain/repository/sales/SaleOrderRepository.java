package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {
    List<SaleOrder> findByCustomerId(Long id);
    List<SaleOrder> findByUserId(Long id);
    List<SaleOrder> findByParentOrderId(Long id);
    List<SaleOrder> findByCancelledById(Long id);
}
