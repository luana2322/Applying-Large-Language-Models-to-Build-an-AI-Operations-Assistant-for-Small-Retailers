# AI Agent — Database & Codebase Audit

> Trạng thái: **Hoàn tất giai đoạn audit**
> Phạm vi: đối chiếu giữa thiết kế ERP/POS giả định trong yêu cầu và schema **thực tế** đang tồn tại trong repository.
> Nguyên tắc: **schema thực tế là nguồn chuẩn (source of truth)**. Mọi khác biệt so với danh sách bảng giả định đều được ghi nhận tại đây và không tự ý tạo bảng mới chỉ để khớp tài liệu.

---

## 1. Tổng quan stack thực tế

| Thành phần | Công nghệ | Phiên bản | Ghi chú |
|---|---|---|---|
| Backend nghiệp vụ | Spring Boot (Web + Data JPA + Validation) | 3.3.4 | Java 21 target, build bằng Maven |
| DB mặc định (dev/test) | H2 in-memory | theo Spring Boot BOM | `ddl-auto: create-drop` |
| DB production (docker) | PostgreSQL | 15 (docker-compose) | cấu hình qua biến môi trường `SPRING_DATASOURCE_*` |
| AI Service | FastAPI + Pydantic v2 + httpx | FastAPI ≥0.110 | Python 3.11, chạy uvicorn |
| LLM SDK | `google-generativeai` 0.8.6, `openai` | — | Gemini + OpenAI (đã có trong `.venv`) |
| Frontend | Vite + Vanilla JS | Vite 5 | gọi Spring Boot Gateway |

**Migration tooling:** dự án **không sử dụng Flyway/Liquibase**. Schema được quản lý bằng JPA entity + `hibernate.ddl-auto`. Vì vậy mọi thay đổi schema bổ sung trong tài liệu này được thực hiện bằng **entity JPA mới**, không tạo migration SQL rời.

### Cấu trúc thư mục
```text
backend/    -> Spring Boot business server (port 8080)
ai-service/ -> FastAPI agent orchestrator (port 8000)
frontend/   -> Vite chat UI (port 5173)
docs/       -> tài liệu AI Agent (thư mục này)
docker-compose.yml -> postgres + backend + ai-service
```

---

## 2. Schema thực tế đang tồn tại

Schema được suy ra **trực tiếp** từ các JPA entity trong `backend/src/main/java/com/retail/assistant/domain/entity/`.

### 2.1 Bảng `stores`
Nguồn: `Store.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK, IDENTITY | |
| `code` | VARCHAR | NOT NULL, UNIQUE | vd `STORE-001` |
| `name` | VARCHAR | NOT NULL | |
| `currency` | VARCHAR | default `VND` | |
| `timezone` | VARCHAR | default `Asia/Ho_Chi_Minh` | |
| `created_at` | TIMESTAMP | | |

### 2.2 Bảng `products`
Nguồn: `Product.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK | |
| `store_id` | BIGINT | NOT NULL | tenant scope (không có FK JPA khai báo) |
| `sku` | VARCHAR | NOT NULL | |
| `name` | VARCHAR | NOT NULL | |
| `category` | VARCHAR | | dạng text tự do (không có bảng `categories` riêng) |
| `unit` | VARCHAR | | đơn vị tính dạng text |
| `cost_price` | DOUBLE | | giá vốn **hiện tại** |
| `selling_price` | DOUBLE | | giá bán |
| `min_stock_level` | INTEGER | default 10 | ngưỡng tồn an toàn |
| `created_at` | TIMESTAMP | | |

### 2.3 Bảng `inventory_records`
Nguồn: `InventoryRecord.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK | |
| `store_id` | BIGINT | NOT NULL | |
| `product_id` | BIGINT | NOT NULL, `@OneToOne` | FK → `products.id` |
| `current_stock` | INTEGER | NOT NULL, default 0 | tồn kho hiện tại |
| `updated_at` | TIMESTAMP | | |

> Chỉ có **một mức tồn kho duy nhất cho mỗi sản phẩm / mỗi cửa hàng**. Không có khái niệm nhiều vị trí kho (`locations`).

### 2.4 Bảng `orders`
Nguồn: `Order.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK | |
| `store_id` | BIGINT | NOT NULL | |
| `order_code` | VARCHAR | NOT NULL, UNIQUE | |
| `status` | VARCHAR | NOT NULL | `COMPLETED` / `CANCELLED` / `RETURNED` |
| `total_gross` | DOUBLE | | tổng tiền hàng trước giảm giá |
| `discount` | DOUBLE | | tổng giảm giá |
| `net_amount` | DOUBLE | | `total_gross - discount` (đã clamp ≥ 0 khi seed) |
| `payment_method` | VARCHAR | | `CASH` / `QR_VNPAY` |
| `created_at` | TIMESTAMP | NOT NULL | thời điểm tạo đơn |

