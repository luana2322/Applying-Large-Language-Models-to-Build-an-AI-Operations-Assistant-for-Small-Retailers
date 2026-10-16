package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.OrderPayment;
import com.retail.assistant.domain.repository.sales.OrderPaymentRepository;
import com.retail.assistant.domain.service.sales.OrderPaymentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OrderPaymentServiceImpl implements OrderPaymentService {

    private final OrderPaymentRepository repository;

    public OrderPaymentServiceImpl(OrderPaymentRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public OrderPayment save(OrderPayment entity) {
        return repository.save(entity);
    }

    @Override
    public OrderPayment getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("OrderPayment not found: " + id));
    }

    @Override
    public Optional<OrderPayment> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<OrderPayment> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public List<OrderPayment> findByOrderId(Long id) {
        return repository.findByOrderId(id);
    }

    @Override
    public List<OrderPayment> findByCreatedById(Long id) {
        return repository.findByCreatedById(id);
    }
}
