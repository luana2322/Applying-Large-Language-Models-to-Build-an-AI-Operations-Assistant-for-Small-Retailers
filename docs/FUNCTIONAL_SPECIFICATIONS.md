# Danh sách chức năng & Đặc tả Hệ thống (Functional Specifications)
## Dự án: Pet Store AI Operations Assistant (Hệ thống Trợ lý Vận hành Bán lẻ Thú cưng)

Tài liệu này chuẩn hóa toàn bộ **12 phân hệ chức năng**, **bảng phân quyền ma trận (RBAC Matrix)**, và **sơ đồ Use Case Mermaid** chuẩn học thuật để đưa trực tiếp vào Báo cáo Đồ án tốt nghiệp / Khóa luận tốt nghiệp.

---

## 1. SƠ ĐỒ USE CASE HỆ THỐNG

### 1.1. Sơ đồ Use Case Tổng quát (Overall Use Case Diagram)

```mermaid
usecaseDiagram
    actor "Chủ cửa hàng\n(Owner/Admin)" as Owner
    actor "Nhân viên Bán hàng\n(Sales Staff)" as Staff
    actor "Thợ Grooming\n(Groomer)" as Groomer
    actor "Hệ thống AI\n(AI Assistant)" as AI

    package "Hệ thống ERP Cửa hàng Thú cưng" {
        usecase "UC01: Xác thực & Phân quyền" as UC01
        usecase "UC02: Xem Dashboard & Báo cáo" as UC02
        usecase "UC03: Quản lý Sản phẩm & Phụ kiện" as UC03
        usecase "UC04: Quản lý Kho theo Lô & HSD" as UC04
        usecase "UC05: Quản lý Nhập hàng & NCC" as UC05
        usecase "UC06: Bán hàng tại Quầy (POS)" as UC06
        usecase "UC07: Quản lý Khách & Hồ sơ Thú cưng" as UC07
        usecase "UC08: Quản lý Lịch hẹn Spa/Grooming" as UC08
        usecase "UC09: Quản lý Sổ quỹ & Thu chi" as UC09
        usecase "UC10: Tra cứu & Thao tác cùng AI" as UC10
        usecase "UC11: Kiểm soát An toàn Y tế (Guardrail)" as UC11
        usecase "UC12: Nhật ký Hệ thống & Audit Log" as UC12
    }

    Owner --> UC01
    Owner --> UC02
    Owner --> UC03
    Owner --> UC04
    Owner --> UC05
    Owner --> UC07
    Owner --> UC09
    Owner --> UC10
    Owner --> UC12

    Staff --> UC06
    Staff --> UC07
    Staff --> UC08
    Staff --> UC10

    Groomer --> UC08
    Groomer --> UC07

    AI --> UC10
    UC10 ..> UC11 : <<include>>
    UC10 ..> UC04 : <<read/suggest>>
    UC10 ..> UC05 : <<draft order>>
    UC10 ..> UC02 : <<query metrics>>
```

---

### 1.2. Sơ đồ Use Case Phân hệ AI Operations Assistant (Chi tiết điểm nhấn đồ án)

```mermaid
usecaseDiagram
    actor "Người dùng\n(Owner/Staff)" as User
    actor "AI Agent Core\n(LLM & Tools)" as Agent
    actor "Hệ thống CSDL\n(PostgreSQL)" as DB

    package "Phân hệ Trợ lý Vận hành AI" {
        usecase "Nhập câu hỏi ngôn ngữ tự nhiên" as Prompt
        usecase "Phân tích ý định (Intent Classification)" as Intent
        usecase "Kiểm duyệt Rào cản Y tế (Medical Guardrail)" as Guardrail
        usecase "Từ chối chẩn đoán (BLOCKED_MEDICAL_INTENT)" as RejectMed
        usecase "Truy vấn Tool Call (Doanh thu / Kho / Lô HSD)" as ToolCall
        usecase "Gợi ý Nhập hàng theo tốc độ bán" as SuggestRestock
        usecase "Đề xuất Tạo Phiếu Nhập Nháp" as DraftReceipt
        usecase "Xác nhận ghi dữ liệu (Human-in-the-loop)" as HumanConfirm
        usecase "Ghi nhật ký Tool Audit Log" as Audit
    }

    User --> Prompt
    Prompt --> Intent
    Intent --> Guardrail

    Guardrail --> RejectMed : Phát hiện ý định kê đơn/chữa bệnh
    Guardrail --> ToolCall : Ý định vận hành hợp lệ

    ToolCall --> SuggestRestock
    SuggestRestock --> DraftReceipt
    DraftReceipt --> HumanConfirm : Yêu cầu phê duyệt
    HumanConfirm --> DB : Ghi dữ liệu thực tế

    ToolCall --> DB : Đọc dữ liệu
    ToolCall ..> Audit : <<include>>
    HumanConfirm ..> Audit : <<include>>
```

