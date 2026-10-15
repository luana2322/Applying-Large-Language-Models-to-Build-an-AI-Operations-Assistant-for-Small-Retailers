package com.retail.assistant.domain.service;

import com.retail.assistant.domain.entity.OrderItem;
import com.retail.assistant.domain.repository.OrderItemRepository;
import com.retail.assistant.domain.repository.OrderRepository;
import com.retail.assistant.dto.ToolDtos.ProfitSummaryData;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProfitService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public ProfitService(OrderItemRepository orderItemRepository, OrderRepository orderRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    public ProfitSummaryData getProfitSummary(Long storeId, String startDateStr, String endDateStr) {
        LocalDate start = parseDate(startDateStr, LocalDate.now().minusDays(30));
        LocalDate end = parseDate(endDateStr, LocalDate.now());

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(LocalTime.MAX);

        List<OrderItem> items = orderItemRepository.findCompletedItems(storeId, startDt, endDt);

        double netRevenue = 0.0;
        double cogs = 0.0;
        boolean hasMissingCost = false;

        for (OrderItem item : items) {
            double subtotal = item.getSubtotal() != null ? item.getSubtotal() : 0.0;
            netRevenue += subtotal;

            Double unitCost = item.getCostPrice();
            if (unitCost == null && item.getProduct() != null) {
                unitCost = item.getProduct().getCostPrice();
            }

            if (unitCost != null) {
                cogs += (unitCost * item.getQuantity());
            } else {
                hasMissingCost = true;
            }
        }

        double grossProfit = netRevenue - cogs;
        Double grossMargin = null;
        String note = null;

        if (netRevenue > 0) {
            grossMargin = Math.round((grossProfit / netRevenue) * 10000.0) / 100.0;
        } else {
            grossMargin = 0.0;
            note = "Doanh thu trong kỳ bằng 0, biên lợi nhuận gộp không xác định.";
        }

        if (hasMissingCost) {
            note = (note != null ? note + " " : "") + "Có sản phẩm bán ra chưa cập nhật giá vốn, lợi nhuận gộp ước tính có thể cao hơn thực tế.";
        }

        return new ProfitSummaryData(
            start.toString(),
            end.toString(),
            Math.round(netRevenue * 100.0) / 100.0,
            Math.round(cogs * 100.0) / 100.0,
            Math.round(grossProfit * 100.0) / 100.0,
            grossMargin,
            hasMissingCost,
            "VND",
            note
        );
    }

    private LocalDate parseDate(String dateStr, LocalDate defaultDate) {
        if (dateStr == null || dateStr.isBlank()) return defaultDate;
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (DateTimeParseException e) {
            return defaultDate;
        }
    }
}
