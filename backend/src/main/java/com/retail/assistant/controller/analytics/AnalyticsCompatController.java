package com.retail.assistant.controller.analytics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsCompatController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsCompatController.class);

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsCompatController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<Map<String, Object>> items = new ArrayList<>();
        try {
            String sql = """
                SELECT p.id as product_id, p.sku_code, p.name as product_name,
                       COALESCE(i.quantity, 0) as current_quantity,
                       COALESCE(i.min_quantity, 10) as min_quantity,
                       COALESCE(sales.avg_daily, 0.5) as avg_daily_sales
                FROM products p
                LEFT JOIN (
                    SELECT product_id, SUM(quantity) as quantity, MIN(min_quantity) as min_quantity
                    FROM inventory
                    GROUP BY product_id
                ) i ON p.id = i.product_id
                LEFT JOIN (
                    SELECT product_id, ROUND(CAST(SUM(quantity) / 30.0 AS NUMERIC), 2) as avg_daily
                    FROM order_detail
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY product_id
                ) sales ON p.id = sales.product_id
                WHERE p.deleted_at IS NULL
                ORDER BY (COALESCE(i.quantity, 0) - COALESCE(i.min_quantity, 10)) ASC
                LIMIT ?
            """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, limit);
            for (Map<String, Object> r : rows) {
                double currentQty = r.get("current_quantity") instanceof Number ? ((Number) r.get("current_quantity")).doubleValue() : 0.0;
                double minQty = r.get("min_quantity") instanceof Number ? ((Number) r.get("min_quantity")).doubleValue() : 10.0;
                double avgDaily = r.get("avg_daily_sales") instanceof Number ? ((Number) r.get("avg_daily_sales")).doubleValue() : 0.5;
                if (avgDaily <= 0) avgDaily = 0.5;

                int daysUntilStockout = (int) Math.max(0, Math.round(currentQty / avgDaily));
                String urgencyLevel = "STABLE";
                if (daysUntilStockout <= 7 || currentQty <= minQty) {
                    urgencyLevel = "CRITICAL";
                } else if (daysUntilStockout <= 15) {
                    urgencyLevel = "WARNING";
                }

                int suggestedReorder = (int) Math.max(10, Math.round(avgDaily * 30 - currentQty));

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("productId", r.get("product_id"));
                item.put("skuCode", r.get("sku_code"));
                item.put("productName", r.get("product_name"));
                item.put("currentQuantity", currentQty);
                item.put("minQuantity", minQty);
                item.put("avgDailySales", avgDaily);
                item.put("daysUntilStockout", daysUntilStockout);
                item.put("suggestedReorderQty", suggestedReorder);
                item.put("urgencyLevel", urgencyLevel);
                items.add(item);
            }
        } catch (Exception e) {
            log.warn("Lỗi tính forecast: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("items", items));
    }

    @GetMapping("/profit-by-sku")
    public ResponseEntity<Map<String, Object>> getProfitBySku(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<Map<String, Object>> items = new ArrayList<>();
        try {
            String sql = """
                SELECT p.id as product_id, p.sku_code, p.name as product_name,
                       COALESCE(SUM(od.quantity), 0) as qty_sold,
                       COALESCE(SUM(od.line_total), 0) as revenue,
                       COALESCE(SUM(od.quantity * COALESCE(p.cost_price, 0)), 0) as cost,
                       COALESCE(SUM(od.line_total - (od.quantity * COALESCE(p.cost_price, 0))), 0) as gross_profit
                FROM products p
                JOIN order_detail od ON p.id = od.product_id
                WHERE p.deleted_at IS NULL
                GROUP BY p.id, p.sku_code, p.name
                ORDER BY gross_profit DESC
                LIMIT ?
            """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, limit);
            for (Map<String, Object> r : rows) {
                double rev = r.get("revenue") instanceof Number ? ((Number) r.get("revenue")).doubleValue() : 0.0;
                double profit = r.get("gross_profit") instanceof Number ? ((Number) r.get("gross_profit")).doubleValue() : 0.0;
                double margin = rev > 0 ? Math.round((profit / rev * 100.0) * 10.0) / 10.0 : 0.0;

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("productId", r.get("product_id"));
                item.put("skuCode", r.get("sku_code"));
                item.put("productName", r.get("product_name"));
                item.put("qtySold", r.get("qty_sold"));
                item.put("revenue", rev);
                item.put("cost", r.get("cost"));
                item.put("grossProfit", profit);
                item.put("grossMarginPct", margin);
                items.add(item);
            }
        } catch (Exception e) {
            log.warn("Lỗi tính profit-by-sku: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("items", items));
    }
}
