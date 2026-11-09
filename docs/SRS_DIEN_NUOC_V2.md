# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)

# HỆ THỐNG TRỢ LÝ AI HỖ TRỢ ĐIỀU HÀNH KINH DOANH CHO CỬA HÀNG ĐIỆN NƯỚC VÀ THIẾT BỊ VỆ SINH TẠI VIỆT NAM

**Project Title:** Applying Large Language Models to Build an AI Operations Assistant for Small Retailers

**Business Domain:** Electrical, Plumbing & Sanitary Ware Retail Management

**Document Type:** Software Requirements Specification (SRS)

**Version:** 2.0

---

# 1. TỔNG QUAN DỰ ÁN

## 1.1. Bối cảnh và lý do thực hiện

Tại Việt Nam, các cửa hàng kinh doanh vật tư điện nước, thiết bị vệ sinh và vật liệu hoàn thiện công trình chủ yếu hoạt động dưới mô hình hộ kinh doanh cá thể hoặc cửa hàng bán lẻ quy mô nhỏ.

Các cửa hàng này cung cấp nhiều nhóm sản phẩm khác nhau:
- Thiết bị điện: Dây điện, công tắc, ổ cắm, aptomat, đèn LED.
- Vật tư ngành nước: Ống PVC, PPR, HDPE, van nước, co, lơ, tê, phụ kiện nối ống.
- Thiết bị vệ sinh: Lavabo, bồn cầu, bồn tiểu, bồn tắm.
- Thiết bị phòng tắm: Vòi lavabo, sen tắm, vòi xịt, phụ kiện inox.
- Vật liệu hoàn thiện: Gạch men, gạch ốp lát, keo dán gạch.
- Thiết bị phụ trợ: Máy bơm nước, bình nóng lạnh, thiết bị lọc nước.

Đặc thù của ngành hàng này khiến công tác quản lý và điều hành kinh doanh trở nên phức tạp hơn so với các cửa hàng bán lẻ thông thường.

### Những vấn đề thực tế

**1. Quản lý công nợ phức tạp**
Khách hàng thường xuyên bao gồm thợ điện nước, nhà thầu xây dựng và chủ công trình. Họ có thể lấy vật tư trước, thanh toán sau hoặc thanh toán theo từng giai đoạn thi công.
Việc theo dõi công nợ bằng sổ sách hoặc Excel khiến chủ cửa hàng khó kiểm soát hạn mức nợ, tuổi nợ và rủi ro chậm trả.

**2. Quản lý hàng hóa và tồn kho**
Cửa hàng có thể quản lý hàng nghìn mã sản phẩm, nhiều kích thước, thương hiệu và đơn vị tính quy đổi (dây điện theo cuộn 100m hoặc mét, gạch theo thùng hoặc m2, ống theo cây 4m hoặc mét, phụ kiện theo túi hoặc chiếc).

**3. Khó khăn trong việc tư vấn sản phẩm và bán hàng theo combo**
Khách hàng mua thiết bị vệ sinh (ví dụ: Lavabo trắng) thường cần tư vấn thêm các phụ kiện tương thích (vòi chậu, xi phông xả, dây cấp, van góc) và phối màu gạch men ốp lát ăn nhập.

**4. Thiếu công cụ phân tích và hỗ trợ ra quyết định**
Chủ cửa hàng thiếu trợ lý phân tích dữ liệu bán chạy, hàng tồn lâu ngày, gợi ý thời điểm và mặt hàng cần nhập, cũng như hỗ trợ soạn tin nhắn đòi nợ chuyên nghiệp.

---

# 2. PHÂN HỆ VÀ KIẾN TRÚC HỆ THỐNG

| Mã | Phân hệ | Chức năng chính |
|---|---|---|
| MOD-01 | Product Management | Quản lý sản phẩm, danh mục, thông số kỹ thuật, quy đổi đơn vị |
| MOD-02 | Sales Management | Quản lý bán hàng POS, khách hàng, quản lý đơn theo công trình |
| MOD-03 | Inventory Management | Quản lý kho, nhập xuất, vị trí lưu trữ, cảnh báo tồn kho |
| MOD-04 | Debt Management | Quản lý công nợ, phân tích tuổi nợ, AI hỗ trợ nhắc thu hồi nợ |
| MOD-05 | Financial Management | Quản lý quỹ tiền, thu chi, báo cáo dòng tiền |
| MOD-06 | AI Operations Assistant | Trợ lý AI chat, tool calling, phân tích kinh doanh |
| MOD-07 | Recommendation System | Gợi ý combo thiết bị vệ sinh, phối màu gạch men |
| MOD-08 | Store & Warehouse Placement | Quản lý vị trí trưng bày và sắp xếp kho hàng |

