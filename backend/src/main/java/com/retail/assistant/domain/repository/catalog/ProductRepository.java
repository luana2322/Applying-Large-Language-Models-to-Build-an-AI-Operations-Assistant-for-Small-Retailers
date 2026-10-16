package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreId(Long storeId);
    Optional<Product> findByIdAndStoreId(Long id, Long storeId);
    Optional<Product> findBySkuAndStoreId(String sku, Long storeId);
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p LEFT JOIN p.category c WHERE p.storeId = :storeId AND (c.name = :category OR p.categoryName = :category)")
    List<Product> findByStoreIdAndCategory(@org.springframework.data.repository.query.Param("storeId") Long storeId, @org.springframework.data.repository.query.Param("category") String category);
}