---

## 2. BẢNG PHÂN QUYỀN MA TRẬN RBAC (Actor × Chức năng)

> **Ký hiệu:**  
> - `CRUD`: Toàn quyền Tạo, Đọc, Sửa, Xóa  
> - `R`: Chỉ đọc (View/Read)  
> - `U`: Chỉ cập nhật trạng thái (Update)  
> - `EX`: Quyền thực thi / Duyệt (Execute / Approve)  
> - `❌`: Không có quyền truy cập  

| Phân hệ | Mã | Tên Chức năng | Owner (Chủ shop) | Manager (Quản lý) | Staff (Bán hàng) | Groomer (Thợ spa) |
|---|---|---|:---:|:---:|:---:|:---:|
| **1. Xác thực** | 1.1 | Đăng nhập hệ thống (JWT) | ✅ | ✅ | ✅ | ✅ |
| | 1.5 | Quản lý tài khoản nhân viên | CRUD | R | ❌ | ❌ |
| | 1.6 | Phân quyền RBAC | CRUD | R | ❌ | ❌ |
| | 1.9 | Cài đặt thông tin cửa hàng | CRUD | R | ❌ | ❌ |
| **2. Báo cáo** | 2.1 | Dashboard tổng quan | R | R | ❌ | ❌ |
| | 2.2 | Biểu đồ doanh thu 7/30 ngày | R | R | ❌ | ❌ |
| | 2.5 | Lịch hẹn hôm nay (Timeline) | R | R | R | R |
| | 2.6 | Xem cảnh báo cận hạn & tồn thấp | R | R | R | ❌ |
| | 2.10| Xuất báo cáo Excel / PDF | EX | EX | ❌ | ❌ |
| **3. Sản phẩm** | 3.1 | Quản lý danh mục | CRUD | CRUD | R | R |
| | 3.2 | Quản lý sản phẩm (SKU, barcode) | CRUD | CRUD | R | R |
| | 3.4 | Cấu hình thuộc tính (Grain-free, vị...) | CRUD | CRUD | R | R |
| | 3.8 | Tra cứu sản phẩm & tồn kho | R | R | R | R |
| **4. Kho & Lô** | 4.2 | Tra cứu tồn kho theo lô & HSD | R | R | R | ❌ |
| | 4.4 | Kiểm tra danh sách hàng cận hạn | R | R | R | ❌ |
| | 4.6 | Điều chỉnh tồn kho (Kiểm kê) | EX | CRUD | ❌ | ❌ |
| | 4.7 | Điều chuyển kho nội bộ | EX | CRUD | ❌ | ❌ |
| **5. Nhập hàng** | 5.1 | Quản lý nhà cung cấp | CRUD | CRUD | R | ❌ |
| | 5.2 | Tạo phiếu nhập kho theo lô | CRUD | CRUD | R | ❌ |
| | 5.4 | Phê duyệt phiếu nhập kho | EX | EX | ❌ | ❌ |
| | 5.7 | Tiếp nhận gợi ý nhập hàng từ AI | R | R | ❌ | ❌ |
| **6. POS** | 6.1 | Thao tác bán hàng tại quầy (F2) | CRUD | CRUD | CRUD | ❌ |
| | 6.3 | Gắn khách hàng & Thú cưng vào đơn | CRUD | CRUD | CRUD | ❌ |
| | 6.4 | Thanh toán tiền mặt / Chuyển khoản | CRUD | CRUD | CRUD | ❌ |
| | 6.8 | Hủy đơn hàng / Trả hàng | EX | EX | ❌ | ❌ |
| **7. Thú cưng** | 7.1 | Quản lý khách hàng | CRUD | CRUD | CRUD | R |
| | 7.3 | Quản lý hồ sơ thú cưng (giống, cân nặng) | CRUD | CRUD | CRUD | CRUD |
| | 7.6 | Cập nhật ghi chú dị ứng & sức khỏe | CRUD | CRUD | CRUD | CRUD |
| **8. Grooming** | 8.1 | Quản lý dịch vụ & giá spa | CRUD | CRUD | R | R |
| | 8.2 | Tạo lịch hẹn grooming | CRUD | CRUD | CRUD | CRUD |
| | 8.4 | Cập nhật trạng thái lịch hẹn | U | U | U | U |
| | 8.6 | Thu tiền & chốt bill dịch vụ | CRUD | CRUD | CRUD | ❌ |
| **9. Sổ quỹ** | 9.1 | Quản lý các nguồn quỹ (Két/Bank) | CRUD | R | ❌ | ❌ |
| | 9.2 | Lập phiếu thu | CRUD | CRUD | CRUD | ❌ |
| | 9.3 | Lập phiếu chi | EX | CRUD | ❌ | ❌ |
| | 9.4 | Tra cứu sổ quỹ thu chi | R | R | ❌ | ❌ |
| **10. AI Copilot**| 10.1| Hỏi đáp số liệu tự nhiên | ✅ | ✅ | ✅ | ❌ |
| | 10.2| Xem gợi ý nhập hàng / xả hàng | ✅ | ✅ | ❌ | ❌ |
| | 10.3| Phê duyệt tạo phiếu nháp từ AI | EX | EX | ❌ | ❌ |
| | 10.5| Kích hoạt Guardrail chặn y tế | Tự động | Tự động | Tự động | Tự động |
| **12. Audit Log**| 12.1| Xem nhật ký thay đổi dữ liệu | R | ❌ | ❌ | ❌ |
| | 12.3| Kiểm toán lịch sử AI Tool Calling | R | R | ❌ | ❌ |

