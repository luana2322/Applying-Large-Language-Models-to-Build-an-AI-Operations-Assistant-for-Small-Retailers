# AI Agent — Danh mục Công cụ (Tools)

> 7 công cụ đọc dữ liệu (**read-only**) ánh xạ 1-1 tới internal business API của Spring Boot.
> Mọi định nghĩa nghiệp vụ dưới đây được xác minh trực tiếp từ service backend, xem [`AI_AGENT_DATABASE_AUDIT.md`](./AI_AGENT_DATABASE_AUDIT.md) §4.

---

## 1. Bảng ánh xạ

| # | Tool | Endpoint nội bộ | Service backend |
|---|---|---|---|
| 1 | `get_sales_summary` | `POST /internal/api/v1/business/sales-summary` | `SalesService.getSalesSummary` |
| 2 | `get_profit_summary` | `POST /internal/api/v1/business/profit-summary` | `ProfitService.getProfitSummary` |
| 3 | `get_top_products` | `POST /internal/api/v1/business/top-products` | `SalesService.getTopProducts` |
| 4 | `get_inventory_status` | `POST /internal/api/v1/business/inventory-status` | `InventoryService.getInventoryStatus` |
| 5 | `get_slow_moving_products` | `POST /internal/api/v1/business/slow-moving-products` | `InventoryService.getSlowMovingProducts` |
| 6 | `get_expense_summary` | `POST /internal/api/v1/business/expense-summary` | `ExpenseService.getExpenseSummary` |
| 7 | `get_restock_suggestions` | `POST /internal/api/v1/business/restock-suggestions` | `RestockService.getRestockSuggestions` |

**Quan trọng:** không tool nào nhận tham số `store_id`. Store scope do backend quyết định từ header `X-Store-Id` (xem `AI_AGENT_SECURITY.md`).

---

## 2. `get_sales_summary` — Tổng hợp doanh thu

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `start_date` | string | không | `YYYY-MM-DD` |
| `end_date` | string | không | `YYYY-MM-DD` |
| `group_by` | string | không | `day` \| `week` \| `month` |

**Trả về:** `gross_revenue`, `total_discount`, `total_returns`, `net_revenue`, `valid_order_count`.

**Định nghĩa nghiệp vụ:**
- Chỉ tính đơn `status = COMPLETED`.
- `gross_revenue = Σ total_gross`, `total_discount = Σ discount`, `net_revenue = Σ net_amount`.
- `total_returns = Σ net_amount` của đơn `status = RETURNED`.
- Đơn `CANCELLED` bị loại hoàn toàn.
- ⚠️ `net_revenue` **không trừ** `total_returns` (trả hàng báo cáo riêng). Đây là quy ước hiện hữu.

---

## 3. `get_profit_summary` — Lợi nhuận gộp

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `start_date` | string | không | `YYYY-MM-DD` |
| `end_date` | string | không | `YYYY-MM-DD` |

**Trả về:** `net_revenue`, `cost_of_goods_sold`, `gross_profit`, `gross_margin_percentage`, `has_missing_cost`, `note`.

**Định nghĩa nghiệp vụ:**
- Doanh thu thuần = Σ `order_items.subtotal` của đơn `COMPLETED`.
- `COGS = Σ (order_items.cost_price × quantity)`; nếu `cost_price` null → fallback `products.cost_price`.
- `gross_profit = net_revenue − cogs`.
- `gross_margin_percentage = gross_profit / net_revenue × 100`.
- `has_missing_cost = true` nếu có dòng bán thiếu cả giá vốn snapshot lẫn giá vốn hiện tại → **đánh dấu dữ liệu chưa đầy đủ, không khẳng định lợi nhuận chính xác.**

---

## 4. `get_top_products` — Sản phẩm bán chạy

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `start_date` | string | không | `YYYY-MM-DD` |
| `end_date` | string | không | `YYYY-MM-DD` |
| `metric` | string | không | `quantity` (mặc định) \| `revenue` |
| `limit` | integer | không | mặc định 5, tối đa 50 |

**Trả về:** danh sách `products[]` với `rank`, `product_id`, `sku`, `name`, `quantity_sold`, `net_revenue`.

