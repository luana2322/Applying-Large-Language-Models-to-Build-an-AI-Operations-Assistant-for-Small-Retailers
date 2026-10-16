package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.product.id AS productId, oi.product.name AS productName, oi.product.sku AS sku, " +
           "SUM(oi.quantity) AS totalQuantity, SUM(oi.subtotal) AS totalRevenue " +
           "FROM OrderItem oi " +
           "WHERE oi.order.storeId = :storeId " +
           "AND oi.order.status = 'COMPLETED' " +
           "AND oi.order.createdAt >= :start AND oi.order.createdAt <= :end " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.sku")
    List<ProductSalesProjection> findAggregatedSales(
        @Param("storeId") Long storeId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    @Query("SELECT oi FROM OrderItem oi " +
           "WHERE oi.order.storeId = :storeId " +
           "AND oi.order.status = 'COMPLETED' " +
           "AND oi.order.createdAt >= :start AND oi.order.createdAt <= :end")
    List<OrderItem> findCompletedItems(
        @Param("storeId") Long storeId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    interface ProductSalesProjection {
        Long getProductId();
        String getProductName();
        String getSku();
        Long getTotalQuantity();
        Double getTotalRevenue();
    }
}
