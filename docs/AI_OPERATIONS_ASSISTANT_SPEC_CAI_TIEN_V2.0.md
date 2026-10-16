# ĐẶC TẢ CẢI TIẾN - AI OPERATIONS ASSISTANT V2.0
Hệ thống Trợ lý AI Điều hành Kinh doanh cho Hộ kinh doanh & Cửa hàng Bán lẻ Quy mô Nhỏ

> Phiên bản cải tiến dựa trên kiến trúc đa tầng hiện tại (Entity → Repository → Service (Interface+Impl) → DTO/Mapper → Controller), với tách biệt rõ ràng Business (Spring Boot) và AI Orchestrator (FastAPI), hỗ trợ LLM Tool Calling, audit trail và store-scope isolation.

## 1. Tổng quan

Dự án "AI Operations Assistant for Small Retailers" là hệ thống trợ lý AI điều hành kinh doanh, cho phép chủ cửa hàng/nhân viên giao tiếp bằng tiếng Việt tự nhiên để truy xuất, phân tích dữ liệu nghiệp vụ (Bán hàng, Lợi nhuận, Tồn kho, Chi phí, Nhập hàng...) và nhận câu trả lời được grounding hoàn toàn từ dữ liệu thực tế.

Kiến trúc cải tiến (V2.0) tập trung vào:
- Tổ chức layer rõ ràng, nhất quán (Domain-Driven Design): Entity/Repository/Service/DTO/Controller theo domain
- Tách Service thành Interface + Implementation (42 interfaces/42 impls) — dễ mở rộng, kiểm thử, đảo ngược phụ thuộc
- DTO + Mapper tách biệt rõ API contract khỏi JPA entity (giảm rò rỉ domain, an toàn hơn khi mở rộng)
- REST CRUD đầy đủ theo domain, song song với Business Internal API chuyên biệt cho AI Agent
- AI Agent read-only, có guardrails, audit best-effort, store-scope bắt buộc

## 2. Mục tiêu cải tiến

1. Chuẩn hóa kiến trúc layer (Entity → Repository → Service(I+Impl) → DTO/Mapper → Controller) áp dụng nhất quán cho 36 entities CRUD
2. Tách biệt rõ Contract (DTO) vs Domain (Entity), tránh trả entity ra ngoài API
3. Bổ sung REST CRUD đầy đủ theo domain (`/api/v1/{domain}/{entity-kebab}`) phục vụ quản trị/quản lý, không ảnh hưởng tới luồng AI chat
4. Củng cố ranh giới tin cậy: AI chỉ đọc, grounding bắt buộc, `store_id` luôn do backend quyết định
5. Hoàn thiện audit trail (AI conversation/tool calls/results) với best-effort, không làm gián đoạn luồng nghiệp vụ
6. Tối ưu khả năng mở rộng: hỗ trợ đa LLM (Gemini/OpenAI/Mock), cấu hình hóa đầy đủ, guardrails rõ ràng

## 3. Kiến trúc hệ thống đề xuất cải tiến

### 3.1 Sơ đồ kiến trúc (Layered + Hexagonal-friendly)

```text
[Client/UI (Frontend Vite)]
  │
  ▼
[Spring Boot Gateway (8080) - Public]
  ├─ Resolve X-Store-Code → X-Store-Id
  ├─ Gắn X-Internal-Token
  ├─ Forward /api/v1/chat → FastAPI AI
  └─ Expose REST CRUD /api/v1/{domain}/* + Internal Business API

[FastAPI AI Orchestrator (8000) - Internal]
  ├─ LLM Adapters (Gemini/OpenAI/Mock) + Tool Calling
  ├─ Orchestrator (loop/tool execution/validation/guardrails)
  ├─ Tool Registry (7 read-only tools)
  └─ Business API Client (gọi Spring Boot internal, store-scoped)

[Spring Boot Business (8080) - Internal]
  ├─ Controller (Internal Business + Audit + Domain CRUD)
  ├─ Service (Interface + Impl) — business logic, transaction
  ├─ Repository (Spring Data JPA)
  ├─ Entity (JPA) / DTO+Mapper (API contract)
  └─ PostgreSQL/H2
```

### 3.2 Nguyên tắc kiến trúc

