package com.retail.assistant.domain.repository.sales;

import com.retail.assistant.domain.entity.sales.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.storeId = :storeId AND o.status = :status AND o.createdAt >= :start AND o.createdAt <= :end")
    List<Order> findValidOrders(
        @Param("storeId") Long storeId,
        @Param("status") String status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
