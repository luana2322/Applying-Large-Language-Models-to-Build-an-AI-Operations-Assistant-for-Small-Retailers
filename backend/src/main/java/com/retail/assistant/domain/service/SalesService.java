package com.retail.assistant.domain.service;

import com.retail.assistant.domain.entity.Order;
import com.retail.assistant.domain.entity.OrderItem;
import com.retail.assistant.domain.entity.Product;
import com.retail.assistant.domain.repository.OrderItemRepository;
import com.retail.assistant.domain.repository.OrderRepository;
import com.retail.assistant.domain.repository.ProductRepository;
import com.retail.assistant.dto.ToolDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SalesService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public SalesService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    public SalesSummaryData getSalesSummary(Long storeId, String startDateStr, String endDateStr, String groupBy) {
        LocalDate start = parseDate(startDateStr, LocalDate.now().minusDays(30));
        LocalDate end = parseDate(endDateStr, LocalDate.now());

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(LocalTime.MAX);

        List<Order> orders = orderRepository.findByStoreIdAndCreatedAtBetween(storeId, startDt, endDt);

        double gross = 0.0;
        double discount = 0.0;
        double returns = 0.0;
        double net = 0.0;
        long validOrderCount = 0;

        for (Order o : orders) {
            if ("COMPLETED".equalsIgnoreCase(o.getStatus())) {
                gross += (o.getTotalGross() != null ? o.getTotalGross() : 0.0);
                discount += (o.getDiscount() != null ? o.getDiscount() : 0.0);
                net += (o.getNetAmount() != null ? o.getNetAmount() : 0.0);
                validOrderCount++;
            } else if ("RETURNED".equalsIgnoreCase(o.getStatus())) {
                returns += (o.getNetAmount() != null ? o.getNetAmount() : 0.0);
            }
        }

        return new SalesSummaryData(
            start.toString(),
            end.toString(),
            Math.round(gross * 100.0) / 100.0,
            Math.round(discount * 100.0) / 100.0,
            Math.round(returns * 100.0) / 100.0,
            Math.round(net * 100.0) / 100.0,
            validOrderCount,
            "VND"
        );
    }

    public TopProductsData getTopProducts(Long storeId, String startDateStr, String endDateStr, String metric, Integer limit) {
        LocalDate start = parseDate(startDateStr, LocalDate.now().minusDays(30));
        LocalDate end = parseDate(endDateStr, LocalDate.now());
        int finalLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 5;
        String finalMetric = (metric != null && metric.equalsIgnoreCase("revenue")) ? "revenue" : "quantity";

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(LocalTime.MAX);

        var projections = orderItemRepository.findAggregatedSales(storeId, startDt, endDt);

        Comparator<OrderItemRepository.ProductSalesProjection> comparator;
        if ("revenue".equalsIgnoreCase(finalMetric)) {
            comparator = Comparator.comparing((OrderItemRepository.ProductSalesProjection p) -> 
                p.getTotalRevenue() != null ? p.getTotalRevenue() : 0.0).reversed();
        } else {
            comparator = Comparator.comparing((OrderItemRepository.ProductSalesProjection p) -> 
                p.getTotalQuantity() != null ? p.getTotalQuantity() : 0L).reversed();
        }

        List<ProductRankItem> ranked = new ArrayList<>();
        int rank = 1;
        for (var p : projections.stream().sorted(comparator).limit(finalLimit).toList()) {
            ranked.add(new ProductRankItem(
                rank++,
                p.getProductId(),
                p.getSku(),
                p.getProductName(),
                p.getTotalQuantity(),
                p.getTotalRevenue() != null ? Math.round(p.getTotalRevenue() * 100.0) / 100.0 : 0.0
            ));
        }

        return new TopProductsData(start.toString(), end.toString(), finalMetric, ranked);
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