| Nguyên tắc | Áp dụng |
|---|---|
| Separation of Concerns | Mỗi layer chỉ chịu trách nhiệm rõ ràng (Controller: HTTP, Service: nghiệp vụ, Repo: truy xuất, Mapper: chuyển đổi) |
| Interface Segregation | Mọi Service đều có `Interface` + `Impl` (42/42). Dễ mock, test, swap impl |
| Contract-first (DTO) | Controller chỉ nhận/trả DTO (Request/Response), không expose JPA Entity ra ngoài |
| Read-Only Agent | AI tools đều read-only. Chỉ Business API nội bộ mới thực thi nghiệp vụ đã được xác định |
| Store-Scoped by Design | `store_id` được resolve ở Gateway/Business, **không** lấy từ input hội thoại/AI |
| Best-Effort Audit | Audit AI (persistTurn) chạy try/catch, không làm fail luồng chat |
| Defense-in-Depth | Internal token, store validation, timeouts, caps, loop guardrails, response validation |

### 3.3 Phân chia Domain (Domain-Driven)

Domains được tổ chức nhất quán:
- `system` (Store, User, Role, Auth tokens, Settings, Logs...)
- `catalog` (Category, Product, Units, Images, Price History)
- `supplier` (Supplier, Stock Receipt/Detail)
- `sales` (Customer, Order/SaleOrder, Details, Payments, Vouchers)
- `inventory` (Location, Inventory/InventoryRecord, StockDispatch/Lines, Logs)
- `finance` (CashFund, Ledger, Transactions, Expense)
- `audit` (AuditLog)
- `ai` (AiConversation, AiMessage, AiToolCall, AiToolResult)

## 4. Thiết kế Layer chi tiết

### 4.1 Entity Layer
- JPA entities, mapping chuẩn với DB (H2/Postgres)
- `@MappedSuperclass BaseEntity` (có sẵn) dùng làm nền tảng mở rộng (timestamps/id chung)
- Quan hệ `@ManyToOne` rõ ràng, collections (`@OneToMany`) chủ yếu để duy trì tính nhất quán (một số bỏ qua ở DTO để tránh vòng lặp)

### 4.2 Repository Layer
- `JpaRepository<Entity, Long>` cho tất cả 41 repositories
- Derived query methods theo quan hệ: `findBy<Product>Id`, `findByStoreId`, `findBy<Order>Id`, v.v.
- Tập trung truy xuất dữ liệu, không chứa business logic

### 4.3 Service Layer (Interface + Implementation) — Cải tiến quan trọng
Mỗi entity CRUD có: `<Entity>Service` (interface) + `<Entity>ServiceImpl` (impl). Các service nghiệp vụ chuyên biệt (Sales/Profit/Inventory/Restock/Expense/AiConversation) cũng tách I+Impl.

**CRUD Service chuẩn:**
```java
<Entity> save(<Entity> entity);
<Entity> getById(Long id);
Optional<<Entity>> findById(Long id);
List<<Entity>> findAll();
void deleteById(Long id);
boolean existsById(Long id);
// + derived finders theo relations (nếu có)
```

Lợi ích cải tiến:
- Tuân thủ DIP (Dependency Inversion), controller/service có thể phụ thuộc Interface
- Dễ dàng mock trong unit test, tách biệt test business logic
- Rõ ràng boundary giữa API contract và implementation
- Mở rộng impl mà không phá vỡ callers

### 4.4 DTO + Mapper Layer (Cải tiến quan trọng)
Tách biệt Contract API khỏi Domain Entity:

**Request/Response DTOs (Records):**
- `<Entity>Request`: các field không phải id/collection/transient; quan hệ → `<field>Id` (Long)
- `<Entity>Response`: bao gồm `id`, các field đơn giản, quan hệ → `<field>Id` (Long). **Loại bỏ các field nhạy cảm** (vd. `passwordHash`, `token`) khỏi Response

**Mapper (Spring component/static hợp lý):**
- `toEntity(Request)` → Entity (tạo mới + applyTo)
- `applyTo(Entity, Request)` → áp dụng partial update an toàn (chỉ set non-null), tránh ghi đè không mong muốn (createdAt...)
- `toResponse(Entity)` → Response (map quan hệ → id, xử lý null-safe). Xử lý đặc thù `Product.category` (getter/setter riêng)

Cải tiến: DTO layer ngăn rò rỉ JPA, giảm coupling, dễ thay đổi schema entity mà không phá vỡ API contract.

### 4.5 Controller Layer
Hai nhóm rõ rệt:

1. **Domain CRUD REST** (`/api/v1/{domain}/{entity-kebab}`) — 36 controllers
   - `POST /` → 201 Created
   - `GET /{id}` → 200 OK
   - `GET /` → 200 OK (list)
   - `PUT /{id}` → 200 OK (full/partial-safe update)
   - `DELETE /{id}` → 204 No Content
   - Sử dụng DTO+Mapper, gọi Service Interface

2. **Business/Internal APIs** (giữ nguyên, chuyên biệt cho AI & tích hợp)
   - Public Gateway: `GET /api/v1/store/current`, `POST /api/v1/chat`
   - Internal AI: `POST /internal/v1/ai/chat`
   - Internal Business (tool endpoints): 7 endpoints `/internal/api/v1/business/*`
   - Internal Audit: `GET /internal/api/v1/ai/conversations/{sessionId}/messages`

