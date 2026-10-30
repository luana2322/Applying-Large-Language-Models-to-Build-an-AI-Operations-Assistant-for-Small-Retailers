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

