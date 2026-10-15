# AI Agent — Bảo mật (Security)

> Mô hình bảo mật của AI Operations Assistant: trust boundaries, xác thực, cô lập dữ liệu theo cửa hàng, phòng chống lạm dụng và bảo vệ bí mật.
> Nguyên tắc xuyên suốt: **agent chỉ đọc, không ghi; dữ liệu phải grounded; store scope do backend quyết định.**

---

## 1. Ranh giới tin cậy (Trust boundaries)

```text
[Không tin cậy]  Frontend / người dùng
        │  X-Store-Code (client cung cấp — KHÔNG tin tuyệt đối)
        ▼
[Một phần tin cậy]  Spring Boot Gateway
        │  X-Internal-Token + X-Store-Id (store_id đã resolve ở backend)
        ▼
[Tin cậy nội bộ]  FastAPI AI Service
        │  X-Internal-Token + X-Store-Id
        ▼
[Tin cậy nội bộ]  Spring Boot Business API ── JPA ── DB
```

Điểm mấu chốt: **AI Service và Business API không lộ ra mạng ngoài.** Chỉ Gateway public. `store_id` không bao giờ đến từ AI hay từ nội dung hội thoại.

---

## 2. Xác thực & phân quyền

| Tầng | Cơ chế |
|---|---|
| Public → Gateway | `X-Store-Code` (resolve ra store; sai → fallback store đầu tiên hoặc lỗi). |
| Gateway → AI Service | Header `X-Internal-Token`, so khớp với `INTERNAL_AUTH_TOKEN`. |
| AI Service → Business API | Header `X-Internal-Token` + `X-Store-Id`. |
| Business API | `validateAuthAndStore`: kiểm tra token **và** sự tồn tại của store. |

**Giới hạn đã biết:** hiện **chưa có xác thực người dùng/role** (không có bảng `users/roles` trong repo). Vì vậy bảo vệ ở mức **store scope + shared internal token**, không phải mức user. Đây là giới hạn có chủ đích, được ghi nhận, không tự tạo hệ thống auth để tránh phá vỡ thiết kế hiện có.

---

## 3. Cô lập dữ liệu theo cửa hàng (Multi-tenancy)

1. Gateway resolve `X-Store-Code` → `store_id` tin cậy, truyền qua header.
2. Mọi tool đều gọi business API kèm `X-Store-Id`.
3. Business API xác thực store tồn tại (`STORE_NOT_FOUND`) trước khi truy vấn.
4. Service/repository lọc theo `store_id`.

**Không có tool nào nhận `store_id` như tham số.** Điều này ngăn prompt injection điều khiển tenant.

```java
// InternalBusinessApiController.validateAuthAndStore(...)
if (token == null || !token.equals(configuredInternalToken)) throw new SecurityException(...);
if (!storeRepository.existsById(storeId)) throw new IllegalArgumentException("STORE_NOT_FOUND: ...");
```

---

## 4. Read-only & allowlist công cụ

- **Allowlist cứng**: chỉ 7 tool đã đăng ký trong `ToolRegistry`. LLM yêu cầu tool khác → `status=rejected`, **không gọi backend**.
- **Không SQL tự do**: agent không viết/thực thi SQL; chỉ gọi REST endpoint cố định.
- **Không hành động ghi**: không tool nào sửa dữ liệu, tạo giao dịch, đổi giá, điều chỉnh kho, đặt hàng. Yêu cầu ghi bị từ chối ở tầng prompt + không tồn tại tool tương ứng.

---

## 5. Validate tham số & chống lạm dụng

