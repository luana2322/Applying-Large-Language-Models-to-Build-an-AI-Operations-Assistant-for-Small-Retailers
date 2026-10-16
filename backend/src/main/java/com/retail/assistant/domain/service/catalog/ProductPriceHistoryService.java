package com.retail.assistant.domain.service.catalog;

import com.retail.assistant.domain.entity.catalog.ProductPriceHistory;
import java.util.List;
import java.util.Optional;

public interface ProductPriceHistoryService {
    ProductPriceHistory save(ProductPriceHistory entity);
    ProductPriceHistory getById(Long id);
    Optional<ProductPriceHistory> findById(Long id);
    List<ProductPriceHistory> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<ProductPriceHistory> findByProductId(Long id);
}
