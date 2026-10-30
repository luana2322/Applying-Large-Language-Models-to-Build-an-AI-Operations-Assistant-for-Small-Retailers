package com.retail.assistant.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", "admin@smartinventory.vn");
        
        // Mock user object matching frontend expectation
        Map<String, Object> user = Map.of(
            "id", 1,
            "username", "admin",
            "fullName", "System Administrator",
            "email", email,
            "role", "Admin"
        );

        Map<String, Object> data = Map.of(
            "accessToken", "mock-jwt-token-access-retail-assistant",
            "refreshToken", "mock-jwt-token-refresh-retail-assistant",
            "user", user
        );

        Map<String, Object> envelope = Map.of(
            "success", true,
            "data", data,
            "message", "Đăng nhập thành công"
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