---

## 3. BẢNG PHÂN RÃ CHỨC NĂNG CHI TIẾT THEO 12 PHÂN HỆ

### Phân hệ 1: Xác thực & Phân quyền (Security & Access Control)
- **1.1. Đăng nhập JWT (P0):** Xác thực an toàn qua Access Token & Refresh Token lưu trữ an toàn; tự động cấp lại token nền khi hết hạn.
- **1.2. Đăng xuất (P0):** Thu hồi hiệu lực Refresh token trong bảng `refresh_tokens`.
- **1.3. Đổi mật khẩu (P0):** Mã hóa BCrypt mật khẩu người dùng trước khi lưu database.
- **1.4. Quản lý người dùng (P0):** Cấp tài khoản nhân viên, khóa/mở quyền theo chi nhánh cửa hàng.
- **1.5. Phân quyền RBAC (P0):** Khai báo vai trò (`OWNER`, `MANAGER`, `STAFF`, `GROOMER`) với JSON permissions linh hoạt.
- **1.6. Thông tin cửa hàng (P0):** Lưu trữ thông tin hộ kinh doanh, địa chỉ, mã số thuế và hotline.

### Phân hệ 2: Dashboard & Báo cáo Thông minh
- **2.1. KPI Bar Thống kê nhanh (P0):** Hiển thị Doanh thu hôm nay, Số đơn hàng POS, Số lịch hẹn grooming, và Số mặt hàng cận hạn < 30 ngày.
- **2.2. Biểu đồ doanh thu 7 ngày (P0):** Bar chart hiển thị biến thiên doanh thu sản phẩm + dịch vụ.
- **2.3. Cảnh báo thông minh (P0):** Nhận diện tự động lô hàng sắp hết hạn hoặc tồn kho dưới mức an toàn.
- **2.4. Top 5 Sản phẩm & Top 5 Khách thân thiết (P0/P1):** Bảng xếp hạng bán chạy và khách hàng có điểm chi tiêu cao.
- **2.5. Timeline lịch hẹn hôm nay (P0):** Dòng thời gian trực quan theo ca làm việc của kỹ thuật viên grooming.

