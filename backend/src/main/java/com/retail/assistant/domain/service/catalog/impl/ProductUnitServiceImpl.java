package com.retail.assistant.domain.service.catalog.impl;

import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.repository.catalog.ProductUnitRepository;
import com.retail.assistant.domain.service.catalog.ProductUnitService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProductUnitServiceImpl implements ProductUnitService {

    private final ProductUnitRepository repository;

    public ProductUnitServiceImpl(ProductUnitRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public ProductUnit save(ProductUnit entity) {
        return repository.save(entity);
    }

    @Override
    public ProductUnit getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("ProductUnit not found: " + id));
    }

    @Override
    public Optional<ProductUnit> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ProductUnit> findAll() {
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
    public List<ProductUnit> findByProductId(Long id) {
        return repository.findByProductId(id);
    }
}
