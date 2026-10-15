# AI Agent — Implementation Plan

> Bám sát kết quả audit tại [`AI_AGENT_DATABASE_AUDIT.md`](./AI_AGENT_DATABASE_AUDIT.md).
> Nguyên tắc xuyên suốt: **tái sử dụng tối đa**, chỉ bổ sung **additive**, không phá vỡ POS hiện có.

---

## 1. Phạm vi thay đổi

### Trong phạm vi
1. Bổ sung tài liệu AI Agent (`docs/`).
2. Sửa LLM adapter thật để **hỗ trợ Tool Calling** (Gemini) và bổ sung adapter **OpenAI**.
3. Gia cố orchestrator & business client (giới hạn kết quả, trạng thái `partial`, lưu kết quả tool theo từng call).
4. Bổ sung persistence hội thoại/tool call cho AI (bảng mới, additive) + audit ở gateway.
5. Bảo vệ `DataLoader` khỏi ghi dữ liệu demo vào môi trường không phải dev/test.
6. Mở rộng test (backend ground-truth + AI guardrails/security/timeouts).
7. Cập nhật README.

### Ngoài phạm vi (cố ý không làm, có lý do)
- Không tạo `users/roles/auth` (không có thiết kế xác thực trong repo).
- Không tạo `suppliers`, `stock_receipts`, `locations`, `inventory_log`, `vouchers`, `cash_funds`, `cash_transactions`, `finance_ledger`.
- Không triển khai `get_cash_flow_summary` (không có nguồn dữ liệu dòng tiền đáng tin cậy).
- Không đổi định nghĩa doanh thu/COGS hiện có.

---

## 2. Thứ tự thực hiện

| Bước | Hạng mục | Deliverable |
|---|---|---|
| 1 | Audit | `docs/AI_AGENT_DATABASE_AUDIT.md` ✅ |
| 2 | Kế hoạch | `docs/AI_AGENT_IMPLEMENTATION_PLAN.md` (file này) |
| 3 | Tool đầu tiên `get_sales_summary` | Đã tồn tại; bổ sung test ground-truth |
| 4 | Tích hợp LLM Tool Calling | Sửa `GeminiLLMAdapter`, thêm `OpenAILLMAdapter` |
| 5 | Kiểm thử tool đầu tiên | Test numeric + API |
| 6 | Bảo mật & xử lý lỗi | Timeout, giới hạn kích thước, guardrail vòng lặp |
| 7 | Persistence hội thoại | Entity + repo + service + controller + gateway audit |
| 8 | Các tool còn lại | Đã đủ 7 tool; kiểm thử |
| 9 | Giao diện chat | Đã có; giữ tương thích contract |
| 10 | Test + tài liệu | Chạy full suite, hoàn thiện docs |

---

## 3. Chi tiết thay đổi code

### 3.1 AI Service — LLM Providers
**File:** `ai-service/app/llm/provider_adapter.py`, `ai-service/app/llm/client.py`
- `GeminiLLMAdapter`: truyền `system_instruction`, **tool declarations** và **history**; parse `function_call` từ response; trả `LLMResponse(is_tool_call=True, tool_calls=[...])`.
- Thêm `OpenAILLMAdapter`: dùng `AsyncOpenAI.chat.completions.create` với `tools` (schema OpenAI), parse `tool_calls`.
- Chuyển đổi declaration → proto/schema phải chịu được việc kiểm thử offline (unit test không cần mạng).
- `get_llm_adapter`: chọn provider theo `LLM_PROVIDER` (`gemini|openai|mock`), fallback `mock` khi thiếu key.

**Hợp đồng chung giữ nguyên** (`LLMResponse`, `LLMToolCall`) → không phá orchestrator.

### 3.2 AI Service — Orchestrator & Client
**File:** `ai-service/app/agent/orchestrator.py`, `app/clients/business_api_client.py`, `app/schemas/chat_response.py`, `app/config.py`
- `ToolCallRecord` thêm trường optional `result` (đã giới hạn kích thước) để phục vụ audit.
- `BusinessApiClient` giới hạn kích thước payload trả về (`max_tool_result_chars`).
- Cấu hình hóa: `max_tool_calls_per_req`, `max_turns_per_req`, `tool_timeout_seconds`, `llm_timeout_seconds`, `max_tool_result_chars`.
- `ResponseValidator`: thêm trạng thái `partial` khi có tool lỗi nhưng vẫn có câu trả lời.

### 3.3 Backend — Persistence hội thoại AI (additive)
**Package mới:** `com.retail.assistant.domain.entity` + `repository` + `domain.service` + `controller`

Bảng mới (JPA entity, không có migration SQL vì dự án không dùng Flyway/Liquibase):
- `ai_conversations(id, session_id UNIQUE, store_id, title, created_at, updated_at)`
- `ai_messages(id, conversation_id, role, content, intent, created_at)`
- `ai_tool_calls(id, message_id, tool_name, arguments, status, error_message, created_at)`
- `ai_tool_results(id, tool_call_id, result_data, error_message, created_at)`

Content/arguments/result dùng `@Lob` (CLOB trên H2, TEXT trên Postgres). Giới hạn độ dài lưu trữ.

**Service:** `AiConversationService`
- `getOrCreateConversation(sessionId, storeId)`
- `recordTurn(sessionId, storeId, userMessage, assistantAnswer, intent, status, toolCalls)`
- `getMessages(sessionId, storeId)`

**Controller nội bộ:** `AiConversationInternalController` (`/internal/api/v1/ai`) — yêu cầu `X-Internal-Token` + `X-Store-Id`, phục vụ đọc lịch sử/audit.

**Gateway audit:** `StoreChatGatewayController` gọi `AiConversationService.recordTurn(...)` **best-effort** (try/catch, không làm hỏng luồng chat) sau khi nhận phản hồi AI.

### 3.4 Backend — An toàn dữ liệu
**File:** `backend/.../config/DataLoader.java`
- Thêm cấu hình `app.seed-data.enabled` (mặc định `true`).
- Chỉ seed khi DB rỗng (`storeRepository.count() == 0`) — đã có.
- Có thể tắt bằng `APP_SEED_DATA_ENABLED=false` ở production.

### 3.5 Backend / AI Service — Test
- Backend: test ground-truth số học (tự dựng tập đơn biết trước, so khớp gross/discount/net/COGS), test phân quyền store, đơn hủy/trả, thiếu giá vốn, persistence.
- AI Service: test chuyển đổi LLM schema, guardrail (max tool calls, tool không đăng ký, tham số sai, vòng lặp), timeout, follow-up context, partial status.

---

## 4. Tiêu chí nghiệm thu

- [ ] AI Agent chạy trên DB nghiệp vụ hiện có, không có DB song song.
- [ ] 7 tool truy vấn đúng schema, có test.
- [ ] Phép tính doanh thu/COGS khớp truy vấn chuẩn độc lập.
- [ ] Store scope được xác thực ở backend (token nội bộ + store tồn tại).
- [ ] Có xử lý lỗi/timeout và giới hạn Tool Calling.
- [ ] Có test cho luồng chính và lỗi bảo mật.
- [ ] POS/ERP cũ vẫn hoạt động (toàn bộ test cũ pass).
- [ ] Tài liệu khớp source code.
