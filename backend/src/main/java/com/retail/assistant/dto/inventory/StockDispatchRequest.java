package com.retail.assistant.dto.inventory;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockDispatchRequest(String dispatchCode, Long orderId, Long userId, Long locationId, LocalDate dispatchDate, String status, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {}
