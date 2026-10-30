package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long> {
    List<ProductAttribute> findByProductId(Long productId);
    List<ProductAttribute> findByAttributeCode(String attributeCode);
}