### Phân hệ 3: Sản phẩm & Danh mục Thú cưng
- **3.1. Danh mục phân cấp (P0):** Cấu trúc cây: Thức ăn khô, thức ăn ướt, snack, phụ kiện, đồ chơi, hóa mỹ phẩm spa.
- **3.2. Quản lý SKU & Barcode (P0):** Quản lý mã vạch quét máy POS F3, đơn vị tính quy đổi (Gói / Hộp / Thùng).
- **3.3. Thuộc tính thú cưng mở rộng (P1):** Lưu trữ nhãn `Grain-Free`, phân loại độ tuổi (`Kitten`, `Adult`, `Puppy`), trọng lượng và hương vị đặc thù.
- **3.4. Phân loại theo loài (P0):** Nhãn dành riêng cho `Chó`, `Mèo`, hoặc `Chung`.

### Phân hệ 4: Kho vận & Quản lý Lô HSD
- **4.1. Tồn kho chi tiết theo Lô & HSD (P0):** Quản lý số lô (`LOT-YYYYMM-XX`), ngày sản xuất và ngày hết hạn.
- **4.2. Cảnh báo HSD 3 cấp độ (P0):**
  - Cận hạn nguy hiểm (< 15 ngày): Màu đỏ đậm `#EF4444`.
  - Cận hạn cảnh báo (15 - 30 ngày): Màu vàng cam `#F59E0B`.
  - HSD an toàn (> 30 ngày): Màu chuẩn.
- **4.3. Sổ thẻ kho (Inventory Log) (P0):** Truy vết mọi biến động số lượng (Xuất bán, Nhập hàng, Điều chỉnh kiểm kê, Hủy hàng hết hạn).
- **4.4. Điều chỉnh tồn kho kiểm kê (P1):** Cân đối giữa tồn thực tế đếm được và tồn hệ thống.

### Phân hệ 5: Nhập hàng & Quản lý Nhà cung cấp
- **5.1. Quản lý Nhà cung cấp (P0):** Danh bạ đối tác cung ứng (Địa chỉ, số điện thoại, công nợ).
- **5.2. Lập phiếu nhập kho theo lô (P0):** Nhập nhiều mặt hàng cùng lúc, bắt buộc khai báo số lô và HSD cho từng dòng hàng.
- **5.3. Quy trình duyệt phiếu 3 bước (P0):** `DRAFT` (Nháp) ➔ `PENDING` (Chờ thủ kho kiểm) ➔ `APPROVED` (Đã duyệt & tăng tồn kho thực tế).
- **5.4. Gợi ý nhập hàng AI (P1):** AI phân tích tốc độ bán trung bình ngày (Run-rate) để đưa ra khuyến nghị số lượng nhập tối ưu.

### Phân hệ 6: Bán hàng tại Quầy (POS Bán lẻ)
- **6.1. Bố cục POS 3 cột chuẩn KiotViet (P0):** 60% Sản phẩm + 25% Giỏ hàng + 15% Thanh toán.
- **6.2. Phím tắt thao tác nhanh (P0):**
  - `F2`: Hoàn tất thanh toán.
  - `F3`: Đưa con trỏ vào ô quét mã vạch Barcode.
  - `F4`: Gửi lệnh in hóa đơn thanh toán.
- **6.3. Liên kết Khách & Thú cưng (P0):** Dropdown tự động hiển thị giống loài và cân nặng bé cưng để tư vấn đúng size dây dắt hoặc lượng hạt phù hợp.
- **6.4. Trừ kho tự động theo nguyên tắc cận hạn trước (FEFO) (P0):** Ưu tiên xuất các lô có HSD gần nhất để giảm thiểu hao hụt.

### Phân hệ 7: Hồ sơ Khách hàng & Thú cưng
- **7.1. Quản lý Khách hàng & Loyalty (P0):** Tích điểm tự động theo tỷ lệ tiền chi tiêu.
- **7.2. Hồ sơ Thú cưng chuyên sâu (P0):**
  - Tên bé, loài, giống, giới tính, ngày sinh, cân nặng cập nhật định kỳ.
  - **Trường cảnh báo bắt buộc:** Dị ứng thực phẩm (`allergies`) và tính cách (`health_notes` - ví dụ: sợ máy sấy, hung dữ khi cắt móng).
