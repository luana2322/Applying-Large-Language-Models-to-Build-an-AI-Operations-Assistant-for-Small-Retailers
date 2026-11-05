package com.retail.assistant.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", "owner@diennuocminhthanh.vn").trim();
        String password = request.getOrDefault("password", "123456");

        // Tra cứu user trong Postgres
        String sql = """
            SELECT u.id, u.username, u.full_name, u.email, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE LOWER(u.email) = LOWER(?) OR LOWER(u.username) = LOWER(?)
            LIMIT 1
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, email, email);

        Map<String, Object> userMap = new HashMap<>();
        String roleStr = "Owner";
        String fullName = "Nguyễn Thị Lan (Chủ cửa hàng)";
        String username = "owner";
        int userId = 10;
        String userEmail = email;

        if (!rows.isEmpty()) {
            Map<String, Object> r = rows.get(0);
            userId = ((Number) r.get("id")).intValue();
            username = (String) r.get("username");
            fullName = (String) r.get("full_name");
            userEmail = (String) r.get("email");
            String dbRole = (String) r.get("role_name");
            if ("STAFF".equalsIgnoreCase(dbRole) || "Groomer".equalsIgnoreCase(dbRole)) {
                roleStr = "Staff";
            } else if ("ADMIN".equalsIgnoreCase(dbRole)) {
                roleStr = "Admin";
            } else {
                roleStr = "Owner";
            }
        } else {
            // Fallback theo email nếu không tìm thấy
            if (email.contains("staff") || email.contains("minh")) {
                roleStr = "Staff";
                fullName = "Trần Văn Minh (Thu ngân)";
                username = "staff";
                userId = 11;
            } else {
                roleStr = "Owner";
                fullName = "Nguyễn Thị Lan (Chủ cửa hàng)";
                username = "owner";
                userId = 10;
            }
        }

        userMap.put("id", userId);
        userMap.put("username", username);
        userMap.put("fullName", fullName);
        userMap.put("email", userEmail);
        userMap.put("role", roleStr);

        // Tạo Menu Permissions theo RBAC (Chủ cửa hàng vs Nhân viên)
        Map<String, Boolean> mp = new HashMap<>();
        boolean isOwner = "Owner".equalsIgnoreCase(roleStr) || "Admin".equalsIgnoreCase(roleStr);

        mp.put("can_view_dashboard", true);
        mp.put("can_use_ai", true);
        mp.put("can_manage_inventory", true);
        mp.put("can_manage_products", true);
        mp.put("can_manage_customers", true);
        mp.put("can_manage_orders", true);
        mp.put("can_use_custom_entities", true);

        // Các quyền tài chính, duyệt nợ, quản lý nhân viên chỉ cấp cho OWNER
        mp.put("can_approve", isOwner);
        mp.put("can_view_finance", isOwner); // Ẩn doanh thu & lãi gộp với Staff
        mp.put("can_manage_staff", isOwner);  // Ẩn quản lý nhân viên với Staff
        mp.put("can_configure_alerts", isOwner);
        mp.put("can_manage_custom_builder", isOwner);

        // Tạo JWT token có claim mp (base64) để Frontend tự động ẩn hiện menu
        String headerB64 = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        
        StringBuilder payloadJson = new StringBuilder("{");
        payloadJson.append("\"sub\":\"").append(username).append("\",");
        payloadJson.append("\"role\":\"").append(roleStr).append("\",");
        payloadJson.append("\"mp\":{");
        int count = 0;
        for (Map.Entry<String, Boolean> entry : mp.entrySet()) {
            if (count++ > 0) payloadJson.append(",");
            payloadJson.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
        }
        payloadJson.append("}}");

        String payloadB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.toString().getBytes(StandardCharsets.UTF_8));
        String mockJwt = headerB64 + "." + payloadB64 + ".signature";

        Map<String, Object> data = Map.of(
            "accessToken", mockJwt,
            "refreshToken", "refresh-" + mockJwt,
            "user", userMap
        );

        Map<String, Object> envelope = Map.of(
            "success", true,
            "data", data,
            "message", "Đăng nhập thành công với vai trò " + roleStr
        );

        return ResponseEntity.ok(envelope);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        Map<String, Object> data = Map.of(
            "accessToken", "mock-jwt-token-access-retail-assistant-refreshed",
            "refreshToken", "mock-jwt-token-refresh-retail-assistant-refreshed"
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", data,
            "message", "Token đã được làm mới"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(),
            "message", "Đăng xuất thành công"
        ));
    }

    @PostMapping("/password-reset-requests")
    public ResponseEntity<?> passwordResetRequests(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(),
            "message", "Yêu cầu đã được gửi tới quản trị viên"
        ));
    }
}
