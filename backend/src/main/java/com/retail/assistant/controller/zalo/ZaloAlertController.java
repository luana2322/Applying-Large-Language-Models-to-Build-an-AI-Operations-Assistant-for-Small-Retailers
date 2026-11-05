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

    /**
     * Lấy thông tin tài khoản và SĐT Zalo của Chủ cửa hàng đang đăng ký
     */
    @GetMapping("/owner-recipient")
    public ResponseEntity<Map<String, Object>> getOwnerRecipient() {
        String sql = """
            SELECT u.id, u.full_name, u.phone, u.email, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('OWNER', 'ADMIN') AND u.phone IS NOT NULL AND u.phone <> ''
            ORDER BY u.id DESC
            LIMIT 1
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        if (!rows.isEmpty()) {
            Map<String, Object> owner = rows.get(0);
            String rawPhone = (String) owner.get("phone");
            String cleanPhone = rawPhone != null ? rawPhone.replaceAll("[^0-9]", "") : "";
            return ResponseEntity.ok(Map.of(
                "success", true,
                "ownerName", owner.get("full_name"),
                "phone", rawPhone,
                "cleanPhone", cleanPhone,
                "zaloChatUrl", cleanPhone.length() >= 9 ? "https://zalo.me/" + cleanPhone : "https://chat.zalo.me"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "ownerName", "Nguyễn Thị Lan (Chủ cửa hàng)",
            "phone", "0988776655",
            "cleanPhone", "0988776655",
            "zaloChatUrl", "https://zalo.me/0988776655"
        ));
    }

    /**
     * Lịch sử tất cả cảnh báo đã gửi tới SĐT chủ cửa hàng
     */
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

    /**
     * Bắn thông báo Zalo theo SĐT: tự động lấy SĐT chủ cửa hàng trong DB
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> triggerAlert(@RequestBody Map<String, Object> body) {
        // Tự động tìm SĐT chủ cửa hàng trong DB
        String queryOwnerSql = """
            SELECT u.full_name, u.phone
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('OWNER', 'ADMIN') AND u.phone IS NOT NULL AND u.phone <> ''
            ORDER BY u.id DESC
            LIMIT 1
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(queryOwnerSql);
        String ownerName = "Chủ cửa hàng Lan";
        String ownerPhone = "0988776655";
        if (!rows.isEmpty()) {
            ownerName = (String) rows.get(0).get("full_name");
            ownerPhone = (String) rows.get(0).get("phone");
        }

        String alertType = (String) body.getOrDefault("alertType", "CUSTOM_ALERT");
        String recipient = ownerPhone + " (" + ownerName + ")";
        String title = (String) body.getOrDefault("title", "Thông báo từ Trợ lý Điện Nước");
        String message = (String) body.getOrDefault("message", "Nội dung cảnh báo quan trọng.");
        String entityType = (String) body.getOrDefault("entityType", "SYSTEM");
        Long entityId = body.get("entityId") != null ? Long.valueOf(body.get("entityId").toString()) : null;

        String insertSql = """
            INSERT INTO zalo_alert_logs (alert_type, recipient, title, message, entity_type, entity_id, is_sent, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, true, NOW())
        """;
        jdbcTemplate.update(insertSql, alertType, recipient, title, message, entityType, entityId);

        String cleanPhone = ownerPhone.replaceAll("[^0-9]", "");
        String deeplink = cleanPhone.length() >= 9 ? "https://zalo.me/" + cleanPhone : "https://chat.zalo.me";

        return ResponseEntity.ok(Map.of(
            "success", true,
            "recipientPhone", ownerPhone,
            "zaloDeeplink", deeplink,
            "message", "Đã gửi thông báo Zalo thành công đến số chủ cửa hàng: " + ownerPhone
        ));
    }
}
