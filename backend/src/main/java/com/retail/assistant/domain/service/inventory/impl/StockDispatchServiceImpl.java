package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.StockDispatch;
import com.retail.assistant.domain.repository.inventory.StockDispatchRepository;
import com.retail.assistant.domain.service.inventory.StockDispatchService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StockDispatchServiceImpl implements StockDispatchService {

    private final StockDispatchRepository repository;

    public StockDispatchServiceImpl(StockDispatchRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StockDispatch save(StockDispatch entity) {
        return repository.save(entity);
    }

    @Override
    public StockDispatch getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StockDispatch not found: " + id));
    }

    @Override
    public Optional<StockDispatch> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StockDispatch> findAll() {
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
    public List<StockDispatch> findByOrderId(Long id) {
        return repository.findByOrderId(id);
    }

    @Override
    public List<StockDispatch> findByUserId(Long id) {
        return repository.findByUserId(id);
    }

    @Override
    public List<StockDispatch> findByLocationId(Long id) {
        return repository.findByLocationId(id);
    }
}
