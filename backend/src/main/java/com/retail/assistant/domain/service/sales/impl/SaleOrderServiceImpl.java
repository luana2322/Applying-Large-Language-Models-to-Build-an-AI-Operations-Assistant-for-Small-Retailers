package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.repository.sales.SaleOrderRepository;
import com.retail.assistant.domain.service.sales.SaleOrderService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SaleOrderServiceImpl implements SaleOrderService {

    private final SaleOrderRepository repository;

    public SaleOrderServiceImpl(SaleOrderRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public SaleOrder save(SaleOrder entity) {
        return repository.save(entity);
    }

    @Override
    public SaleOrder getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("SaleOrder not found: " + id));
    }

    @Override
    public Optional<SaleOrder> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<SaleOrder> findAll() {
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
    public List<SaleOrder> findByCustomerId(Long id) {
        return repository.findByCustomerId(id);
    }

    @Override
    public List<SaleOrder> findByUserId(Long id) {
        return repository.findByUserId(id);
    }

    @Override
    public List<SaleOrder> findByParentOrderId(Long id) {
        return repository.findByParentOrderId(id);
    }

    @Override
    public List<SaleOrder> findByCancelledById(Long id) {
        return repository.findByCancelledById(id);
    }
}
