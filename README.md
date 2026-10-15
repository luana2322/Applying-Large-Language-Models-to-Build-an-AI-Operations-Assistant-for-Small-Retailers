# AI Operations Assistant for Small Retailers
> Hệ thống Trợ lý AI Điều hành Kinh doanh Thông minh cho Hộ kinh doanh & Cửa hàng Bán lẻ Quy mô Nhỏ.

Hệ thống được thiết kế theo đúng **Tài liệu Đặc tả Kỹ thuật (SRS 1.0)**, kết hợp kiến trúc đa tầng giữa **Spring Boot 3 (Backend nghiệp vụ)**, **FastAPI (AI Orchestrator)** và **LLM Tool Calling (Gemini / OpenAI / Deterministic Mock)**.

---

## 🏛️ Kiến trúc Tổng thể (Architecture)

```text
[ Frontend Chat UI ]  (Vite + Vanilla HTML5/CSS3)
       │
       ▼  (POST /api/v1/chat, X-Store-Code: STORE-001)
[ Spring Boot Gateway & Business Server ] (Port 8080)
   ├── Store Security & Multi-tenancy Isolation (X-Store-Id)
   ├── 7 Internal Business APIs (/internal/api/v1/business/*)
   ├── Internal AI Audit API (/internal/api/v1/ai/*)
   ├── JPA Entities: Store, Product, InventoryRecord, Order, OrderItem, Expense
   │   └── AI Audit Entities: AiConversation, AiMessage, AiToolCall, AiToolResult (additive)
   └── In-Memory / PostgreSQL Database (Seed Data có thể tắt ở production)
       │
       ▼  (POST /internal/v1/ai/chat, X-Internal-Token, X-Store-Id)
[ FastAPI AI Service ] (Port 8000)
   ├── Tool Registry (7 deterministic business tools)
   ├── Agent Orchestrator (Tool Execution Loop, Anti-looping, Max Turns, Max Tool Calls)
   ├── Context Manager & Response Validator (completed / partial / needs_clarification / failed)
   └── LLM Provider Adapters:
        ├── Google Gemini 1.5 Flash (google-generativeai, real Tool Calling)
        ├── OpenAI GPT-4o-mini (AsyncOpenAI, real Tool Calling)
        └── Deterministic MockLLM (độc lập, offline, bảo mật tuyệt đối)
```

> 📚 **Tài liệu kỹ thuật AI Agent** (thư mục `docs/`):
> [Kiến trúc](./docs/AI_AGENT_ARCHITECTURE.md) ·
> [Audit DB](./docs/AI_AGENT_DATABASE_AUDIT.md) ·
> [Kế hoạch](./docs/AI_AGENT_IMPLEMENTATION_PLAN.md) ·
> [Công cụ](./docs/AI_AGENT_TOOLS.md) ·
> [API](./docs/AI_AGENT_API.md) ·
> [Bảo mật](./docs/AI_AGENT_SECURITY.md) ·
> [Đánh giá](./docs/AI_AGENT_EVALUATION.md)

---

## 🛠️ Danh sách 7 Công cụ Nghiệp vụ (Tool Registry)

| # | Tên Tool | Mục đích nghiệp vụ | API Backend tương ứng |
|---|---|---|---|
| 1 | `get_sales_summary` | Tổng hợp doanh thu gộp, giảm giá, hoàn trả, doanh thu thuần, số đơn hàng | `/sales-summary` |
| 2 | `get_profit_summary` | Tính doanh thu thuần, COGS (giá vốn), lợi nhuận gộp & biên lợi nhuận % | `/profit-summary` |
| 3 | `get_top_products` | Xếp hạng sản phẩm bán chạy theo số lượng hoặc doanh thu | `/top-products` |
| 4 | `get_inventory_status` | Kiểm tra tồn kho, cảnh báo hàng sắp hết (`low_stock`) & hết hàng (`out_of_stock`) | `/inventory-status` |
| 5 | `get_slow_moving_products` | Tìm sản phẩm bán chậm hoặc tồn ứ đọng nhiều ngày | `/slow-moving-products` |
| 6 | `get_expense_summary` | Tổng hợp chi phí hoạt động theo danh mục (thuê mặt bằng, điện nước, nhân sự...) | `/expense-summary` |
| 7 | `get_restock_suggestions` | Đề xuất số lượng nhập hàng dựa trên tốc độ bán thực tế và số ngày dự trữ | `/restock-suggestions` |

---

## 📊 Kết quả Benchmark & Đánh giá (TC-01 đến TC-15)

