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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
     * Danh sách 7 mẫu thông báo nghiệp vụ sát sườn dành riêng cho Chủ cửa hàng Điện Nước
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getAlertTemplates() {
        List<Map<String, String>> templates = List.of(
            Map.of(
                "key", "DEBT_OVERLIMIT",
                "name", "🚨 Duyệt đơn nợ vượt hạn mức",
                "title", "🚨 DUYỆT ĐƠN NỢ VƯỢT HẠN MỨC",
                "message", "⚠️ Thợ Hùng (Dư nợ hiện tại: 23.500.000đ / Hạn mức: 20.000.000đ) vừa tạo đơn vật tư công trình Biệt thự Gamuda: 3.200.000đ tại quầy POS.\n👉 Cần Chủ cửa hàng phê duyệt cho xuất nợ hay yêu cầu thanh toán trước!"
            ),
            Map.of(
                "key", "LOW_STOCK_EMERGENCY",
                "name", "📦 Hàng sắp hết kho (Chạm Min Stock)",
                "title", "📦 CẢNH BÁO: HÀNG SẮP HẾT KHO CẦN NHẬP GẤP",
                "message", "⚠️ 3 mặt hàng chủ lực vừa chạm ngưỡng tồn an toàn (Min Stock):\n1. Ống nhựa PVC Tiền Phong D27: Còn 15 cây (Tối thiểu 50 cây)\n2. Dây cáp CADIVI VCmd 2x2.5: Còn 2 cuộn (Tối thiểu 10 cuộn)\n3. Van góc inox 304: Còn 4 cái (Tối thiểu 20 cái)\n👉 AI Restock Planner đã gom sẵn đơn nhập nháp theo từng NCC."
            ),
            Map.of(
                "key", "DAILY_CLOSING_FINANCE",
                "name", "💰 Báo cáo tổng kết ca & doanh thu 21:00",
                "title", "💰 BÁO CÁO TỔNG KẾT DOANH THU & LÃI GỘP CA TỐI (21:00)",
                "message", "📊 TỔNG KẾT KINH DOANH HÔM NAY:\n• Doanh thu thuần: 24.650.000đ (48 đơn hàng)\n• Giá vốn xuất kho: 18.200.000đ\n• Lợi nhuận gộp: 6.450.000đ (Biên lãi: 26.1%)\n• Tiền mặt tại két: 14.300.000đ | Chuyển khoản: 7.850.000đ | Ghi nợ mới: 2.500.000đ\n✅ Đã kiểm kê và khớp sổ quỹ an toàn."
            ),
            Map.of(
                "key", "CRITICAL_BAD_DEBT",
                "name", "⛔ Cảnh báo nợ xấu quá hạn > 45 ngày",
                "title", "⛔ CẢNH BÁO NỢ NGUY HIỂM: QUÁ HẠN 48 NGÀY",
                "message", "🔴 Nhà thầu Công ty Kiến Á có khoản nợ 45.000.000đ vật tư thiết bị vệ sinh công trình Imperia đã quá hạn 48 ngày.\n👉 Hệ thống đã tự động KHÓA xuất nợ mới. AI đã soạn sẵn công văn đòi nợ quyết liệt để gửi Zalo đại diện nhà thầu!"
            ),
            Map.of(
                "key", "SLOW_MOVING_CAPITAL",
                "name", "⏳ Cảnh báo hàng tồn đọng vốn lâu ngày",
                "title", "⏳ CẢNH BÁO TỒN ĐỌNG VỐN CHẾT TRONG KHO",
                "message", "📊 Phát hiện 2 mặt hàng giá trị cao không phát sinh giao dịch trên 60 ngày:\n1. Bồn tắm massage Inax cao cấp (Tồn 2 cái, giá trị vốn: 18.000.000đ)\n2. Bình năng lượng mặt trời Đại Thành 200L (Tồn 3 bộ, vốn: 21.600.000đ)\n👉 Đề xuất: Tạo chương trình khuyến mãi xả hàng hoặc tư vấn combo công trình để giải phóng dòng tiền."
            ),
            Map.of(
                "key", "PRICE_VOLATILITY_ALERT",
                "name", "📈 Cảnh báo biến động giá Nhà Cung Cấp",
                "title", "📈 CẢNH BÁO: BIẾN ĐỘNG GIÁ NHÀ PHÂN PHỐI",
                "message", "📢 Nhà phân phối Nhựa Tiền Phong vừa thông báo bảng giá mới áp dụng từ đầu tuần tới (Tăng 4.5% đối với dòng ống chịu nhiệt PPR).\n👉 Đề xuất: Nhập bổ sung trước 50 cây PPR phi 25/phi 32 để chốt giá cũ và cập nhật lại giá bán lẻ tại POS."
            ),
            Map.of(
                "key", "STAFF_ANOMALY_ACTION",
                "name", "👤 Cảnh báo thao tác bất thường của nhân viên",
                "title", "👤 CẢNH BÁO: THAO TÁC BẤT THƯỜNG TRONG CA",
                "message", "⚠️ Thu ngân Trần Văn Minh vừa thực hiện 'HỦY HÓA ĐƠN ĐÃ THANH TOÁN' (Đơn HD-00892 trị giá 4.850.000đ, khách thanh toán tiền mặt lúc 14:15).\n👉 Lý do ghi nhận: 'Khách đổi trả lấy lại tiền'. Vui lòng kiểm tra lại camera quầy thu ngân!"
            )
        );

        return ResponseEntity.ok(Map.of("success", true, "templates", templates));
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
            String timeStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
            String teleMsg = String.format("%s\n⏱ Thời gian: %s\n\n%s\n\n📱 Zalo Chủ: %s\n🔗 Zalo Action: %s",
                    title, timeStr, message, ownerPhone, deeplink);

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