Quan hệ: `Order (1) — (N) OrderItem` (`orders.id` ← `order_items.order_id`).

### 2.5 Bảng `order_items`
Nguồn: `OrderItem.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | NOT NULL, `@ManyToOne` | FK → `orders.id` |
| `product_id` | BIGINT | NOT NULL, `@ManyToOne` | FK → `products.id` |
| `quantity` | INTEGER | NOT NULL | |
| `unit_price` | DOUBLE | NOT NULL | giá bán tại thời điểm giao dịch |
| `cost_price` | DOUBLE | | **giá vốn snapshot tại thời điểm bán** |
| `subtotal` | DOUBLE | | `unit_price * quantity` |

> Sự tồn tại của `cost_price` snapshot trên dòng đơn là điểm quan trọng: cho phép tính COGS lịch sử mà không phụ thuộc giá vốn hiện tại của `products`.

### 2.6 Bảng `expenses`
Nguồn: `Expense.java`
| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| `id` | BIGINT | PK | |
| `store_id` | BIGINT | NOT NULL | |
| `category` | VARCHAR | NOT NULL | vd `Mặt bằng`, `Điện nước`, `Nhân viên`, `Bao bì`, `Internet` |
| `amount` | DOUBLE | NOT NULL | |
| `description` | VARCHAR | | |
| `expense_date` | DATE | NOT NULL | |
| `created_at` | TIMESTAMP | | |

### 2.7 Quan hệ giữa các bảng

```text
stores
  ├─1:N─ products ──1:1── inventory_records
  ├─1:N─ orders ──1:N── order_items ──N:1── products
  └─1:N─ expenses