| Cơ chế | Chi tiết |
|---|---|
| Validate tham số | `registry.validate_arguments`: kiểm tra tham số bắt buộc, định dạng ngày `YYYY-MM-DD`. |
| Giới hạn tool call | `MAX_TOOL_CALLS_PER_REQ` (mặc định 5). |
| Giới hạn vòng | `MAX_TURNS_PER_REQ` (mặc định 3). |
| Chống vòng lặp | Fingerprint `SHA-256(name + args_sorted)`; gọi trùng → `rejected`. |
| Giới hạn kết quả | Cắt `items[]` tối đa 200 dòng; cắt `MAX_TOOL_RESULT_CHARS` khi lưu audit. |
| Timeout | `TOOL_TIMEOUT_SECONDS` (10s) gọi business API; `LLM_TIMEOUT_SECONDS` (30s) gọi LLM. |

---

## 6. Phòng chống Prompt Injection

| Vector | Biện pháp |
|---|---|
| Yêu cầu lộ system prompt / API key | Prompt template (mục F) cấm rõ; mock từ chối; output không bao giờ chứa secret. |
| Yêu cầu đổi/sửa dữ liệu qua chat | Prompt (mục G) + không có tool ghi. |
| Chèn chỉ thị qua dữ liệu nghiệp vụ | Prompt quy định: dữ liệu từ tool là **dữ liệu**, không phải chỉ dẫn hệ thống. |
| Điều khiển tenant | `store_id` không nằm trong tầng AI và không trong tham số tool. |
| Giả mạo tool | Allowlist registry; tên tool không có trong registry → reject. |

Nội dung prompt đầy đủ: `ai-service/prompts/retail_assistant_v1.txt`.

---

## 7. Xử lý lỗi an toàn (fail-safe)

- **LLM lỗi** → `status=failed`, `error.code=LLM_PROVIDER_ERROR`, không bịa câu trả lời.
- **Tool lỗi/timeout** → status `error`, thông báo trung thực; **không** coi lỗi là "0" hay suy diễn số liệu.
- **Audit lỗi** → chỉ log warning; luồng chat không bị ảnh hưởng.
- **AI Service không truy cập** → Gateway trả 503 với thông báo thân thiện.

---

## 8. Quản lý bí mật (Secrets)

- `INTERNAL_AUTH_TOKEN`, `GEMINI_API_KEY`, `OPENAI_API_KEY` đọc từ biến môi trường / `.env`, **không** hardcode trong code nghiệp vụ, **không** trả về trong API.
- `.env` không commit (khuyến nghị); trong repo dùng giá trị mặc định dev.
- **Không** log token/key; log chỉ mã lỗi và thông điệp.

---

## 9. Dữ liệu lưu trữ (AI audit)

| Lưu | Không lưu |
|---|---|
| `session_id`, `role`, `content` (đã cắt giới hạn) | Token, API key, thông tin xác thực |
| `intent`, `status` | System prompt |
| `tool_name`, `arguments`, `result` (đã cắt) | Dữ liệu của store khác |

Ghi **best-effort**, cô lập theo store, phục vụ truy vết/audit (xem `AI_AGENT_API.md` §4).

---

## 10. An toàn dữ liệu seed

`DataLoader` chỉ chạy khi `app.seed-data.enabled=true` (mặc định dev/test) **và** DB rỗng. Ở production đặt `APP_SEED_DATA_ENABLED=false` để **không** trộn dữ liệu demo vào dữ liệu thật.

---

## 11. Checklist bảo mật

- [x] Internal token cho mọi lời gọi nội bộ (2 chiều).
- [x] Store scope được xác thực ở backend.
- [x] Allowlist tool; reject tool ngoài registry.
- [x] Read-only; không có tool ghi.
- [x] Validate tham số + định dạng ngày.
- [x] Chống vòng lặp + giới hạn tool call/turn.
- [x] Timeout + giới hạn kích thước kết quả.
- [x] Không lộ secret trong output/log.
- [x] Audit fail-safe, cô lập theo store.
- [x] Seed dữ liệu có thể tắt.
- [ ] **(Giới hạn)** Xác thực người dùng/role — chưa có trong phạm vi hiện tại.
