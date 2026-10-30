package com.retail.assistant.controller.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsCompatController {

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(Map.of(
                "productId", 1,
                "skuCode", "DN-TP-PVC27",
                "productName", "Ống nhựa PVC Tiền Phong D27 dày 1.8mm (cây 4m)",
                "currentQuantity", 180,
                "minQuantity", 50,
                "avgDailySales", 14.5,
                "daysUntilStockout", 12,
                "suggestedReorderQty", 200,
                "urgencyLevel", "WARNING"
        ));
        items.add(Map.of(
                "productId", 2,
                "skuCode", "CDV-CV2.5",
                "productName", "Dây điện đơn Cadivi CV 2.5mm² (cuộn 100m)",
                "currentQuantity", 45,
                "minQuantity", 15,
                "avgDailySales", 4.2,
                "daysUntilStockout", 10,
                "suggestedReorderQty", 50,
                "urgencyLevel", "CRITICAL"
        ));
        items.add(Map.of(
                "productId", 3,
                "skuCode", "TBVS-LVB-INAX299",
                "productName", "Chậu Lavabo sứ đặt bàn Trắng tuyết Nano (INAX AL-299V)",
                "currentQuantity", 8,
                "minQuantity", 4,
                "avgDailySales", 0.6,
                "daysUntilStockout", 13,
                "suggestedReorderQty", 10,
                "urgencyLevel", "LOW"
        ));
        items.add(Map.of(
                "productId", 4,
                "skuCode", "GACH-60-CALACATTA",
                "productName", "Gạch men vi tính bóng kiếng Calacatta White 60x60",
                "currentQuantity", 140,
                "minQuantity", 30,
                "avgDailySales", 5.0,
                "daysUntilStockout", 28,
                "suggestedReorderQty", 100,
                "urgencyLevel", "STABLE"
        ));

        return ResponseEntity.ok(Map.of("items", items));
    }

    @GetMapping("/profit-by-sku")
    public ResponseEntity<Map<String, Object>> getProfitBySku(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(Map.of(
                "productId", 1,
                "skuCode", "DN-TP-PVC27",
                "productName", "Ống nhựa PVC Tiền Phong D27",
                "qtySold", 120,
                "revenue", 5040000.0,
                "cost", 3360000.0,
                "grossProfit", 1680000.0,
                "grossMarginPct", 33.3
        ));
        items.add(Map.of(
                "productId", 2,
                "skuCode", "CDV-CV2.5",
                "productName", "Dây điện đơn Cadivi CV 2.5mm²",
                "qtySold", 25,
                "revenue", 15500000.0,
                "cost", 11250000.0,
                "grossProfit", 4250000.0,
                "grossMarginPct", 27.4
        ));
        items.add(Map.of(
                "productId", 3,
                "skuCode", "TBVS-LVB-INAX299",
                "productName", "Chậu Lavabo sứ đặt bàn Trắng tuyết Nano",
                "qtySold", 6,
                "revenue", 9900000.0,
                "cost", 6900000.0,
                "grossProfit", 3000000.0,
                "grossMarginPct", 30.3
        ));

        return ResponseEntity.ok(Map.of(
                "items", items,
                "totalRevenue", 30440000.0,
                "totalCost", 21510000.0,
                "totalGrossProfit", 8930000.0
        ));
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<Map<String, Object>> getRevenueTrend(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        List<Map<String, Object>> points = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 14; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long rev = 3500000L + (long)(Math.random() * 4500000L);
            long profit = (long)(rev * 0.3);
            points.add(Map.of(
                    "date", d.toString(),
                    "label", d.getDayOfMonth() + "/" + d.getMonthValue(),
                    "revenue", rev,
                    "profit", profit,
                    "orders", 3 + (int)(Math.random() * 5)
            ));
        }

        return ResponseEntity.ok(Map.of(
                "points", points,
                "totalRevenue", 62500000.0,
                "totalProfit", 18750000.0
        ));
    }

    @GetMapping("/business-health")
    public ResponseEntity<Map<String, Object>> getBusinessHealth() {
        Map<String, Object> forecastItems = Map.of(
                "items", List.of(
                        Map.of(
                                "productId", 1,
                                "skuCode", "DN-TP-PVC27",
                                "productName", "Ống nhựa PVC Tiền Phong D27",
                                "currentQuantity", 180,
                                "minQuantity", 50,
                                "avgDailySales", 14.5,
                                "daysUntilStockout", 12,
                                "suggestedReorderQty", 200,
                                "urgencyLevel", "WARNING"
                        )
                )
        );

        Map<String, Object> debtHealth = Map.of(
                "receivableTotal", 49800000.0,
                "payableTotal", 18500000.0,
                "receivableOverdue", 37500000.0,
                "payableOverdue", 0.0,
                "overdueCount", 2,
                "topOverdue", List.of(
                        Map.of(
                                "debtId", 1,
                                "debtCode", "NO-THAU-KIENA",
                                "partnerType", "Customer",
                                "partnerName", "Công ty Xây dựng Kiến Á",
                                "remainingAmount", 25000000.0,
                                "daysOverdue", 12
                        ),
                        Map.of(
                                "debtId", 2,
                                "debtCode", "NO-THO-NAM",
                                "partnerType", "Customer",
                                "partnerName", "Hoàng Văn Nam (Thợ điện nước)",
                                "remainingAmount", 12500000.0,
                                "daysOverdue", 10
                        )
                )
        );

        Map<String, Object> cashflowHealth = Map.of(
                "currentBalance", 120500000.0,
                "monthIncome", 185000000.0,
                "monthExpense", 112000000.0,
                "monthNet", 73000000.0,
                "lastMonthNet", 62000000.0,
                "status", "HEALTHY"
        );

        Map<String, Object> domainHealthy = Map.of("status", "HEALTHY", "score", 85);
        Map<String, Object> domainWarning = Map.of("status", "WARNING", "score", 65);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("inventory", forecastItems);
        res.put("debt", debtHealth);
        res.put("cashflow", cashflowHealth);
        res.put("inventoryHealth", domainHealthy);
        res.put("debtHealth", domainWarning);
        res.put("cashflowHealth", domainHealthy);
        res.put("overall", domainHealthy);
        res.put("financialsVisible", true);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/business-health/ai-suggestions")
    public ResponseEntity<Map<String, Object>> getAiSuggestions(@RequestBody(required = false) Map<String, Object> body) {
        List<Map<String, String>> suggestions = List.of(
                Map.of(
                        "category", "debt",
                        "severity", "high",
                        "text", "Khoản nợ 25 triệu của Nhà thầu Kiến Á đã quá hạn 12 ngày. Hãy dùng AI nhắc nợ Zalo để yêu cầu đối chiếu và thanh toán trước 50%."
                ),
                Map.of(
                        "category", "inventory",
                        "severity", "medium",
                        "text", "Dây cáp Cadivi 2x2.5 và Ống PVC Tiền Phong D27 đang có nhu cầu thi công lớn, đề xuất nhập thêm trước cuối tuần."
                ),
                Map.of(
                        "category", "cashflow",
                        "severity", "low",
                        "text", "Dòng tiền tháng này đang thặng dư +73 triệu, đủ năng lực vốn lưu động để mở rộng thêm nhóm gạch men Calacatta."
                )
        );
        return ResponseEntity.ok(Map.of("suggestions", suggestions));
    }
}
