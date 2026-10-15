package com.retail.assistant.domain.service;

import com.retail.assistant.domain.entity.InventoryRecord;
import com.retail.assistant.domain.entity.OrderItem;
import com.retail.assistant.domain.entity.Product;
import com.retail.assistant.domain.repository.InventoryRecordRepository;
import com.retail.assistant.domain.repository.OrderItemRepository;
import com.retail.assistant.dto.ToolDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class RestockService {

    /** Safety bound on rows returned to the AI layer per query. */
    private static final int MAX_RESULT_ITEMS = 200;

    private final InventoryRecordRepository inventoryRecordRepository;
    private final OrderItemRepository orderItemRepository;

    public RestockService(InventoryRecordRepository inventoryRecordRepository, OrderItemRepository orderItemRepository) {
        this.inventoryRecordRepository = inventoryRecordRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public RestockSuggestionsData getRestockSuggestions(Long storeId, Long productId, Integer planningDays, Integer lookbackDays) {
        int finalPlanningDays = (planningDays != null && planningDays > 0) ? planningDays : 14;
        int finalLookbackDays = (lookbackDays != null && lookbackDays > 0) ? lookbackDays : 30;

        LocalDate start = LocalDate.now().minusDays(finalLookbackDays);
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = LocalDateTime.now();

        List<InventoryRecord> records = inventoryRecordRepository.findByStoreId(storeId);
        List<OrderItem> items = orderItemRepository.findCompletedItems(storeId, startDt, endDt);

        Map<Long, Long> salesMap = new HashMap<>();
        for (OrderItem oi : items) {
            if (oi.getProduct() == null) continue;
            Long pId = oi.getProduct().getId();
            salesMap.put(pId, salesMap.getOrDefault(pId, 0L) + oi.getQuantity());
        }

        List<RestockItemSuggestion> suggestions = new ArrayList<>();

        for (InventoryRecord r : records) {
            Product p = r.getProduct();
            if (p == null) continue;

            if (productId != null && !p.getId().equals(productId)) {
                continue;
            }

            int currentStock = r.getCurrentStock() != null ? r.getCurrentStock() : 0;
            int safetyStock = p.getMinStockLevel() != null ? p.getMinStockLevel() : 10;
            long soldInLookback = salesMap.getOrDefault(p.getId(), 0L);

            double dailyVelocity = (double) soldInLookback / (double) finalLookbackDays;
            double forecastDemand = dailyVelocity * (double) finalPlanningDays;
            int targetStock = (int) Math.ceil(forecastDemand + safetyStock);
            int suggestedQuantity = Math.max(0, targetStock - currentStock);

            if (suggestedQuantity > 0 || currentStock <= safetyStock) {
                String reason = String.format(
                    "Tốc độ bán %.2f %s/ngày (bán %d trong %d ngày qua). Nhu cầu dự kiến %d ngày tới là %.1f %s. " +
                    "Tồn an toàn %d %s, hiện chỉ còn %d %s trong kho.",
                    dailyVelocity, p.getUnit() != null ? p.getUnit() : "đơn vị",
                    soldInLookback, finalLookbackDays,
                    finalPlanningDays, forecastDemand, p.getUnit() != null ? p.getUnit() : "đơn vị",
                    safetyStock, p.getUnit() != null ? p.getUnit() : "đơn vị",
                    currentStock, p.getUnit() != null ? p.getUnit() : "đơn vị"
                );

                suggestions.add(new RestockItemSuggestion(
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    currentStock,
                    Math.round(dailyVelocity * 100.0) / 100.0,
                    targetStock,
                    suggestedQuantity,
                    reason
                ));
            }
        }

        // Sort descending by suggested restock quantity
        suggestions.sort(Comparator.comparing(RestockItemSuggestion::suggested_quantity).reversed());

        if (suggestions.size() > MAX_RESULT_ITEMS) {
            suggestions = new ArrayList<>(suggestions.subList(0, MAX_RESULT_ITEMS));
        }

        return new RestockSuggestionsData(finalPlanningDays, finalLookbackDays, suggestions);
    }
}
