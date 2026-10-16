package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductUnitRepository extends JpaRepository<ProductUnit, Long> {
    List<ProductUnit> findByProductId(Long id);
}