Đã chạy kiểm thử định lượng theo kịch bản chuẩn trong SRS mục 12:

```text
=====================================================================
                    KẾT QUẢ ĐÁNH GIÁ CHUẨN (BENCHMARK)
=====================================================================
Tổng số test case:              10
Số test case đạt yêu cầu:       10/10
Độ chính xác Intent (Intent Acc): 100.0%
Độ chính xác Tool (Tool Acc):     100.0%
Độ chính xác Clarification:       100.0%
=====================================================================
```

1. **TC-01 (Doanh thu hôm nay):** Gọi đúng `get_sales_summary` với ngày hiện tại.
2. **TC-02 (Doanh thu tháng trước):** Trích xuất đúng mốc đầu tháng và cuối tháng trước.
3. **TC-03 (Top sản phẩm bán chạy):** Gọi `get_top_products` với limit hợp lệ.
4. **TC-04 (Cảnh báo hàng sắp hết):** Gọi `get_inventory_status` với `status="low_stock"`.
5. **TC-05 (Lợi nhuận gộp):** Gọi `get_profit_summary` tính toán chính xác COGS và % biên lợi nhuận.
6. **TC-06 (Ngữ cảnh tiếp nối):** Tự động hiểu khoảng thời gian từ lịch sử hội thoại trước đó.
7. **TC-07 (Câu hỏi mơ hồ):** Phản hồi `needs_clarification`, yêu cầu người dùng xác định rõ thời gian.
8. **TC-08 (Tool ngoài registry):** Từ chối gọi tool không được cấp phép.
9. **TC-12 (Yêu cầu ghi/sửa dữ liệu):** Từ chối thực hiện thao tác sửa kho qua chat.
10. **TC-15 (Prompt Injection):** Chặn các yêu cầu tiết lộ API key hay system prompt.

---

## 🚀 Hướng dẫn Chạy Hệ thống

### 1. Khởi động Spring Boot Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```
> Khi khởi động, `DataLoader` sẽ tự động tạo dữ liệu mẫu phong phú: 2 cửa hàng, 18 mặt hàng đa dạng, 60 ngày giao dịch bán lẻ và các khoản chi phí hoạt động.
> ⚙️ Ở môi trường production, đặt `APP_SEED_DATA_ENABLED=false` để **không** trộn dữ liệu demo vào dữ liệu thật (chỉ seed khi DB rỗng).

### 2. Khởi động AI Service (Port 8000)
```bash
cd ai-service
./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Nếu có Google Gemini API Key: thêm vào file `ai-service/.env`:
  ```env
  LLM_PROVIDER=gemini
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- Nếu không có API Key: AI Service tự động chạy chế độ `mock` mô phỏng suy luận và Tool Calling cục bộ, phục vụ kiểm thử và demo hoàn hảo.

### 3. Khởi động Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
Truy cập: `http://localhost:5173` để trải nghiệm giao diện chat kèm **Tool Execution Inspector**.

### 4. Chạy Kiểm thử Tự động (Tests & Benchmark)
- Backend tests (JUnit 5) — **23/23 pass**:
  ```bash
  cd backend && mvn test
  ```
- AI Service unit & integration tests (pytest) — **34/34 pass**:
  ```bash
  cd ai-service && PYTHONPATH=. ./.venv/bin/pytest tests/
  ```
- AI Agent Benchmark Suite (offline, tất định):
  ```bash
  cd ai-service && PYTHONPATH=. ./.venv/bin/python -m app.evaluation.runner
  ```

Chi tiết phương pháp đánh giá & ground-truth: [`docs/AI_AGENT_EVALUATION.md`](./docs/AI_AGENT_EVALUATION.md).

---

## 🔒 Điểm nổi bật về bảo mật & độ tin cậy

- **Grounded tuyệt đối:** mọi con số đều đến từ tool; tool lỗi/timeout được báo trung thực, **không** suy diễn thành 0 hay bịa kết quả.
- **Read-only:** agent chỉ đọc/phân tích; không tool nào ghi, sửa giá, điều chỉnh kho hay đặt hàng.
- **Store isolation:** `X-Store-Code` được resolve ở backend; AI không tự chọn cửa hàng và tool không nhận `store_id`.
- **Guardrails:** allowlist tool, validate tham số, chống vòng lặp, giới hạn số tool call/vòng, timeout, cắt kích thước kết quả.
- **Audit fail-safe:** lịch sử hội thoại được lưu best-effort theo store; lỗi audit không làm gián đoạn chat.

Chi tiết: [`docs/AI_AGENT_SECURITY.md`](./docs/AI_AGENT_SECURITY.md).
