package com.retail.assistant.controller.zalo;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/zalo-alerts")
public class ZaloAlertController {

    private final JdbcTemplate jdbcTemplate;

    public ZaloAlertController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAlerts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        String sql = """
            SELECT id, alert_type, recipient, title, message, entity_type, entity_id, is_sent, sent_at, created_at
            FROM zalo_alert_logs
            ORDER BY created_at DESC
            LIMIT ?
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, limit);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", rows,
            "total", rows.size()
        ));
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> triggerAlert(@RequestBody Map<String, Object> body) {
        String alertType = (String) body.getOrDefault("alertType", "CUSTOM_ALERT");
        String recipient = (String) body.getOrDefault("recipient", "0912345678 (Chủ cửa hàng Lan)");
        String title = (String) body.getOrDefault("title", "Thông báo từ Trợ lý Điện Nước");
        String message = (String) body.getOrDefault("message", "Nội dung cảnh báo quan trọng.");
        String entityType = (String) body.getOrDefault("entityType", "SYSTEM");
        Long entityId = body.get("entityId") != null ? Long.valueOf(body.get("entityId").toString()) : null;

        String insertSql = """
            INSERT INTO zalo_alert_logs (alert_type, recipient, title, message, entity_type, entity_id, is_sent, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, true, NOW())
        """;
        jdbcTemplate.update(insertSql, alertType, recipient, title, message, entityType, entityId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã gửi thông báo Zalo thành công đến chủ cửa hàng"
        ));
    }
}