---

# 3. ĐẶC TẢ TÁC NHÂN & MA TRẬN CHỨC NĂNG (ACTOR & USE CASE SPECIFICATION)

## 3.1. Nhân viên (Staff)

Nhân viên là người trực tiếp tham gia vào các hoạt động vận hành thường nhật tại quầy thu ngân và kho hàng:

### A. Xác thực & Tài khoản (Authentication & Security)
1. **Log in:** Đăng nhập vào hệ thống bằng tài khoản email và mật khẩu được cấp.
2. **Log out:** Đăng xuất an toàn khỏi phiên làm việc.
3. **Request a password reset:** Gửi yêu cầu đặt lại mật khẩu đến Chủ cửa hàng khi quên mật khẩu.
4. **Change the password:** Tự thay đổi mật khẩu định kỳ của cá nhân.

### B. Quản lý Danh mục & Đối tác (Catalog & Partner Management)
5. **Manage products:** Tra cứu, xem chi tiết thuộc tính kỹ thuật (phi ống, màu sắc gạch men, thương hiệu).
6. **Manage product categories:** Tra cứu và phân loại sản phẩm theo danh mục đa cấp (Điện, Nước, TBVS, Gạch).
7. **Manage customers:** Quản lý thông tin thợ điện nước, nhà thầu công trình, lịch sử mua hàng và địa chỉ giao hàng.
8. **Manage suppliers:** Tra cứu thông tin liên hệ nhà cung ứng khi nhận hàng hoặc kiểm đếm.

### C. Vận hành Bán hàng & Thu ngân (Sales Operations & POS)
9. **Create retail sales orders:** Lập hóa đơn bán lẻ trực tiếp tại POS (hỗ trợ quét mã vạch Barcode/SKU, chọn đơn vị quy đổi).
10. **Credit sale at POS:** Thực hiện bán hàng ghi nợ đối với khách quen/nhà thầu đủ điều kiện hạn mức.
11. **Print receipts & dynamic VietQR:** Xuất hóa đơn in nhiệt (K80/K58) kèm mã VietQR thanh toán động tự sinh đúng số tiền.
12. **Create return orders:** Lập phiếu trả hàng khi khách đổi trả phụ kiện/vật tư thừa, hoàn tồn kho.
13. **View sales order history:** Tra cứu lịch sử các đơn hàng đã tạo trong ca làm việc.
14. **Perform shift close:** Chốt ca làm việc, kiểm đếm tiền mặt đầu/cuối ca và bàn giao tiền trong két.

### D. Vận hành Kho bãi (Inventory & Stock Operations)
15. **Manage inventory:** Tra cứu số lượng tồn kho khả dụng thời gian thực theo từng vị trí kệ.
16. **Create goods receipt notes:** Lập phiếu nhập kho từ nhà cung cấp (Draft / Chờ chủ duyệt).
17. **Create goods issue notes:** Lập phiếu xuất kho cho đơn công trình hoặc xuất điều chuyển nội bộ.
18. **Conduct stock audit:** Tham gia kiểm kê số lượng thực tế tại kho và ghi nhận chênh lệch thừa/thiếu.

### E. Dòng tiền & Sổ quỹ (Cashflow & Financial Records)
19. **Create cash receipt/payment vouchers:** Lập phiếu thu tiền (khách trả nợ, thu bán hàng) và phiếu chi tạm ứng trong ca.
20. **Manage receivables and payables:** Theo dõi chi tiết sổ nợ của thợ/nhà thầu để thu nợ khi họ đến lấy hàng.
21. **Manage financial ledgers:** Xem nhật ký thu chi phát sinh trong ca làm việc của mình.
22. **View personal/shift revenue reports:** Xem thống kê doanh số và số lượng đơn hàng hoàn thành trong ca trực.

---

## 3.2. Chủ cửa hàng (Store Owner)

