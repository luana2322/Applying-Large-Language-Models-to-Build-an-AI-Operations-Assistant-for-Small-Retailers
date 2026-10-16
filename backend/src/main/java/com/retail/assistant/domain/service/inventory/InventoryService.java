package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.dto.tool.ToolDtos.InventoryStatusData;
import com.retail.assistant.dto.tool.ToolDtos.SlowMovingData;

public interface InventoryService {

    InventoryStatusData getInventoryStatus(Long storeId, Long productId, String category, String statusFilter);

    SlowMovingData getSlowMovingProducts(Long storeId, Integer lookbackDays, Integer minStockQuantity, Integer maxSalesQuantity);
}
