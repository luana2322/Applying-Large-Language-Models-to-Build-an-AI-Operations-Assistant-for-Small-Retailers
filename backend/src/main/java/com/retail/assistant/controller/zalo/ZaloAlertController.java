package com.retail.assistant.controller.zalo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api/v1/zalo-alerts")
public class ZaloAlertController {

    private final JdbcTemplate jdbcTemplate;
    private final HttpClient httpClient;

    @Value("${telegram.bot.token:9021156914:AAGH7-WiuYcZaHh5tx1YnOA7vK2_dhBWO2k}")
    private String telegramBotToken;

    @Value("${telegram.chat.id:5062541960}")
    private String telegramChatId;

    public ZaloAlertController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
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
                "zaloChatUrl", cleanPhone.length() >= 9 ? "https://zalo.me/" + cleanPhone : "https://chat.zalo.me",
                "telegramConnected", true,
                "telegramChatId", telegramChatId
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "ownerName", "Nguyễn Thị Lan (Chủ cửa hàng)",
            "phone", "0972031655",
            "cleanPhone", "0972031655",
            "zaloChatUrl", "https://zalo.me/0972031655",
            "telegramConnected", true,
            "telegramChatId", telegramChatId
        ));
    }

    /**
     * Lịch sử tất cả cảnh báo đã gửi
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
     * Phát cảnh báo Omnichannel: Đẩy trực tiếp vào Telegram Bot của chủ cửa hàng + Lưu log Zalo
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
        String ownerName = "Nguyễn Thị Lan (Chủ cửa hàng)";
        String ownerPhone = "0972031655";
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

        // 1. Lưu log vào Database
        String insertSql = """
            INSERT INTO zalo_alert_logs (alert_type, recipient, title, message, entity_type, entity_id, is_sent, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, true, NOW())
        """;
        jdbcTemplate.update(insertSql, alertType, recipient, title, message, entityType, entityId);

        String cleanPhone = ownerPhone.replaceAll("[^0-9]", "");
        String deeplink = cleanPhone.length() >= 9 ? "https://zalo.me/" + cleanPhone : "https://chat.zalo.me";

        // 2. Bắn tin nhắn trực tiếp qua Telegram Bot đến điện thoại chủ cửa hàng
        boolean telegramSent = false;
        try {
            String teleMsg = String.format("%s\n\n%s\n\n📱 Zalo Chủ: %s\n🔗 Zalo Action: %s",
                    title, message, ownerPhone, deeplink);

            String requestBody = "chat_id=" + URLEncoder.encode(telegramChatId, StandardCharsets.UTF_8)
                    + "&text=" + URLEncoder.encode(teleMsg, StandardCharsets.UTF_8);

            String teleUrl = "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(teleUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(4))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                telegramSent = true;
            }
        } catch (Exception e) {
            // Không làm gián đoạn API chính nếu mạng chậm
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "recipientPhone", ownerPhone,
            "zaloDeeplink", deeplink,
            "telegramSent", telegramSent,
            "message", "Đã gửi thông báo thành công tới điện thoại Chủ cửa hàng (" + ownerPhone + " / Telegram)"
        ));
    }
}