```

- `store_id` là khóa multi-tenant logic xuyên suốt (`products`, `inventory_records`, `orders`, `expenses`).
- Không có foreign key ràng buộc mức DB giữa `store_id` và `stores`; được kiểm soát ở tầng service/repository.
- `inventory_records.product_id` là quan hệ `@OneToOne` → mỗi sản phẩm có đúng một bản ghi tồn kho.

---

## 3. Đối chiếu với danh sách bảng ERP/POS giả định

Bảng dưới đây đối chiếu danh sách bảng **giả định trong yêu cầu** với thực tế repository.

| Bảng giả định | Có tồn tại? | Tương ứng thực tế | Ghi chú |
|---|---|---|---|
| `users`, `roles` | ❌ | — | Không có. Hiện chưa có xác thực người dùng (chỉ có store scope). |
| `store_profile` | ~ | `stores` | Gộp vào bảng `stores`. |
| `categories` | ❌ | cột `products.category` | Danh mục là text, không phải bảng riêng. |
| `products` | ✅ | `products` | Tồn tại, cấu trúc khác đôi chút. |
| `product_units` | ❌ | cột `products.unit` | Đơn vị là text, không có bảng quy đổi. |
| `product_images` | ❌ | — | Không có. |
| `product_price_history` | ~ | `order_items.cost_price` (snapshot) | Không có bảng lịch sử giá riêng; giá vốn lịch sử chỉ có ở mức dòng đơn. |
| `customers` | ❌ | — | Không có. |
| `sale_orders` | ~ | `orders` | Đổi tên; cấu trúc tương đương + `total_gross/discount/net_amount`. |
| `order_detail` | ~ | `order_items` | Đổi tên. |
| `suppliers` | ❌ | — | Không có. |
| `stock_receipts`, `stock_receipt_detail` | ❌ | — | Không có phiếu nhập kho. |
| `inventory` | ~ | `inventory_records` | Đổi tên; một mức tồn / sản phẩm. |
| `inventory_log` | ❌ | — | Không có log biến động kho. |
| `locations` | ❌ | — | Không có; đơn kho. |
| `stock_dispatches`, `stock_dispatch_lines` | ❌ | — | Không có. |
| `vouchers`, `vouchers_redemptions` | ❌ | — | Giảm giá nằm ở `orders.discount`. |
| `finance_ledger` | ❌ | — | Không có sổ cái tài chính. |
| `cash_funds`, `cash_transactions` | ❌ | — | Không có quỹ tiền mặt / giao dịch tiền. |
| `notifications` | ❌ | — | Không có. |
| `system_logs` | ❌ | — | Không có (sẽ bổ sung log hội thoại AI — xem §6). |
| `expenses` (nguồn chi phí) | ✅ | `expenses` | Có sẵn nguồn dữ liệu chi phí hoạt động. |

**Kết luận:** Repository hiện tại là một **POS/ERP thu gọn** tập trung vào bán hàng, tồn kho, sản phẩm và chi phí. Không có: người dùng/phân quyền, nhà cung cấp/nhập kho, nhiều kho, khách hàng, voucher, sổ quỹ/sổ cái tài chính.

---

## 4. Định nghĩa nghiệp vụ đã xác minh từ code

Các định nghĩa dưới đây được đọc trực tiếp từ service hiện có, dùng làm chuẩn cho AI Agent.

### 4.1 Doanh thu (`SalesService.getSalesSummary`)
- Chỉ xét đơn `status = COMPLETED` cho doanh thu.
- `gross_revenue` = Σ `total_gross`.
- `total_discount` = Σ `discount`.
- `net_revenue` = Σ `net_amount`.
- `total_returns` = Σ `net_amount` của đơn `status = RETURNED`.
- `valid_order_count` = số đơn `COMPLETED`.
- Đơn `CANCELLED` bị loại hoàn toàn.
- ⚠️ `net_revenue` hiện **không trừ** `total_returns`. Trả hàng được báo cáo riêng. Đây là quy ước hiện hữu và được giữ nguyên.

### 4.2 Lợi nhuận gộp (`ProfitService.getProfitSummary`)
- Doanh thu thuần = Σ `order_items.subtotal` của các đơn `COMPLETED` trong kỳ.
- COGS = Σ (`order_items.cost_price` × `quantity`); nếu `cost_price` null thì fallback `products.cost_price`.
- `gross_profit = net_revenue − cogs`.
- `gross_margin_percentage = gross_profit / net_revenue × 100`.
- `has_missing_cost = true` nếu có dòng bán thiếu cả giá vốn snapshot lẫn giá vốn hiện tại → đánh dấu dữ liệu chưa đầy đủ, **không** khẳng định lợi nhuận chính xác.

### 4.3 Top sản phẩm (`SalesService.getTopProducts`)
- Tổng hợp `order_items` của đơn `COMPLETED` theo sản phẩm.
- `metric = quantity` (Σ quantity) hoặc `revenue` (Σ subtotal).
- `limit` mặc định 5, tối đa 50.

### 4.4 Tồn kho (`InventoryService.getInventoryStatus`)
- Nguồn: `inventory_records.current_stock` (không tự cộng/trừ lịch sử).
- `OUT_OF_STOCK` nếu `current_stock ≤ 0`; `LOW_STOCK` nếu `0 < current_stock ≤ min_stock_level`; còn lại `NORMAL`.
- Hỗ trợ lọc theo `product_id`, `category`, `status`.

### 4.5 Hàng bán chậm (`InventoryService.getSlowMovingProducts`)
- Điều kiện: `current_stock ≥ min_stock_quantity` **và** số bán trong `lookback_days` `≤ max_sales_quantity`.
- Kèm ngày bán gần nhất (nếu có trong kỳ quan sát).
- Không kết luận hết hạn (DB không quản lý hạn sử dụng).

### 4.6 Gợi ý nhập hàng (`RestockService.getRestockSuggestions`)
- `daily_velocity = sold_lookback / lookback_days`.
- `target_stock = ceil(daily_velocity × planning_days + min_stock_level)`.
- `suggested_quantity = max(0, target_stock − current_stock)`.
- Đây là **công thức đề xuất MVP**, không phải mô hình dự báo đã kiểm chứng. Không có dữ liệu "hàng đang đặt/đang về" (không có phiếu nhập).

### 4.7 Chi phí (`ExpenseService.getExpenseSummary`)
- Nguồn: bảng `expenses`, lọc theo kỳ (theo `expense_date`) và `category`.
- Trả tổng chi phí và breakdown theo danh mục.

### 4.8 Dòng tiền (`get_cash_flow_summary`)
- **Không triển khai.** Không có `cash_transactions`, `cash_funds`, `finance_ledger`.
- Cố ý **không** suy diễn dòng tiền từ doanh thu/`payment_method` vì sẽ trộn doanh thu với dòng tiền và vi phạm quy tắc "không coi mọi giao dịch tiền là doanh thu/chi phí".

---

## 5. API & service có thể tái sử dụng

### 5.1 Internal Business API (tái sử dụng trực tiếp bởi AI Service)
Tiền tố: `/internal/api/v1/business`, yêu cầu header `X-Internal-Token` + `X-Store-Id`.

| Endpoint | Tool | Service |
|---|---|---|
| `POST /sales-summary` | `get_sales_summary` | `SalesService.getSalesSummary` |
| `POST /profit-summary` | `get_profit_summary` | `ProfitService.getProfitSummary` |
| `POST /top-products` | `get_top_products` | `SalesService.getTopProducts` |
| `POST /inventory-status` | `get_inventory_status` | `InventoryService.getInventoryStatus` |
| `POST /slow-moving-products` | `get_slow_moving_products` | `InventoryService.getSlowMovingProducts` |
| `POST /expense-summary` | `get_expense_summary` | `ExpenseService.getExpenseSummary` |
| `POST /restock-suggestions` | `get_restock_suggestions` | `RestockService.getRestockSuggestions` |

Mọi phản hồi bọc trong `ToolResponse<T>` (`success`, `data`, `metadata{store_id,generated_at,data_complete}`, `error{code,message}`).

### 5.2 Gateway cho frontend
| Endpoint | Mô tả |
|---|---|
| `GET /api/v1/store/current` | Trả store theo `X-Store-Code` |
| `POST /api/v1/chat` | Gateway: resolve store → gọi AI Service với token nội bộ |

### 5.3 Repository tái sử dụng
`StoreRepository`, `ProductRepository`, `InventoryRecordRepository`, `OrderRepository`, `OrderItemRepository`, `ExpenseRepository`.

---

## 6. Dữ liệu / thành phần còn thiếu và thay đổi cần thiết

| # | Thiếu | Ảnh hưởng | Hướng xử lý |
|---|---|---|---|
| 1 | Người dùng & phân quyền | Không thể xác thực theo user/role | Ghi nhận giới hạn; store scope được enforce ở backend. Không tự tạo `users/roles`. |
| 2 | Persistence hội thoại AI | Mất lịch sử khi restart; không có audit | **Bổ sung** bảng `ai_conversations`, `ai_messages`, `ai_tool_calls`, `ai_tool_results` (entity JPA mới, additive). |
| 3 | Real LLM Tool Calling | `GeminiLLMAdapter` bỏ qua tool declarations/history | **Sửa** adapter Gemini + bổ sung adapter OpenAI; mock giữ làm fallback offline. |
| 4 | Giới hạn kích thước kết quả | Tool kết quả lớn có thể phình DB/log | Giới hạn kích thước payload lưu trữ. |
| 5 | Seed dữ liệu giả vô điều kiện | Có thể ghi dữ liệu demo vào Postgres production | Gate seed sau cấu hình/profile; chỉ seed khi DB rỗng. |
| 6 | Dòng tiền / nhập kho / NCC | Không có tool cash flow, không có "hàng đang về" | Tool cash flow **không triển khai**; restock dùng công thức MVP. Ghi rõ giới hạn. |
| 7 | Tài liệu | Chưa có `docs/` | Tạo đầy đủ 7 tài liệu. |

---

## 7. Rủi ro & lưu ý khi thay đổi

1. `ddl-auto: create-drop` trên H2 nghĩa là dữ liệu dev mất khi restart; entity mới vẫn được tạo.
2. Trên PostgreSQL production, entity mới sẽ được `ddl-auto` xử lý tùy cấu hình profile (khuyến nghị `update`/migration ngoài phạm vi). Việc thêm bảng **additive** không ảnh hưởng bảng nghiệp vụ hiện có.
3. Không đổi tên/xóa cột bảng nghiệp vụ.
4. Giữ nguyên các định nghĩa nghiệp vụ đang chạy để không phá vỡ POS/kiểm thử hiện có.
5. `X-Store-Code` do client gửi, nhưng store được **resolve ở backend** và `store_id` nội bộ mới được truyền sang AI Service → AI không tự quyết định store.