Sự tách biệt này đảm bảo: CRUD quản trị không ảnh hưởng đến contract AI Agent, và ngược lại.

## 5. AI Agent — Orchestrator & Tools

### 5.1 Tool Registry (Read-Only)
7 tools ánh xạ 1-1 Business Internal API, hoàn toàn read-only:
1. `get_sales_summary` 2. `get_profit_summary` 3. `get_top_products` 4. `get_inventory_status` 5. `get_slow_moving_products` 6. `get_expense_summary` 7. `get_restock_suggestions`

### 5.2 LLM Adapters (Multi-provider)
- `GeminiLLMAdapter`: Tool Calling thực tế (function_call), system_instruction + tool declarations, parse response đúng proto/schema
- `OpenAILLMAdapter`: Chat Completions tools (function calling), mapping schema OpenAI
- `MockLLMAdapter`: deterministic (test/offline)
- Chọn provider qua `LLM_PROVIDER` (gemini|openai|mock), fallback an toàn

### 5.3 Guardrails & Validation
| Guardrail | Mặc định | Mục đích |
|---|---|---|
| `MAX_TOOL_CALLS_PER_REQ` | 6 | Giới hạn vòng lặp tool call |
| `MAX_TURNS_PER_REQ` | 8 | Giới hạn số lượt hội thoại |
| `LLM_TIMEOUT_SECONDS` | 30 | Timeout gọi LLM |
| `TOOL_TIMEOUT_SECONDS` | 10 | Timeout gọi Business API |
| `MAX_TOOL_RESULT_CHARS` | 20000 | Cắt ngắn kết quả tool (tránh bloat) |
| Loop detection | fingerprint | Ngăn lặp vô hạn tool call |
| Response states | ok/partial/failed/rejected/clarification_required/general_help | Phân loại rõ ràng kết quả |

`partial`: có tool lỗi nhưng vẫn trả lời được (graceful degradation).

## 6. Bảo mật

- **Store isolation bắt buộc**: `store_id` do backend resolve (từ `X-Store-Code`), không bao giờ từ AI/input
- **Internal auth**: `X-Internal-Token` giữa Gateway↔AI↔Business
- **Read-only**: AI tools không ghi; audit best-effort
- **Grounding bắt buộc**: Agent trả lời dựa trên dữ liệu DB (tool results)
- **Guardrails an toàn**: từ chối yêu cầu ghi/sửa/xóa/side-effect, yêu cầu clarification khi thiếu ngữ cảnh
- **Không lưu secrets**: audit chỉ lưu metadata đã được giới hạn (truncate), không log API keys/tokens

## 7. Kiểm thử

| Tầng | Số test | Kết quả |
|---|---|---|
| Backend (JUnit 5 + Spring Boot Test) | 23/23 | PASS |
| AI Service (pytest) | 34/34 | PASS |
| Benchmark hành vi (TC-01..TC-15) | 10/10 | PASS (Intent/Tool/Clarification 100%) |

## 8. Triển khai

**Yêu cầu môi trường:** Java 21, Maven, Python 3.11, Docker (Postgres 15).

**Chạy local:**
```bash
docker compose up -d  # postgres + backend + ai-service
```

**Build/Test:**
```bash
cd backend && mvn clean test
cd ai-service && PYTHONPATH=. ./.venv/bin/pytest -q
PYTHONPATH=. ./.venv/bin/python -m app.evaluation.runner
```

## 9. Lợi ích của kiến trúc cải tiến V2.0

- **Nhất quán & có thể mở rộng**: Interface+Impl + DTO+Mapper áp dụng đồng bộ toàn bộ CRUD layer
- **Tách biệt rõ ràng contract vs domain**: DTO ngăn rò rỉ entity, API ổn định khi refactor
- **Khả năng kiểm thử tốt hơn**: Dependency qua Interface, dễ mock/unit test
- **Bảo trì dễ dàng**: Domain phân chia rõ ràng, cấu trúc dự đoán được
- **An toàn & production-ready**: Guardrails, timeouts, caps, audit, store isolation
- **Tương thích ngược**: Business Internal API + AI contract không bị phá vỡ; thêm CRUD REST mới mà không ảnh hưởng luồng chat
- **Mở rộng đa LLM**: Adapter abstraction rõ ràng (Gemini/OpenAI/Mock)

**Phiên bản:** 2.0  
**Ngày cập nhật:** 2025-10-16  
**Trạng thái:** Hoàn thiện, sẵn sàng tích hợp
