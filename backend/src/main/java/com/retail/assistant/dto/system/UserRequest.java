package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record UserRequest(String username, String passwordHash, String fullName, String email, String phone, Long roleId, String status, LocalDateTime lastLogin, String staffCode, String avatarUrl, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
