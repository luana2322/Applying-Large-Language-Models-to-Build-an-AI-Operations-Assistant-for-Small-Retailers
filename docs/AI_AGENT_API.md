# AI Agent — API Reference

> Tất cả endpoint liên quan AI Agent. Có 3 nhóm: **Public Gateway** (frontend dùng), **Internal AI API** (FastAPI), **Internal Business & Audit API** (Spring Boot).

---

## 1. Public Gateway (Spring Boot, port 8080)

### 1.1 `GET /api/v1/store/current`

Trả thông tin cửa hàng hiện tại theo `X-Store-Code`.

**Header:** `X-Store-Code: STORE-001` (mặc định `STORE-001`).

**Response 200:**
```json
{
  "store_id": 1,
  "code": "STORE-001",
  "name": "Tạp hóa Minh Anh",
  "currency": "VND",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

---

### 1.2 `POST /api/v1/chat`

Gateway: resolve store → chuyển tiếp tới AI Service → audit best-effort.

**Header:** `X-Store-Code: STORE-001`

**Request body:**
```json
{
  "session_id": "sess-abc-123",
  "message": "Doanh thu hôm nay là bao nhiêu?",
  "context": { "timezone": "Asia/Ho_Chi_Minh", "locale": "vi-VN" }
}
```
> `session_id` nên được client sinh và giữ nguyên giữa các lượt để giữ ngữ cảnh hội thoại.

**Response 200 (`ChatResponse`):**
```json
{
  "request_id": "uuid",
  "session_id": "sess-abc-123",
  "status": "completed",
  "intent": "SALES_SUMMARY",
  "answer": "Trong kỳ từ 2026-10-15 đến 2026-10-15, tổng doanh thu thuần ...",
  "data": { "net_revenue": 24500000.0, "valid_order_count": 48 },
  "tool_calls": [
    {
      "name": "get_sales_summary",
      "arguments": { "start_date": "2026-10-15", "end_date": "2026-10-15" },
      "status": "success",
      "error": null,
      "result": { "net_revenue": 24500000.0, "valid_order_count": 48 }
    }
  ],
  "error": null
}
```

**Response 503** khi AI Service không truy cập được:
```json
{
  "status": "failed",
  "answer": "Không thể kết nối đến AI Service tại thời điểm này. Vui lòng kiểm tra lại dịch vụ.",
  "error": { "code": "AI_SERVICE_UNAVAILABLE", "message": "..." }
}
```

**Trường `status`:** `completed` | `needs_clarification` | `partial` | `failed`.

---

## 2. Internal AI API (FastAPI, port 8000)

### 2.1 `GET /health`
```json
{ "status": "healthy", "service": "Retail Operations Assistant AI Service", "version": "1.0.0", "llm_provider": "gemini" }
```

### 2.2 `POST /internal/v1/ai/chat`

**Header bắt buộc:**
| Header | Mô tả |
|---|---|
| `X-Internal-Token` | Phải khớp `INTERNAL_AUTH_TOKEN` (sai → **401**). |
| `X-Store-Id` | Bắt buộc (thiếu → **422** do FastAPI validate header). |

**Request body:** giống `POST /api/v1/chat`.

**Response:** `ChatResponse` (giống §1.2).

**Mã lỗi:** `401` sai token; `422` thiếu header/body không hợp lệ.

---

## 3. Internal Business API (Spring Boot, port 8080)

Tiền tố: `/internal/api/v1/business`. **Header bắt buộc:** `X-Internal-Token` + `X-Store-Id`.

Mọi endpoint nhận JSON tham số (đều optional) và trả `ToolResponse<T>`:

```json
{
  "success": true,
  "data": { "...": "..." },
  "metadata": { "store_id": 1, "generated_at": "2026-10-15T10:00:00Z", "data_complete": true },
  "error": null
}
```

| Endpoint | Tham số (JSON) |
|---|---|
| `POST /sales-summary` | `start_date`, `end_date`, `group_by` |
| `POST /profit-summary` | `start_date`, `end_date` |
| `POST /top-products` | `start_date`, `end_date`, `metric`, `limit` |
| `POST /inventory-status` | `product_id`, `category`, `status` |
| `POST /slow-moving-products` | `lookback_days`, `min_stock_quantity`, `max_sales_quantity` |
| `POST /expense-summary` | `start_date`, `end_date`, `category` |
| `POST /restock-suggestions` | `product_id`, `planning_days`, `lookback_days` |

**Mã lỗi:**
| Code | HTTP | Nguyên nhân |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sai `X-Internal-Token`. |
| `BAD_REQUEST` | 400 | Thiếu `X-Store-Id`, store không tồn tại (`STORE_NOT_FOUND`), hoặc store id không hợp lệ (`INVALID_STORE_ID`). |

---

## 4. Internal AI Audit API (Spring Boot, port 8080)

### 4.1 `GET /internal/api/v1/ai/conversations/{sessionId}/messages`

Đọc lịch sử hội thoại đã lưu (audit).

**Header bắt buộc:** `X-Internal-Token` + `X-Store-Id`.

**Response 200:**
```json
{
  "success": true,
  "session_id": "sess-abc-123",
  "store_id": 1,
  "messages": [
    { "id": 10, "role": "user", "content": "Doanh thu hôm nay?", "intent": null, "status": null, "created_at": "2026-10-15T10:00:00" },
    { "id": 11, "role": "assistant", "content": "...", "intent": "SALES_SUMMARY", "status": "completed", "created_at": "2026-10-15T10:00:01" }
  ]
}
```

**Mã lỗi:** `401` sai token; `400` thiếu/không hợp lệ `X-Store-Id` hoặc store không tồn tại.

> Lịch sử được **cô lập theo store**: cùng `session_id` ở store khác trả về danh sách rỗng.

---

## 5. Ghi chú tích hợp

- **Session continuity:** giữ nguyên `session_id` giữa các lượt để agent dùng `ContextManager` (follow-up câu hỏi ngữ cảnh).
- **Store isolation:** backend resolve `X-Store-Code` → `store_id`; AI không bao giờ tự chọn store.
- **Audit fail-safe:** nếu ghi audit lỗi, phản hồi chat vẫn trả về bình thường (chỉ log warning).
- **Không lộ bí mật:** `ChatResponse` không chứa token, API key hay system prompt.
