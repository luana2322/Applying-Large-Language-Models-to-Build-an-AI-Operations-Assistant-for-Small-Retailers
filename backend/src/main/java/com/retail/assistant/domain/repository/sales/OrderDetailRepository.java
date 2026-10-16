package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrderId(Long id);
    List<OrderDetail> findByProductId(Long id);
    List<OrderDetail> findByUnitId(Long id);
}
