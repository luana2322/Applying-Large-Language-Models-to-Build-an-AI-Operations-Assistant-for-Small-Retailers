package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.OrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {
    List<OrderPayment> findByOrderId(Long id);
    List<OrderPayment> findByCreatedById(Long id);
}
