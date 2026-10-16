package com.retail.assistant.domain.service.catalog;

import com.retail.assistant.domain.entity.catalog.ProductUnit;
import java.util.List;
import java.util.Optional;

public interface ProductUnitService {
    ProductUnit save(ProductUnit entity);
    ProductUnit getById(Long id);
    Optional<ProductUnit> findById(Long id);
    List<ProductUnit> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<ProductUnit> findByProductId(Long id);
}
