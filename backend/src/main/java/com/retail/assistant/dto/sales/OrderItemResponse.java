package com.retail.assistant.dto.sales;

public record OrderItemResponse(Long id, Long orderId, Long productId, Integer quantity, Double unitPrice, Double costPrice, Double subtotal) {}
