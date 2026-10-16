package com.retail.assistant.dto.sales;

public record OrderItemRequest(Long orderId, Long productId, Integer quantity, Double unitPrice, Double costPrice, Double subtotal) {}
