package com.retail.assistant.domain.service.catalog.impl;

import com.retail.assistant.domain.entity.catalog.ProductImage;
import com.retail.assistant.domain.repository.catalog.ProductImageRepository;
import com.retail.assistant.domain.service.catalog.ProductImageService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository repository;

    public ProductImageServiceImpl(ProductImageRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public ProductImage save(ProductImage entity) {
        return repository.save(entity);
    }

    @Override
    public ProductImage getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("ProductImage not found: " + id));
    }

    @Override
    public Optional<ProductImage> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ProductImage> findAll() {
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
    public List<ProductImage> findByProductId(Long id) {
        return repository.findByProductId(id);
    }
}
