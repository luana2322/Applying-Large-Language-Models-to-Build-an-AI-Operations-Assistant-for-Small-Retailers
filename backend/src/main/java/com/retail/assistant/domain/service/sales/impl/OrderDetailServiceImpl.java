package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.OrderDetail;
import com.retail.assistant.domain.repository.sales.OrderDetailRepository;
import com.retail.assistant.domain.service.sales.OrderDetailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository repository;

    public OrderDetailServiceImpl(OrderDetailRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public OrderDetail save(OrderDetail entity) {
        return repository.save(entity);
    }

    @Override
    public OrderDetail getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("OrderDetail not found: " + id));
    }

    @Override
    public Optional<OrderDetail> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<OrderDetail> findAll() {
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
    public List<OrderDetail> findByOrderId(Long id) {
        return repository.findByOrderId(id);
    }

    @Override
    public List<OrderDetail> findByProductId(Long id) {
        return repository.findByProductId(id);
    }

    @Override
    public List<OrderDetail> findByUnitId(Long id) {
        return repository.findByUnitId(id);
    }
}
