package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.InventoryRecord;
import com.retail.assistant.domain.entity.sales.OrderItem;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.repository.inventory.InventoryRecordRepository;
import com.retail.assistant.domain.repository.sales.OrderItemRepository;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import com.retail.assistant.domain.service.inventory.InventoryService;
import com.retail.assistant.dto.tool.ToolDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    /** Safety bound on rows returned to the AI layer per query. */
    private static final int MAX_RESULT_ITEMS = 200;

    private final InventoryRecordRepository inventoryRecordRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public InventoryServiceImpl(
        InventoryRecordRepository inventoryRecordRepository,
        ProductRepository productRepository,
        OrderItemRepository orderItemRepository
    ) {
        this.inventoryRecordRepository = inventoryRecordRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public InventoryStatusData getInventoryStatus(Long storeId, Long productId, String category, String statusFilter) {
        List<InventoryRecord> records = inventoryRecordRepository.findByStoreId(storeId);

        List<InventoryItemData> items = new ArrayList<>();
        int lowStockCount = 0;
        int outOfStockCount = 0;

        for (InventoryRecord r : records) {
            Product p = r.getProduct();
            if (p == null) continue;

            if (productId != null && !p.getId().equals(productId)) {
                continue;
            }
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase(p.getCategory())) {
                continue;
            }

            int stock = r.getCurrentStock() != null ? r.getCurrentStock() : 0;
            int minStock = p.getMinStockLevel() != null ? p.getMinStockLevel() : 10;

            String stockStatus = "NORMAL";
            if (stock <= 0) {
                stockStatus = "OUT_OF_STOCK";
                outOfStockCount++;
            } else if (stock <= minStock) {
                stockStatus = "LOW_STOCK";
                lowStockCount++;
            }

            if (statusFilter != null && !statusFilter.isBlank()) {
                if ("low_stock".equalsIgnoreCase(statusFilter) && !"LOW_STOCK".equals(stockStatus)) {
                    continue;
                }
                if ("out_of_stock".equalsIgnoreCase(statusFilter) && !"OUT_OF_STOCK".equals(stockStatus)) {
                    continue;
                }
            }

            items.add(new InventoryItemData(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getCategory(),
                p.getUnit(),
                stock,
                minStock,
                stockStatus
            ));
        }

        List<InventoryItemData> boundedItems = items.size() > MAX_RESULT_ITEMS
            ? new ArrayList<>(items.subList(0, MAX_RESULT_ITEMS))
            : items;

        return new InventoryStatusData(boundedItems.size(), lowStockCount, outOfStockCount, boundedItems);
    }

    @Override
    public SlowMovingData getSlowMovingProducts(Long storeId, Integer lookbackDays, Integer minStockQuantity, Integer maxSalesQuantity) {
        int finalLookback = (lookbackDays != null && lookbackDays > 0) ? lookbackDays : 30;
        int minStock = (minStockQuantity != null && minStockQuantity >= 0) ? minStockQuantity : 5;
        int maxSales = (maxSalesQuantity != null && maxSalesQuantity >= 0) ? maxSalesQuantity : 2;

        LocalDate start = LocalDate.now().minusDays(finalLookback);
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = LocalDateTime.now();

        List<InventoryRecord> records = inventoryRecordRepository.findByStoreId(storeId);
        List<OrderItem> completedItems = orderItemRepository.findCompletedItems(storeId, startDt, endDt);

        Map<Long, Long> salesMap = new HashMap<>();
        Map<Long, LocalDateTime> lastSoldMap = new HashMap<>();

        for (OrderItem oi : completedItems) {
            if (oi.getProduct() == null) continue;
            Long pId = oi.getProduct().getId();
            salesMap.put(pId, salesMap.getOrDefault(pId, 0L) + oi.getQuantity());

            LocalDateTime orderTime = oi.getOrder() != null ? oi.getOrder().getCreatedAt() : null;
            if (orderTime != null) {
                LocalDateTime prev = lastSoldMap.get(pId);
                if (prev == null || orderTime.isAfter(prev)) {
                    lastSoldMap.put(pId, orderTime);
                }
            }
        }

        List<SlowMovingItem> slowMovingList = new ArrayList<>();

        for (InventoryRecord r : records) {
            Product p = r.getProduct();
            if (p == null) continue;

            int stock = r.getCurrentStock() != null ? r.getCurrentStock() : 0;
            long sold = salesMap.getOrDefault(p.getId(), 0L);

            if (stock >= minStock && sold <= maxSales) {
                LocalDateTime lastSold = lastSoldMap.get(p.getId());
                String lastSoldStr = (lastSold != null) ? lastSold.toLocalDate().toString() : "Không có giao dịch trong kỳ";
                String reason = String.format("Tồn kho còn %d %s nhưng chỉ bán được %d %s trong %d ngày qua.",
                    stock, p.getUnit() != null ? p.getUnit() : "sản phẩm", sold, p.getUnit() != null ? p.getUnit() : "sản phẩm", finalLookback);

                slowMovingList.add(new SlowMovingItem(
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    stock,
                    sold,
                    lastSoldStr,
                    reason
                ));
            }
        }

        if (slowMovingList.size() > MAX_RESULT_ITEMS) {
            slowMovingList = new ArrayList<>(slowMovingList.subList(0, MAX_RESULT_ITEMS));
        }

        return new SlowMovingData(finalLookback, slowMovingList);
    }
}
