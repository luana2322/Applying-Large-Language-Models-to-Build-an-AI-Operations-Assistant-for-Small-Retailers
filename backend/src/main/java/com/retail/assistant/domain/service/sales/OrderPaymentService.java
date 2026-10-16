package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.OrderPayment;
import java.util.List;
import java.util.Optional;

public interface OrderPaymentService {
    OrderPayment save(OrderPayment entity);
    OrderPayment getById(Long id);
    Optional<OrderPayment> findById(Long id);
    List<OrderPayment> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<OrderPayment> findByOrderId(Long id);
    List<OrderPayment> findByCreatedById(Long id);
}
