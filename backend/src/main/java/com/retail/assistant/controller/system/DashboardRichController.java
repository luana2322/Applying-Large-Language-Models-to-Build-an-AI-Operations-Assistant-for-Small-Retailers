package com.retail.assistant.controller.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardRichController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam(defaultValue = "7") int trendDays,
            @RequestParam(defaultValue = "5") int recentLimit,
            @RequestParam(defaultValue = "5") int topCustomerLimit,
            @RequestParam(defaultValue = "5") int alertLimit
    ) {
        // 1. CHỈ SỐ TÀI CHÍNH HÔM NAY
        Map<String, Object> financial = Map.of(
                "todayRevenue", 25820000.0,
                "yesterdayRevenue", 19500000.0,
                "todayOrders", 8,
                "pctChange", 32.4,
                "avgOrderValue", 3227500.0
        );

        // 2. BIỂU ĐỒ XU HƯỚNG DOANH THU & LỢI NHUẬN
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = trendDays - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long rev = 15000000L + (long)(Math.random() * 18000000L);
            long profit = (long)(rev * 0.28);
            trend.add(Map.of(
                    "date", d.toString(),
                    "label", i == 0 ? "Hôm nay" : d.getDayOfMonth() + "/" + d.getMonthValue(),
                    "revenue", rev,
                    "profit", profit,
                    "orders", 5 + (int)(Math.random() * 8)
            ));
        }

        // 3. CƠ CẤU DOANH THU THEO KÊNH BÁN
        Map<String, Object> channels = Map.of(
                "retail", 65000000.0,
                "wholesale", 125000000.0,
                "total", 190000000.0
        );

        // 4. KPIS VẬN HÀNH
        Map<String, Object> kpis = Map.of(
                "totalSkus", 43,
                "totalValue", 1017497000.0,
                "lowStockCount", 3,
                "expiringSoonCount", 0,
                "pendingOrders", 2,
                "allOrdersTotal", 14,
                "pendingApprovals", 1,
                "approvalByType", Map.of("Phiếu nhập kho", 1)
        );

        // 5. ĐƠN HÀNG GẦN ĐÂY
        List<Map<String, Object>> recentOrders = List.of(
                Map.of("id", 1, "orderCode", "HD-2026-001", "orderChannel", "Retail", "customerName", "Hoàng Văn Nam (Thợ điện nước)", "finalAmount", 1650000.0, "status", "Delivered", "createdAt", "2026-10-30T09:15:00"),
                Map.of("id", 2, "orderCode", "HD-2026-002", "orderChannel", "Wholesale", "customerName", "Công ty Xây dựng Kiến Á", "finalAmount", 24000000.0, "status", "Delivered", "createdAt", "2026-10-30T10:30:00"),
                Map.of("id", 3, "orderCode", "HD-2026-003", "orderChannel", "Retail", "customerName", "Nguyễn Mạnh Cường (Chủ nhà)", "finalAmount", 3400000.0, "status", "Delivered", "createdAt", "2026-10-30T11:45:00"),
                Map.of("id", 4, "orderCode", "HD-2026-004", "orderChannel", "Retail", "customerName", "Khách lẻ tại quầy", "finalAmount", 720000.0, "status", "Delivered", "createdAt", "2026-10-30T14:10:00"),
                Map.of("id", 5, "orderCode", "HD-2026-005", "orderChannel", "Wholesale", "customerName", "Đỗ Quốc Thắng (Nhà thầu MEP)", "finalAmount", 18500000.0, "status", "Processing", "createdAt", "2026-10-30T15:20:00")
        );

        // 6. KHÁCH HÀNG MUA NHIỀU NHẤT
        List<Map<String, Object>> topCustomers = List.of(
                Map.of("id", 1, "name", "Công ty Xây dựng Kiến Á", "orderCount", 8, "totalSpent", 185000000.0),
                Map.of("id", 2, "name", "Đỗ Quốc Thắng (Nhà thầu MEP)", "orderCount", 5, "totalSpent", 95000000.0),
                Map.of("id", 3, "name", "Hoàng Văn Nam (Đội thợ điện nước)", "orderCount", 12, "totalSpent", 45000000.0),
                Map.of("id", 4, "name", "Chú Hùng (Thợ điện nước Đống Đa)", "orderCount", 6, "totalSpent", 22000000.0),
                Map.of("id", 5, "name", "Nguyễn Mạnh Cường (Chủ nhà Tây Hồ)", "orderCount", 3, "totalSpent", 15000000.0)
        );

        // 7. DÒNG TIỀN (CASHFLOW)
        Map<String, Object> cashflow = Map.of(
                "income", 185000000.0,
                "expense", 112000000.0,
                "net", 73000000.0
        );

        // 8. CẢNH BÁO TỒN KHO THẤP
        List<Map<String, Object>> lowStockAlerts = List.of(
                Map.of("id", 1, "productName", "Chậu Lavabo sứ đặt bàn Trắng tuyết Nano (INAX AL-299V)", "skuCode", "TBVS-LVB-INAX299", "quantity", 8, "minQuantity", 10, "unitName", "Cái"),
                Map.of("id", 2, "productName", "Dây điện đơn Cadivi CV 2.5mm² (cuộn 100m)", "skuCode", "CDV-CV2.5", "quantity", 45, "minQuantity", 50, "unitName", "Cuộn"),
                Map.of("id", 3, "productName", "Van bi đồng tay gạt ren MIHA D27 (DN20)", "skuCode", "VAN-DONG-MIHA27", "quantity", 12, "minQuantity", 15, "unitName", "Cái")
        );

        // 9. MỤC CẦN DUYỆT
        List<Map<String, Object>> pendingApprovals = List.of(
                Map.of("entityType", "StockReceipt", "entityId", 3, "transactionCode", "NK-202610-003", "type", "Phiếu nhập kho", "creatorName", "Admin", "totalAmount", 24500000.0, "date", "2026-10-30")
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("financial", financial);
        data.put("revenueTrend", trend);
        data.put("channelBreakdown", channels);
        data.put("kpis", kpis);
        data.put("recentOrders", recentOrders);
        data.put("topCustomers", topCustomers);
        data.put("cashflow", cashflow);
        data.put("lowStockAlerts", lowStockAlerts);
        data.put("pendingApprovals", pendingApprovals);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
