# AI Agent — Kiến trúc (Architecture)

> Tài liệu này mô tả kiến trúc runtime của AI Operations Assistant: các tầng, luồng request, ranh giới tin cậy và cách agent truy vấn dữ liệu nghiệp vụ **thực tế** (không có database song song).
> Đọc kèm: [`AI_AGENT_DATABASE_AUDIT.md`](./AI_AGENT_DATABASE_AUDIT.md), [`AI_AGENT_TOOLS.md`](./AI_AGENT_TOOLS.md).

---

## 1. Tổng quan các tầng

```text
┌────────────────────────────────────────────────────────────┐
│  Frontend Chat UI  (Vite + Vanilla JS, port 5173)          │
│  - Gửi kèm X-Store-Code                                     │
└───────────────┬────────────────────────────────────────────┘
                │  POST /api/v1/chat   { session_id, message }
                ▼
┌────────────────────────────────────────────────────────────┐
│  Spring Boot Gateway (port 8080)                           │
│  StoreChatGatewayController                                │
│   - resolve store từ X-Store-Code → store_id tin cậy       │
│   - gọi AI Service kèm X-Internal-Token + X-Store-Id       │
│   - audit best-effort: AiConversationService.recordTurn()  │
└───────────────┬────────────────────────────────────────────┘
                │  POST /internal/v1/ai/chat
                ▼
┌────────────────────────────────────────────────────────────┐
│  FastAPI AI Service (port 8000)                            │
│  chat.py → AgentOrchestrator                               │
│   ├── PromptBuilder (system instruction)                   │
│   ├── ContextManager (lịch sử hội thoại theo session)      │
│   ├── LLM Adapter (Gemini | OpenAI | Mock)                 │
│   ├── ToolRegistry (7 tool, validate args)                 │
│   ├── BusinessApiClient (gọi internal business API)        │
│   └── ResponseValidator (status: completed/partial/...)    │
└───────────────┬────────────────────────────────────────────┘
                │  POST /internal/api/v1/business/*  (X-Internal-Token + X-Store-Id)
                ▼
┌────────────────────────────────────────────────────────────┐
│  Spring Boot Business API (port 8080)                      │
│  InternalBusinessApiController + AiConversationInternal... │
│  SalesService / ProfitService / InventoryService /         │
│  ExpenseService / RestockService                           │
│  JPA Repositories → H2 (dev) | PostgreSQL (docker)         │
└────────────────────────────────────────────────────────────┘
```

**Điểm cốt lõi:** AI **không** kết nối trực tiếp database. Mọi truy vấn đi qua internal business API của Spring Boot, nơi business logic và store scope được enforce.

---

## 2. Luồng xử lý một câu hỏi (tool-calling loop)

```text
Người dùng: "Doanh thu hôm nay là bao nhiêu?"
   │
   ▼
[1] Gateway resolve store (X-Store-Code → stores.id)
   │
   ▼
[2] AI Service: ContextManager thêm message user vào history
   │
   ▼
[3] LLM nhận (system prompt + history + tool declarations)
   │
   ├── nếu LLM trả text  ──────────────► [6] trả lời trực tiếp
   │
   └── nếu LLM trả function_call
          │
          ▼
     [4] Orchestrator kiểm tra:
         - tool có trong registry?       (không → rejected)
         - tham số hợp lệ?                (không → error)
         - gọi trùng fingerprint?          (có → rejected, chống loop)
         - vượt max_tool_calls_per_req?    (có → dừng, báo giới hạn)
          │
          ▼
     [5] BusinessApiClient POST → Internal business API
         → Spring Boot tính toán trên DB thực → ToolResponse<T>
          │
          ▼
     Orchestrator ghi history role="tool" (kết quả) → quay lại [3]
          │
          ▼
[6] ResponseValidator chuẩn hoá: status, intent, data, tool_calls
          │
          ▼
[7] Gateway trả JSON cho frontend + audit best-effort vào DB
```

Giới hạn vòng lặp: tối đa `MAX_TURNS_PER_REQ` (mặc định 3) vòng và `MAX_TOOL_CALLS_PER_REQ` (mặc định 5) tool call cho mỗi request.

---

## 3. Ranh giới tin cậy (trust boundaries)

| Ranh giới | Cơ chế |
|---|---|
| Frontend → Gateway | `X-Store-Code` (do client gửi, **không tin tuyệt đối**). |
| Gateway → AI Service | `X-Internal-Token` + `X-Store-Id` (store_id đã resolve ở backend). |
| AI Service → Business API | `X-Internal-Token` + `X-Store-Id`. |
| AI → Database | **Không có kết nối trực tiếp.** Chỉ qua business API. |