- **7.3. Lịch sử tiêu dùng trọn đời (P1):** Tra cứu nhanh các mặt hàng bé cưng hay dùng và các lần làm dịch vụ trước.

### Phân hệ 8: Dịch vụ Grooming & Spa
- **8.1. Danh mục bảng giá dịch vụ (P0):** Tắm sấy khử mùi, cắt tỉa vệ sinh, cắt móng, combo spa trọn gói phân cấp theo cân nặng thú cưng.
- **8.2. Đặt lịch hẹn theo khung giờ (P0):** Chọn kỹ thuật viên phụ trách, kiểm tra slot giờ trống tránh trùng ca.
- **8.3. Vòng đời lịch hẹn chuẩn (P0):** `Chờ duyệt` (Pending) ➔ `Đã nhận bé` (Confirmed) ➔ `Đang tắm/tỉa` (In-progress) ➔ `Hoàn thành` (Completed).
- **8.4. Cảnh báo an toàn tại quầy tiếp nhận (P1):** Hiển thị banner đỏ/vàng cảnh báo nếu thú cưng có dị ứng da với xà phòng hoặc có tiền sử cắn thợ.

### Phân hệ 9: Quản lý Quỹ & Thu chi
- **9.1. Quản lý nguồn quỹ (P0):** Tách bạch quỹ Tiền mặt tại két cửa hàng và Quỹ Tài khoản Ngân hàng (Vietcombank QR).
- **9.2. Phiếu thu / Phiếu chi tự động (P0):** 
  - Tự động sinh phiếu thu tiền mặt khi thanh toán đơn POS thành công.
  - Tự động sinh phiếu chi khi hoàn tất duyệt thanh toán tiền hàng NCC.
- **9.3. Báo cáo cơ cấu doanh thu (P1):** Phân tích tỷ trọng Doanh thu Sản phẩm vs Doanh thu Dịch vụ Grooming.

### Phân hệ 10: Phân hệ Trợ lý AI Vận hành (Điểm nhấn đề tài)
- **10.1. Hỏi đáp số liệu qua Ngôn ngữ tự nhiên (P0):**
  - Tra cứu doanh thu hôm nay / so sánh tuần.
  - Tra cứu tồn kho chính xác theo từng mã sản phẩm.
  - Tra cứu danh sách các mặt hàng có HSD < 30 ngày.
- **10.2. Rào cản kiểm duyệt y tế (Medical Guardrail) (P0):**
  - Nhận diện các câu hỏi chẩn đoán triệu chứng (tiêu chảy, rụng lông mảng, nôn mửa, sốt).
  - Tự động kích hoạt phản hồi chuẩn `BLOCKED_MEDICAL_INTENT`: Từ chối đưa ra đơn thuốc, hướng dẫn khách đưa thú cưng đến bệnh viện thú y gần nhất.
- **10.3. Gợi ý nhập hàng & Tạo phiếu nháp (P0):**
  - Đề xuất tạo phiếu nhập `#NK-xxxx` dựa trên tốc độ tiêu thụ.
  - Bắt buộc phải có bước xác nhận phê duyệt từ phía người dùng (`Human-in-the-loop`) trước khi ghi nhận vào Database.
- **10.4. Audit Log Tool Calling (P0):** Ghi nhận chi tiết từng function tool call, tham số đầu vào và kết quả trả về của LLM vào bảng `ai_tool_calls`.

### Phân hệ 11 & 12: Cài đặt, Thông báo & Kiểm toán Hệ thống
- **11.1. Cấu hình ngưỡng cảnh báo tồn (P1):** Tùy chỉnh mức tồn tối thiểu cho từng nhóm hàng.
- **12.1. Audit Trail (P0):** Nhật ký kiểm toán bất biến ghi lại `User ID`, `Hành động` (INSERT, UPDATE, DELETE), `Dữ liệu cũ` và `Dữ liệu mới`.
- **12.2. Giám sát lỗi hệ thống (P1):** Ghi log các ngoại lệ và thời gian đáp ứng API.
