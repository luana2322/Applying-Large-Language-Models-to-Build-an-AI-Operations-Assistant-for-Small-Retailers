package com.retail.assistant.domain.service.catalog;

import com.retail.assistant.domain.entity.catalog.ProductImage;
import java.util.List;
import java.util.Optional;

public interface ProductImageService {
    ProductImage save(ProductImage entity);
    ProductImage getById(Long id);
    Optional<ProductImage> findById(Long id);
    List<ProductImage> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<ProductImage> findByProductId(Long id);
}
