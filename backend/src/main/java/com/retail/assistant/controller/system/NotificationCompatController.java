package com.retail.assistant.controller.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationCompatController {

    private final List<Map<String, Object>> mockNotifications = new ArrayList<>();

    public NotificationCompatController() {
        mockNotifications.add(Map.of(
                "id", 1,
                "title", "Cảnh báo nợ quá hạn: Thợ Hoàng Văn Nam",
                "message", "Công nợ vật tư đợt 2 công trình Nam Cường 12.500.000đ đã quá hạn 10 ngày.",
                "type", "DEBT_OVERDUE",
                "read", false,
                "targetPath", "/cashflow/debts",
                "createdAt", LocalDateTime.now().minusHours(2).toString()
        ));
        mockNotifications.add(Map.of(
                "id", 2,
                "title", "Vật tư sắp hết: Dây Cadivi CV 2.5",
                "message", "Tồn kho dây điện đơn Cadivi 2.5mm² còn 45 cuộn, sắp chạm mức tối thiểu.",
                "type", "LOW_STOCK",
                "read", false,
                "targetPath", "/inventory/stock",
                "createdAt", LocalDateTime.now().minusHours(5).toString()
        ));
        mockNotifications.add(Map.of(
                "id", 3,
                "title", "Nhập hàng thành công",
                "message", "Đã duyệt và nhập kho 100 cây ống nhựa Tiền Phong D27 từ Tổng Đại Lý.",
                "type", "STOCK_INBOUND",
                "read", true,
                "targetPath", "/inventory/inbound",
                "createdAt", LocalDateTime.now().minusDays(1).toString()
        ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        long unreadCount = mockNotifications.stream().filter(n -> Boolean.FALSE.equals(n.get("read"))).count();
        Map<String, Object> data = new HashMap<>();
        data.put("items", mockNotifications);
        data.put("total", mockNotifications.size());
        data.put("unreadCount", unreadCount);
        data.put("page", page);
        data.put("limit", limit);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã đánh dấu đã đọc"));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã đánh dấu tất cả đã đọc"));
    }
}
