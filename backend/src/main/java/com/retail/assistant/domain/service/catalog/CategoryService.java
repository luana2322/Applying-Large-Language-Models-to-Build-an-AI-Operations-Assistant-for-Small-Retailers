package com.retail.assistant.domain.service.catalog;

import com.retail.assistant.domain.entity.catalog.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryService {
    Category save(Category entity);
    Category getById(Long id);
    Optional<Category> findById(Long id);
    List<Category> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<Category> findByParentId(Long id);
}