Chủ cửa hàng nắm quyền quản trị tối cao, giám sát toàn diện hoạt động kinh doanh, tài chính, phê duyệt và sử dụng các công nghệ AI chiến lược:

### A. Quyền hạn Kế thừa (Inherited Rights)
1. **Access all Staff functions:** Toàn quyền truy cập và thực thi tất cả các nghiệp vụ của Nhân viên bán hàng và Thủ kho.

### B. Quản trị Phân quyền & Nhân sự (Access Control & Human Resources)
2. **Reset account passwords:** Trực tiếp phê duyệt yêu cầu đặt lại mật khẩu và cấp phát mật khẩu mới cho nhân viên.
3. **Configure accounts & RBAC:** Tạo mới, chỉnh sửa, khóa tài khoản nhân viên và thiết lập phân quyền truy cập.

### C. Phê duyệt & Kiểm soát Rủi ro (Approval Workflow & Audit)
4. **Approve requests:** Phê duyệt hoặc từ chối các phiếu nhập kho giá trị lớn, phiếu xuất kho đặc biệt và đơn hủy.
5. **View approval history:** Xem toàn bộ nhật ký phê duyệt (người yêu cầu, lý do phê duyệt/từ chối, thời gian).
6. **Cancel sales orders:** Hủy hóa đơn bán hàng sai sót (hệ thống tự động hoàn kho và gửi cảnh báo giám sát).
7. **View system logs & Audit trail:** Kiểm tra nhật ký hoạt động của toàn bộ hệ thống (ai đã sửa giá, xóa đơn, sửa tồn kho).

### D. Cấu hình Cửa hàng & Quy tắc Kinh doanh (Store Configuration & Business Rules)
8. **Configure store information:** Cài đặt thông tin cửa hàng (Tên, địa chỉ, hotline, tài khoản ngân hàng thụ hưởng VietQR).
9. **Configure product thresholds:** Thiết lập ngưỡng an toàn tồn kho (Min Stock) và định mức tồn tối đa cho từng nhóm hàng.
10. **Configure automated notifications:** Cấu hình thông báo tự động (Cảnh báo Telegram khi hủy đơn, cảnh báo hàng sắp hết).
11. **Configure display interface & Custom builder:** Tùy biến giao diện hiển thị, ẩn hiện cột dữ liệu và thiết kế form quản lý mới.

### E. Báo cáo Quản trị Nâng cao (Executive Analytics & Strategy)
12. **View comprehensive financial ledgers & P&L:** Xem sổ cái tài chính tổng thể, bảng cân đối thu chi, doanh thu và lợi nhuận gộp thực tế.
13. **View top-selling products & margin analytics:** Báo cáo mặt hàng bán chạy nhất (Top SKU) và cơ cấu tỷ suất lợi nhuận.
14. **Demand forecasting & Reorder planner:** Xem dự báo nhu cầu nhập hàng thông minh theo tốc độ bán và ngày an toàn tồn kho.

### F. Trợ lý Điều hành AI (AI Operations Assistant & Copilot)
15. **Use the AI assistant:** Tương tác với Trợ lý AI bằng ngôn ngữ tự nhiên tiếng Việt:
    - *Text-to-SQL / Query:* Tra cứu doanh thu, công nợ, tìm kiếm tồn kho theo thông số kỹ thuật.
    - *Text-to-Chart:* Tự động tổng hợp và trực quan hóa biểu đồ doanh thu theo yêu cầu.
    - *AI Debt Reminder:* Tự động sinh kịch bản tin nhắn nhắc nợ 3 cấp độ gửi qua Zalo/SMS theo độ thân thiết của khách hàng.
    - *AI Catalog / Inbound Draft:* Bán tự động đọc thông tin văn bản để sinh bảng sản phẩm hoặc phiếu nhập kho (Human-in-the-loop).
16. **Purchase additional services (SaaS Add-on):** Mua thêm dung lượng tính toán AI, nâng cấp gói dịch vụ hoặc tiện ích mở rộng.

---

# 4. BẢNG MA TRẬN PHÂN QUYỀN CHỨC NĂNG (RBAC MATRIX)

