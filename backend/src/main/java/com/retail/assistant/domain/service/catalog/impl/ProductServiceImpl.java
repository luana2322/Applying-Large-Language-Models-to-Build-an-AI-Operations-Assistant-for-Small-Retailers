package com.retail.assistant.domain.service.catalog.impl;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import com.retail.assistant.domain.service.catalog.ProductService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;

    public ProductServiceImpl(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Product save(Product entity) {
        return repository.save(entity);
    }

    @Override
    public Product getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
    }

    @Override
    public Optional<Product> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Product> findAll() {
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
}