**Định nghĩa:** tổng hợp `order_items` của đơn `COMPLETED` theo sản phẩm; xếp hạng theo `quantity` hoặc `revenue`.

---

## 5. `get_inventory_status` — Trạng thái tồn kho

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `product_id` | integer | không | lọc 1 sản phẩm |
| `category` | string | không | lọc theo danh mục |
| `status` | string | không | `all` \| `low_stock` \| `out_of_stock` |

**Trả về:** `total_items`, `low_stock_count`, `out_of_stock_count`, `items[]` (tối đa 200 dòng — giới hạn an toàn).

**Định nghĩa:** nguồn `inventory_records.current_stock`.
- `OUT_OF_STOCK` nếu `current_stock ≤ 0`.
- `LOW_STOCK` nếu `0 < current_stock ≤ min_stock_level`.
- còn lại `NORMAL`.

> Lưu ý giới hạn: `total_items`/các `*_count` phản ánh tập khớp đầy đủ; danh sách `items[]` bị cắt tối đa 200 dòng để bảo vệ tầng AI.

---

## 6. `get_slow_moving_products` — Hàng bán chậm

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `lookback_days` | integer | không | mặc định 30 |
| `min_stock_quantity` | integer | không | mặc định 5 |
| `max_sales_quantity` | integer | không | mặc định 2 |

**Trả về:** `lookback_days`, `slow_moving_products[]` (tối đa 200).

**Định nghĩa:** `current_stock ≥ min_stock_quantity` **và** số bán trong `lookback_days` `≤ max_sales_quantity`. Kèm ngày bán gần nhất (nếu có). Không kết luận hết hạn (DB không quản lý hạn dùng).

---

## 7. `get_expense_summary` — Chi phí hoạt động

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `start_date` | string | không | `YYYY-MM-DD` |
| `end_date` | string | không | `YYYY-MM-DD` |
| `category` | string | không | lọc theo danh mục chi phí |

**Trả về:** `total_expense`, `by_category[]` (`category`, `total_amount`, `transaction_count`).

**Định nghĩa:** nguồn bảng `expenses`, lọc theo `expense_date` và `category`.

---

## 8. `get_restock_suggestions` — Đề xuất nhập hàng

| Tham số | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `product_id` | integer | không | tính cho 1 sản phẩm |
| `planning_days` | integer | không | mặc định 14 |
| `lookback_days` | integer | không | mặc định 30 |

**Trả về:** `planning_days`, `lookback_days`, `suggestions[]` (tối đa 200), sắp xếp giảm dần theo `suggested_quantity`.

**Công thức (MVP):**
```text
daily_velocity    = sold_lookback / lookback_days
target_stock      = ceil(daily_velocity × planning_days + min_stock_level)
suggested_quantity = max(0, target_stock − current_stock)
```
> Đây là công thức đề xuất MVP, không phải mô hình dự báo đã kiểm chứng. Không có dữ liệu "hàng đang đặt/đang về" (không có phiếu nhập kho).

---

## 9. Tổng hợp giới hạn & ràng buộc chung

- **Read-only**: không tool nào sửa dữ liệu, tạo giao dịch, đổi giá, điều chỉnh kho, đặt hàng.
- **Store scope**: luôn theo `X-Store-Id`; không truyền `store_id` trong tham số tool.
- **Validate tham số**: `registry.validate_arguments` kiểm tra tham số bắt buộc + định dạng ngày `YYYY-MM-DD`.
- **Giới hạn kết quả**: cắt tối đa 200 dòng cho các tool danh sách; cắt `max_tool_result_chars` khi lưu audit.
- **Không triển khai** `get_cash_flow_summary` (không có nguồn dữ liệu dòng tiền đáng tin cậy).

---

## 10. Xử lý lỗi (fail-safe)

| Tình huống | Hành vi |
|---|---|
| Tham số sai định dạng | `status=error`, không gọi backend, model được thông báo lỗi. |
| Tool không có trong registry | `status=rejected`, không gọi backend. |
| Business API timeout | `BUSINESS_API_TIMEOUT`, trả lỗi trung thực, **không** suy diễn số 0. |
| Business API lỗi HTTP | `BUSINESS_API_ERROR`, status `error`/`failed`. |
| Gọi trùng fingerprint | `status=rejected` (chống loop). |
