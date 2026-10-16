package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.ProductPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {
    List<ProductPriceHistory> findByProductId(Long id);
}