| Mã chức năng | Tên chức năng (English / Vietnamese) | Staff (Nhân viên) | Store Owner (Chủ cửa hàng) |
|---|---|:---:|:---:|
| **AUTH-01** | Log in / Đăng nhập | ✅ | ✅ |
| **AUTH-02** | Log out / Đăng xuất | ✅ | ✅ |
| **AUTH-03** | Request password reset / Yêu cầu đổi mật khẩu | ✅ | — |
| **AUTH-04** | Change password / Tự đổi mật khẩu | ✅ | ✅ |
| **AUTH-05** | Reset account passwords / Duyệt cấp lại mật khẩu | ❌ | ✅ |
| **AUTH-06** | Configure accounts & roles / Quản lý tài khoản | ❌ | ✅ |
| **CAT-01** | Manage products / Quản lý sản phẩm | ✅ (Tra cứu/Sửa) | ✅ (Toàn quyền) |
| **CAT-02** | Manage categories / Quản lý danh mục | ✅ | ✅ |
| **CAT-03** | Manage customers / Quản lý khách hàng | ✅ | ✅ |
| **CAT-04** | Manage suppliers / Quản lý nhà cung cấp | ✅ (Xem) | ✅ (Toàn quyền) |
| **CAT-05** | Unit conversion rules / Quy đổi đơn vị tính | ✅ (Áp dụng) | ✅ (Cấu hình) |
| **POS-01** | Create retail sales orders / Bán hàng POS | ✅ | ✅ |
| **POS-02** | Credit sale at POS / Bán hàng ghi nợ tại quầy | ✅ | ✅ |
| **POS-03** | Print thermal receipts & Dynamic QR / In hóa đơn | ✅ | ✅ |
| **POS-04** | Create return orders / Lập phiếu trả hàng | ✅ | ✅ |
| **POS-05** | Order history & Cancellation / Xem lịch sử & Hủy đơn | ✅ (Xem ca) | ✅ (Xem tất cả & Hủy) |
| **POS-06** | Shift close & Cash count / Chốt ca tiền mặt | ✅ | ✅ (Duyệt) |
| **INV-01** | Manage inventory & Locations / Quản lý tồn kho | ✅ | ✅ |
| **INV-02** | Goods receipt notes / Phiếu nhập kho | ✅ (Tạo/Gửi) | ✅ (Phê duyệt) |
| **INV-03** | Goods issue notes / Phiếu xuất kho | ✅ (Tạo/Xuất) | ✅ (Phê duyệt) |
| **INV-04** | Stock audit & Reconciliation / Kiểm kê kho | ✅ (Kiểm đếm) | ✅ (Cân bằng tồn) |
| **FIN-01** | Cash receipt/payment / Phiếu thu, chi tiền mặt | ✅ (Trong ca) | ✅ (Toàn hệ thống) |
| **FIN-02** | Manage receivables & payables / Quản lý công nợ | ✅ (Xem nợ khách) | ✅ (Toàn diện nợ khách/NCC) |
| **FIN-03** | Financial ledgers & P&L / Sổ cái & Lãi lỗ | ❌ | ✅ |
| **FIN-04** | Revenue reports / Báo cáo doanh thu | ✅ (Doanh số ca) | ✅ (Toàn diện) |
| **BI-01** | Top-selling & Margin analysis / Sản phẩm bán chạy | ❌ | ✅ |
| **BI-02** | Demand forecasting & Reorder planner / Dự báo nhập | ❌ | ✅ |
| **AI-01** | AI Natural Language Data Query / Trợ lý tra cứu | ❌ | ✅ |
| **AI-02** | AI Chart & Visualization / AI vẽ biểu đồ | ❌ | ✅ |
| **AI-03** | AI Debt Reminder Generator / Soạn tin đòi nợ AI | ❌ | ✅ |
| **AI-04** | AI Catalog & Inbound Draft / Tạo dự thảo bằng AI | ❌ | ✅ |
| **CFG-01** | Store info configuration / Cấu hình cửa hàng | ❌ | ✅ |
| **CFG-02** | Product thresholds / Cấu hình ngưỡng cảnh báo kho | ❌ | ✅ |
| **CFG-03** | Automated notifications / Cấu hình thông báo Telegram | ❌ | ✅ |
| **CFG-04** | Custom builder / Thiết kế giao diện quản lý | ❌ | ✅ |
| **CFG-05** | View system logs & Audit / Xem nhật ký hệ thống | ❌ | ✅ |
| **SAAS-01**| Purchase additional services / Mua thêm dịch vụ AI | ❌ | ✅ |


