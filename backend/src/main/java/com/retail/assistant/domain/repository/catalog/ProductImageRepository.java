package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductId(Long id);
}
