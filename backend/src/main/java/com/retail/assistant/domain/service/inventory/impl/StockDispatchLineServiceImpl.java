package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.StockDispatchLine;
import com.retail.assistant.domain.repository.inventory.StockDispatchLineRepository;
import com.retail.assistant.domain.service.inventory.StockDispatchLineService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StockDispatchLineServiceImpl implements StockDispatchLineService {

    private final StockDispatchLineRepository repository;

    public StockDispatchLineServiceImpl(StockDispatchLineRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StockDispatchLine save(StockDispatchLine entity) {
        return repository.save(entity);
    }

    @Override
    public StockDispatchLine getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StockDispatchLine not found: " + id));
    }

    @Override
    public Optional<StockDispatchLine> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StockDispatchLine> findAll() {
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
    public List<StockDispatchLine> findByDispatchId(Long id) {
        return repository.findByDispatchId(id);
    }

    @Override
    public List<StockDispatchLine> findByProductId(Long id) {
        return repository.findByProductId(id);
    }

    @Override
    public List<StockDispatchLine> findByInventoryId(Long id) {
        return repository.findByInventoryId(id);
    }
}