Nguyên tắc: **AI không tự chọn store và không tự viết SQL.** Store scope do backend quyết định; tool không có tham số `store_id` (xem `AI_AGENT_TOOLS.md`).

---

## 4. Thành phần AI Service

| File | Trách nhiệm |
|---|---|
| `app/api/chat.py` | Endpoint `/internal/v1/ai/chat`, xác thực token + store header. |
| `app/agent/orchestrator.py` | Vòng lặp tool-calling, guardrails, chống loop, giới hạn kết quả. |
| `app/agent/prompt_builder.py` | Dựng system instruction từ prompt template. |
| `app/agent/context_manager.py` | Lịch sử hội thoại in-memory theo `session_id`, prune theo cửa sổ. |
| `app/agent/response_validator.py` | Chuẩn hoá status/intent/answer. |
| `app/llm/provider_adapter.py` | Adapter Gemini / OpenAI / Mock. |
| `app/llm/client.py` | Chọn adapter theo `LLM_PROVIDER`, fallback mock. |
| `app/tools/registry.py` | Đăng ký tool, sinh declaration, validate tham số. |
| `app/clients/business_api_client.py` | HTTP client gọi internal business API, xử lý timeout/lỗi. |
| `app/evaluation/*` | Bộ benchmark offline (TC-01..TC-15). |

---

## 5. Trạng thái phản hồi (`status`)

| status | Ý nghĩa |
|---|---|
| `completed` | Trả lời đầy đủ, dựa trên tool thành công (hoặc câu hỏi không cần tool). |
| `needs_clarification` | Câu hỏi mơ hồ, cần người dùng làm rõ. |
| `partial` | Có ít nhất một tool lỗi nhưng vẫn có tool thành công và có câu trả lời. |
| `failed` | Lỗi LLM provider, hoặc tất cả tool lỗi và không có dữ liệu. |

Xem chi tiết tại `AI_AGENT_EVALUATION.md`.

---

## 6. Persistence & audit hội thoại (additive)

Backend bổ sung 4 bảng (JPA entity mới, **không** phải DB song song về nghiệp vụ):

```text
ai_conversations (session_id UNIQUE, store_id, title, created_at, updated_at)
   └─1:N─ ai_messages (role: user|assistant, content, intent, status)
              └─1:N─ ai_tool_calls (tool_name, arguments, status, error_message)
                         └─1:1─ ai_tool_results (result_data, error_message)
```

- Ghi **best-effort** ở `StoreChatGatewayController`: lỗi ghi audit không bao giờ làm hỏng luồng chat.
- Chỉ lưu metadata đã grounded; **không** lưu secret/token/API key.
- Đọc lại lịch sử qua `AiConversationInternalController` (`AI_AGENT_API.md`).

---

## 7. Môi trường & cấu hình

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `LLM_PROVIDER` | `gemini` | `gemini` / `openai` / `mock`. Thiếu key → fallback mock. |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | rỗng | Key nhà cung cấp LLM. |
| `INTERNAL_AUTH_TOKEN` | `retail-internal-secret-token-v1` | Token nội bộ, phải khớp 2 phía. |
| `MAX_TOOL_CALLS_PER_REQ` | `5` | Giới hạn tool call/request. |
| `MAX_TURNS_PER_REQ` | `3` | Giới hạn vòng orchestration. |
| `TOOL_TIMEOUT_SECONDS` | `10.0` | Timeout gọi business API. |
| `LLM_TIMEOUT_SECONDS` | `30.0` | Timeout gọi LLM. |
| `MAX_TOOL_RESULT_CHARS` | `20000` | Giới hạn kích thước kết quả tool lưu audit. |
| `APP_SEED_DATA_ENABLED` | `true` | Bật seed dữ liệu demo (tắt ở production). |

---

## 8. Nguyên tắc thiết kế

1. **Một nguồn dữ liệu duy nhất** — dùng DB nghiệp vụ hiện có, không tạo bảng nghiệp vụ trùng lặp.
2. **Grounded bắt buộc** — con số phải đến từ tool; không bịa khi thiếu dữ liệu hoặc khi tool lỗi.
3. **Read-only** — agent chỉ đọc/phân tích; không ghi, sửa, đặt hàng.
4. **Additive** — mọi thay đổi không phá vỡ POS/ERP hiện có; toàn bộ test cũ vẫn pass.
5. **Fail-safe** — lỗi audit/timeout/LLM không làm sập luồng chat nghiệp vụ.
