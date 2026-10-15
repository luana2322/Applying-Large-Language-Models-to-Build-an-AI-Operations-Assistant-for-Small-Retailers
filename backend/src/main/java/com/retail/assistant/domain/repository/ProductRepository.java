package com.retail.assistant.domain.repository;

import com.retail.assistant.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreId(Long storeId);
    Optional<Product> findByIdAndStoreId(Long id, Long storeId);
    Optional<Product> findBySkuAndStoreId(String sku, Long storeId);
    List<Product> findByStoreIdAndCategory(Long storeId, String category);
}
