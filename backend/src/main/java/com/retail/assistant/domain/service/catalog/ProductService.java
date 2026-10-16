package com.retail.assistant.domain.service.catalog;

import com.retail.assistant.domain.entity.catalog.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    Product save(Product entity);
    Product getById(Long id);
    Optional<Product> findById(Long id);
    List<Product> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
