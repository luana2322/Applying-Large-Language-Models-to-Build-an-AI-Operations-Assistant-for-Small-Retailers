package com.retail.assistant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockDispatchLineResponse(Long id, Long dispatchId, Long productId, Long inventoryId, BigDecimal quantity, BigDecimal unitPriceSnapshot, LocalDateTime createdAt) {}
