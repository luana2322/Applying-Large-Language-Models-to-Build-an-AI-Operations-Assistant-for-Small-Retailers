package com.retail.assistant.domain.service.catalog.impl;

import com.retail.assistant.domain.entity.catalog.ProductPriceHistory;
import com.retail.assistant.domain.repository.catalog.ProductPriceHistoryRepository;
import com.retail.assistant.domain.service.catalog.ProductPriceHistoryService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProductPriceHistoryServiceImpl implements ProductPriceHistoryService {

    private final ProductPriceHistoryRepository repository;

    public ProductPriceHistoryServiceImpl(ProductPriceHistoryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public ProductPriceHistory save(ProductPriceHistory entity) {
        return repository.save(entity);
    }

    @Override
    public ProductPriceHistory getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("ProductPriceHistory not found: " + id));
    }

    @Override
    public Optional<ProductPriceHistory> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ProductPriceHistory> findAll() {
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
    public List<ProductPriceHistory> findByProductId(Long id) {
        return repository.findByProductId(id);
    }
}
