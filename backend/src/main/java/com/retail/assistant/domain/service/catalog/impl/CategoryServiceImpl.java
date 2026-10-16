package com.retail.assistant.domain.service.catalog.impl;

import com.retail.assistant.domain.entity.catalog.Category;
import com.retail.assistant.domain.repository.catalog.CategoryRepository;
import com.retail.assistant.domain.service.catalog.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repository;

    public CategoryServiceImpl(CategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Category save(Category entity) {
        return repository.save(entity);
    }

    @Override
    public Category getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
    }

    @Override
    public Optional<Category> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Category> findAll() {
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
    public List<Category> findByParentId(Long id) {
        return repository.findByParentId(id);
    }
}
