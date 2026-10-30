# Bộ Prompt thiết kế giao diện cho Pet Store AI Operations Assistant

Dưới đây là bộ prompt **copy-paste được** để đưa vào các công cụ AI design (v0.dev, Lovable, Bolt.new, Figma AI, Claude Artifacts, Cursor…). Chia làm 4 tầng: **Design System → Screen Prompts → AI Assistant → Mobile**.

---

## 0. Nguyên tắc thiết kế tổng thể

| Trục | Quyết định |
|---|---|
| Đối tượng dùng | Chủ cửa hàng (desktop), nhân viên bán hàng (tablet/điện thoại) |
| Cảm xúc | Ấm áp, thân thiện, đáng tin — nhưng vẫn chuyên nghiệp ERP |
| Màu chủ đạo | Cam ấm `#F97316` + Teal `#14B8A6` (gợi pet, sạch sẽ) |
| Màu nền | Trắng ngà `#FFFBF5`, xám nhạt `#F8FAFC` |
| Font | Inter / Be Vietnam Pro (hỗ trợ tiếng Việt tốt) |
| Bo góc | 12–16px (mềm nhưng không trẻ con) |
| Mật độ | Data-dense cho ERP, airy cho POS |
| AI Assistant | Panel phải cố định trên desktop, floating button trên mobile |

---

## 1. Prompt Design System (dùng cho mọi màn hình)

```
Bạn là senior product designer chuyên thiết kế ERP cho hộ kinh doanh nhỏ.
Hãy tạo DESIGN SYSTEM cho dự án "Pet Store AI Operations Assistant" — hệ thống
quản lý cửa hàng thú cưng có AI Assistant hỗ trợ điều hành.

BỐI CẢNH:
- Người dùng 1: Chủ cửa hàng (40-55 tuổi, dùng desktop, cần báo cáo & quyết định)
- Người dùng 2: Nhân viên bán hàng/thu ngân (20-30 tuổi, dùng tablet/điện thoại, thao tác nhanh)
- Người dùng 3: Nhân viên grooming (dùng tablet, xem lịch hẹn)
- Sản phẩm: thức ăn, phụ kiện, thuốc bổ cho chó/mèo + dịch vụ grooming

PHONG CÁCH:
- Ấm áp, thân thiện, đáng tin — nhưng KHÔNG trẻ con
- Cảm hứng: Notion, Linear, Square POS, PetSmart back-office
- Nền sáng, card-based, nhiều khoảng trắng cho POS, data-dense cho quản lý

MÀU SẮC (bắt buộc dùng đúng):
- Primary: #F97316 (cam ấm) — CTA chính, logo, highlight
- Secondary: #14B8A6 (teal) — trạng thái tích cực, AI accent
- Background: #FFFBF5 (trắng ngà) cho page, #FFFFFF cho card
- Surface-muted: #F8FAFC cho bảng, input disabled
- Text-primary: #0F172A, text-secondary: #64748B, text-muted: #94A3B8
- Success: #22C55E, Warning: #F59E0B, Danger: #EF4444, Info: #3B82F6
- Border: #E2E8F0

TYPOGRAPHY:
- Font: Be Vietnam Pro hoặc Inter (hỗ trợ tiếng Việt)
- Heading 1: 28px semibold
- Heading 2: 20px semibold
- Body: 14px regular
- Caption: 12px
- Số liệu quan trọng (KPI, giá): 24-32px semibold, tabular-nums

LAYOUT:
- Desktop ≥1280px: Sidebar trái 240px + Main + AI Panel phải 360px (có thể thu gọn)
- Tablet 768-1279px: Sidebar thu gọn icon 72px + Main + AI floating button
- Mobile <768px: Bottom nav 5 tab + AI floating button

COMPONENT LIBRARY:
- Button: primary/secondary/ghost/danger, size sm/md/lg
- Card: radius 16px, border 1px #E2E8F0, shadow nhẹ
- Table: header sticky, zebra nhẹ, row hover cam nhạt #FFF7ED
- Badge trạng thái: dùng màu semantic, bo tròn full
- Input: radius 12px, focus ring cam
- Tabs, Breadcrumb, Pagination, Empty state, Skeleton loading
- Toast, Modal, Drawer, Command palette (Cmd+K)

ICON: Lucide hoặc Heroicons, stroke 1.5px

Hãy xuất ra:
1. Bảng token màu (CSS variables)
2. Bảng typography
3. Ảnh preview các component chính
4. Ảnh preview sidebar navigation
```

---

## 2. Prompt cho từng màn hình chính

### 2.1. Dashboard chủ cửa hàng

```
Thiết kế màn hình DASHBOARD cho chủ cửa hàng thú cưng, dùng design system ở trên.

LAYOUT:
- Sidebar trái: Logo "PetHouse" + menu: Dashboard, Bán hàng, Sản phẩm, Kho,
  Nhập hàng, Khách hàng, Thú cưng, Dịch vụ, Lịch hẹn, Tài chính, Báo cáo, Cài đặt
- Top bar: search Cmd+K, thông báo (badge), avatar, tên cửa hàng
- Main content: 4 hàng

HÀNG 1 — 4 KPI CARD:
- "Doanh thu hôm nay" 2.450.000đ, +12% vs hôm qua, sparkline xanh
- "Đơn hàng" 23 đơn, +3
- "Lịch hẹn grooming" 8 lịch, 3 sắp tới trong 2h (highlight cam)
- "Hàng cận hạn 30 ngày" 5 SKU (highlight đỏ nhạt)

HÀNG 2 — 2 CỘT:
- Trái (2/3): Biểu đồ doanh thu 7 ngày (bar chart, cam gradient)
- Phải (1/3): "Cảnh báo thông minh" — list 5 items có icon + badge:
  • "Royal Canin Mèo 2kg sắp hết (còn 3 bao)" — warning
  • "Whiskas Snack cận hạn 15 ngày (12 gói)" — danger
  • "Lịch hẹn 14:00 — Miu (tắm + cắt móng)" — info
  • "Doanh thu hôm qua thấp hơn TB 20%" — warning
  • "Khách Hoàng Văn Nam sắp hết thức ăn mèo" — info

HÀNG 3 — 2 CỘT:
- Trái: "Top 5 sản phẩm bán chạy 30 ngày" (bảng gọn)
- Phải: "Top 5 khách hàng thân thiết" (avatar + điểm loyalty)

HÀNG 4 — "Lịch hẹn hôm nay" timeline ngang:
- 09:00 Tắm mèo Miu — Groomer Phạm — confirmed
- 10:30 Tắm chó Bông — Groomer Phạm — in progress
- 14:00 Cắt tỉa toàn thân — pending

AI PANEL PHẢI (mở sẵn, 360px):
- Tiêu đề "Trợ lý PetHouse" + dot xanh online
- 3 gợi ý chip: "Hôm nay bán được bao nhiêu?", "Hàng nào sắp hết?",
  "Gợi ý nhập hàng tuần này"
- Ô input cuối + nút gửi cam

Trạng thái: dữ liệu thật, không placeholder lorem ipsum.
Responsive: nếu viewport <1280px thì AI panel thành floating button.
```

### 2.2. POS bán hàng

```
Thiết kế màn hình POS BÁN HÀNG cho nhân viên thu ngân, tối ưu cho tablet 1024x768
và desktop. Dùng design system PetHouse.

LAYOUT 3 CỘT:
- CỘT TRÁI (60%): Danh sách sản phẩm
  • Search bar lớn + nút scan barcode
  • Filter chips: "Tất cả", "Thức ăn khô", "Thức ăn ướt", "Snack",
    "Phụ kiện", "Vệ sinh"
  • Grid 4 cột card sản phẩm (ảnh, tên, giá, tồn kho nhỏ góc phải)
  • Card sản phẩm sắp hết: badge đỏ "Còn 3"
  • Card cận hạn: badge vàng "HSD 15/11"

- CỘT GIỮA (25%): Đơn hàng hiện tại
  • Chọn khách hàng (search + nút "Khách lẻ")
  • Chọn thú cưng (dropdown "Miu - Mèo - 4.2kg") — optional
  • List item: tên + số lượng +/− + giá + nút xóa
  • Ô "Thêm ghi chú"
  • Áp voucher (input + nút)

- CỘT PHẢI (15%): Thanh toán
  • Tạm tính / Giảm giá / Tổng cộng (số lớn, cam)
  • Phương thức: Tiền mặt / Chuyển khoản / Thẻ (icon buttons)
  • Nút "Thanh toán (F2)" to, cam, full width
  • Nút "In hóa đơn" secondary
  • Nút "Hủy đơn" ghost đỏ

INTERACTION:
- Click sản phẩm → thêm vào giỏ, toast "Đã thêm"
- Nhập số lượng trực tiếp được
- Phím tắt hiển thị nhỏ trên nút (F2 thanh toán, F3 tìm SP)
- Empty state: "Chưa có sản phẩm — chọn từ danh sách bên trái"

Màu: nền trắng, danh sách SP nền #F8FAFC, cột đơn hàng nền trắng, cột thanh toán
nền cam nhạt #FFF7ED để tách biệt.
```

### 2.3. Quản lý kho / tồn kho

```
Thiết kế màn hình QUẢN LÝ KHO cho cửa hàng thú cưng.

LAYOUT:
- Header: "Quản lý kho" + nút "Nhập kho" (cam) + "Xuất kho" (secondary) +
  "Điều chuyển" (ghost)
- Filter bar: Kho (dropdown), Danh mục, Trạng thái tồn, Trạng thái HSD
- 4 stat card nhỏ phía trên:
  • Tổng SKU: 245
  • Sắp hết (< min): 12 — vàng
  • Cận hạn 30 ngày: 8 — đỏ
  • Hết hàng: 3 — đỏ đậm

- Bảng tồn kho (data-dense):
  | Ảnh | SKU | Tên SP | Danh mục | Kho | Lô | HSD | Tồn | Min | Trạng thái | Hành động |
  
  Row có badge trạng thái:
  • "Đủ hàng" xanh
  • "Sắp hết" vàng
  • "Cận hạn" đỏ nhạt
  • "Hết hàng" đỏ đậm
  
  Hành động: icon Xem chi tiết, Điều chỉnh tồn

- Side drawer "Chi tiết lô" khi click row:
  • Thông tin SP (ảnh, tên, giá vốn, giá bán)
  • Lịch sử nhập/xuất theo lô (timeline)
  • Biểu đồ tồn kho 30 ngày
  • Nút "Điều chỉnh tồn" + "Tạo phiếu xuất"

- Footer: pagination + "Hiển thị 20/50/100 dòng"

Empty state: "Chưa có dữ liệu tồn kho — nhập kho lần đầu".
```

### 2.4. Hồ sơ thú cưng + lịch sử

```
Thiết kế màn hình HỒ SƠ THÚ CƯNG (Pets) cho cửa hàng thú cưng.

LAYOUT 2 CỘT:
- CỘT TRÁI (40%): Danh sách thú cưng
  • Search theo tên/loài/chủ
  • Filter: Loài (Chó/Mèo/Khác), Cân nặng, Sắp sinh nhật
  • Card list: avatar tròn + tên + loài/giống + tuổi + chủ sở hữu + badge
    "Có dị ứng" nếu có
  • Click card → load detail bên phải

- CỘT PHẢI (60%): Chi tiết thú cưng đang chọn
  • Header: ảnh lớn + tên "Miu" + loài "Mèo Anh lông ngắn" + badge "Active"
  • Thông tin grid 2 cột:
    Tuổi: 2 tuổi 7 tháng | Cân nặng: 4.2 kg
    Giới tính: Cái | Màu: Xám
    Dị ứng: Không | Chủ: Hoàng Văn Nam
  • 3 tab:
    [Lịch sử mua hàng] [Lịch sử grooming] [Ghi chú sức khỏe]
  
  Tab 1 — Lịch sử mua (bảng): ngày, SP, SL, giá
  Tab 2 — Grooming (timeline): 
    15/10/2024 — Tắm & sấy — Groomer Phạm — 120k
    20/09/2024 — Cắt móng — Groomer Phạm — 50k
  Tab 3 — Ghi chú sức khỏe (text area editable)

  • Nút action: "Đặt lịch grooming" (cam) + "Bán hàng cho Miu" (secondary)

- AI panel có thể trả lời: "Miu lần cuối tắm khi nào?", "Miu hay ăn loại nào?"

Trạng thái empty: "Chưa có thú cưng — thêm mới" với minh họa chú chó dễ thương.
```

### 2.5. Lịch hẹn grooming (dạng lịch tuần)

```
Thiết kế màn hình LỊCH HẸN GROOMING dạng tuần cho nhân viên grooming.

LAYOUT:
- Header: "Lịch hẹn" + week picker (< Tuần 21/10-27/10 >) + filter nhân viên
- Grid tuần 7 cột (T2-CN), giờ 08:00 → 20:00 (mỗi giờ 1 row)
- Cột nhân viên: nếu filter "Tất cả" thì hiển thị swimlane theo nhân viên
  (mỗi nhân viên 1 cột, giống Google Calendar)

CARD LỊCH HẸN:
- Nền theo trạng thái: confirmed xanh nhạt, pending vàng nhạt,
  in_progress cam nhạt, completed xám, cancelled đỏ nhạt gạch
- Nội dung: giờ + tên thú cưng + dịch vụ + chủ + giá
- Click → side drawer chi tiết:
  • Tên khách, thú cưng (loài, giống, cân nặng)
  • Danh sách dịch vụ (bảng nhỏ)
  • Tổng tiền
  • Ghi chú
  • Action: Xác nhận / Bắt đầu / Hoàn thành / Hủy
  • Nếu thú cưng có "dị ứng da" → banner vàng cảnh báo nổi bật

- Nút "Tạo lịch hẹn" (cam) góc phải trên
- Modal tạo lịch: chọn khách → chọn thú cưng → chọn dịch vụ → chọn giờ trống
  (dropdown giờ chỉ hiện slot trống)

Empty state: "Tuần này chưa có lịch hẹn".
```

### 2.6. Tài chính / Sổ quỹ

```
Thiết kế màn hình TÀI CHÍNH - SỔ QUỸ cho chủ cửa hàng.

LAYOUT:
- Header: "Tài chính" + date range picker (Hôm nay/Tuần/Tháng/Tùy chọn)
- 4 KPI card:
  • Tổng thu (xanh) — 45.200.000đ
  • Tổng chi (đỏ) — 28.500.000đ
  • Lợi nhuận (cam) — 16.700.000đ
  • Số dư quỹ (teal) — 55.000.000đ

- 2 tab chính: [Sổ quỹ] [Báo cáo]

TAB SỔ QUỸ:
- 2 card quỹ: "Tiền mặt" 5.000.000đ, "Vietcombank" 50.000.000đ
- Bảng giao dịch:
  | Mã | Ngày | Loại | Số tiền | Danh mục | Quỹ | Mô tả | Trạng thái |
  • Loại IN/OUT có icon mũi tên màu xanh/đỏ
  • Số tiền: IN màu xanh có dấu +, OUT màu đỏ có dấu -
  • Nút "Tạo phiếu thu" / "Tạo phiếu chi" (cam)

TAB BÁO CÁO:
- Biểu đồ tròn: cơ cấu doanh thu (Sản phẩm vs Dịch vụ)
- Biểu đồ đường: lợi nhuận 30 ngày
- Bảng: top chi phí (nhập hàng, lương, mặt bằng, khác)

- AI panel gợi ý: "Tháng này chi nhập hàng tăng 15% so với tháng trước,
  chủ yếu do nhập Royal Canin"
```

### 2.7. Nhập kho (phiếu nhập)

```
Thiết kế màn hình TẠO PHIẾU NHẬP KHO.

LAYOUT:
- Header: "Phiếu nhập kho #NK-2024-0152" + badge trạng thái "DRAFT"
- Form 2 cột:
  • Cột trái: Nhà cung cấp (search), Ngày nhập, Số hóa đơn, Ghi chú
  • Cột phải: Tổng tiền lớn, trạng thái duyệt

- Bảng sản phẩm nhập (có thể thêm/xóa dòng):
  | SP | Đơn vị | SL | Giá vốn | Lô | HSD | Thành tiền |
  • Dòng mới: nút "+ Thêm sản phẩm" hoặc scan barcode
  • Cột Lô & HSD: bắt buộc với thức ăn, có tooltip "Bắt buộc cho thức ăn"

- Footer sticky:
  • Tổng: 2.450.000đ (số lớn, cam)
  • Nút: "Lưu nháp" | "Trình duyệt" (cam) | "Hủy"

- Banner xanh đầu trang nếu AI tạo phiếu nháp:
  "Phiếu này được tạo bởi Trợ lý AI dựa trên 5 SKU sắp hết.
   Vui lòng kiểm tra trước khi duyệt."
```

---

## 3. Prompt riêng cho AI Assistant Panel

```
Thiết kế AI ASSISTANT PANEL — thành phần quan trọng nhất của dự án
"Pet Store AI Operations Assistant".

VỊ TRÍ:
- Desktop: panel cố định bên phải, 360px, có thể thu gọn thành icon
- Tablet/mobile: floating button góc phải dưới, click mở full screen drawer

PANEL HEADER:
- Avatar AI: icon robot nhỏ màu teal, dot xanh online
- Tên: "Trợ lý PetHouse"
- Sub: "Online • Trả lời trong 2s"
- Icon: thu gọn, lịch sử chat, tạo chat mới

KHU VỰC TIN NHẮN (scroll):
- Tin nhắn user: bong bóng cam nhạt bên phải, avatar user
- Tin nhắn AI: bong bóng trắng viền xám bên trái, avatar robot teal
- Tin nhắn AI kèm CARD kết quả:
  
  Ví dụ 1 — truy vấn doanh thu:
    AI trả lời: "Hôm nay cửa hàng bán được 2.450.000đ, tăng 12% so với hôm qua."
    Kèm mini bar chart 7 ngày + nút "Xem báo cáo đầy đủ"
  
  Ví dụ 2 — danh sách sản phẩm:
    AI: "Có 3 sản phẩm sắp hết hàng:"
    Kèm 3 card nhỏ: ảnh + tên + tồn + nút "Tạo phiếu nhập"
  
  Ví dụ 3 — gợi ý nhập hàng:
    AI: "Tuần này nên nhập thêm:"
    Kèm bảng 5 dòng: SP, SL gợi ý, lý do (bán chạy/sắp hết)
    Nút "Tạo phiếu nhập nháp" (cam) + "Sửa" (ghost)
  
  Ví dụ 4 — tạo phiếu nháp:
    AI: "Đã tạo phiếu nhập nháp #NK-0153 cho NCC PetFood VN gồm 5 SP,
        tổng 2.450.000đ. Bạn có muốn duyệt không?"
    Nút "Xem phiếu nháp" + "Duyệt luôn" (cam)
  
  Ví dụ 5 — chặn y tế (guardrail):
    User: "Mèo nhà em bị tiêu chảy nên cho ăn gì?"
    AI trả lời (nền vàng nhạt, icon ⚠️):
    "Tôi không thể tư vấn sản phẩm cho tình trạng sức khỏe cụ thể.
     Vui lòng tham khảo bác sĩ thú y.
     Tôi có thể giúp bạn tra cứu sản phẩm theo thuộc tính (ví dụ:
     'thức ăn dễ tiêu cho mèo trưởng thành')."
    Status: BLOCKED_MEDICAL_INTENT

  Ví dụ 6 — tra cứu thuộc tính (an toàn):
    User: "Sản phẩm nào grain-free cho mèo?"
    AI trả lời: "Có 2 sản phẩm grain-free cho mèo đang bán:"
    Card 2 SP + badge "Grain-free" + giá + tồn

GỢI Ý CHIP (dưới tin nhắn AI hoặc khi chat trống):
- "Hôm nay bán được bao nhiêu?"
- "Hàng nào sắp hết?"
- "Hàng nào cận hạn 30 ngày?"
- "Lịch hẹn hôm nay?"
- "Gợi ý nhập hàng tuần này"
- "Top khách thân thiết tháng này?"

INPUT AREA (sticky bottom):
- Textarea auto-resize
- Icon đính kèm (ảnh, file Excel) — optional
- Icon micro (voice) — optional
- Nút gửi cam tròn có icon mũi tên
- Dòng nhỏ dưới input: "AI có thể mắc lỗi. Kiểm tra thông tin quan trọng."

TRẠNG THÁI:
- Typing: 3 chấm nhảy "Trợ lý đang suy nghĩ..."
- Tool call đang chạy: "Đang truy vấn tồn kho..." + spinner
- Lỗi: bong bóng đỏ nhạt + nút "Thử lại"
- Cần xác nhận: banner vàng "Hành động này sẽ ghi dữ liệu.
  Xác nhận?" + nút "Xác nhận" / "Hủy"

LỊCH SỬ CHAT (drawer trượt từ trái panel):
- Search
- Group theo "Hôm nay", "Hôm qua", "Tuần trước"
- Mỗi item: title + preview + thời gian
- Nút "Chat mới" trên cùng

EMPTY STATE:
- Icon robot + "Xin chào! Tôi là trợ lý PetHouse. Tôi có thể giúp bạn:"
- 4 card gợi ý việc phổ biến
```

---

## 4. Prompt mobile variant

```
Thiết kế phiên bản MOBILE (375x812) cho nhân viên bán hàng/grooming,
dùng design system PetHouse.

NAVIGATION:
- Bottom nav 5 tab: Trang chủ, Bán hàng, Lịch hẹn, Kho, Thêm
- Top bar: logo + thông báo + avatar

MÀN HÌNH MOBILE 1 — Trang chủ nhân viên:
- 4 KPI card nhỏ 2x2: Doanh thu hôm nay, Đơn hàng, Lịch hẹn sắp tới,
  Hàng sắp hết
- "Lịch hẹn sắp tới" (list card)
- "Cảnh báo" (list gọn)
- Floating AI button góc phải dưới (icon robot cam + badge)

MÀN HÌNH MOBILE 2 — POS mobile:
- Search + scan barcode
- Grid 2 cột sản phẩm
- Bottom sheet "Giỏ hàng (3)" — kéo lên xem chi tiết + thanh toán
- Nút "Thanh toán" full width sticky bottom

MÀN HÌNH MOBILE 3 — Lịch hẹn ngày:
- Date picker ngang (7 ngày gần)
- List lịch hẹn theo giờ, card mỗi lịch
- Swipe để đổi trạng thái (xác nhận/hoàn thành)
- Nút "Tạo lịch" floating

MÀN HÌNH MOBILE 4 — AI chat full screen:
- Header có nút back
- Tin nhắn full width
- Input sticky bottom + gợi ý chip ngang

YÊU CẦU:
- Touch target ≥ 44px
- Font body tối thiểu 14px
- Không dùng hover-only interaction
```

---

## 5. Prompt bổ sung — Empty state & Loading

```
Thiết kế EMPTY STATE và LOADING SKELETON cho các màn hình chính
của PetHouse, phong cách thân thiện, có minh họa nhỏ.

EMPTY STATES:
1. Chưa có sản phẩm → minh họa hộp thức ăn + "Thêm sản phẩm đầu tiên"
2. Chưa có thú cưng → minh họa chó mèo dễ thương + "Thêm thú cưng"
3. Chưa có lịch hẹn → minh họa lịch + "Tạo lịch hẹn"
4. Không có kết quả tìm kiếm → icon kính lúp + "Thử từ khóa khác"
5. AI chat trống → robot + 4 gợi ý
6. Lỗi mạng → icon wifi + "Thử lại"

LOADING SKELETONS:
- Bảng: 5 dòng skeleton
- Card sản phẩm: ảnh xám + 2 dòng text xám
- KPI card: 2 dòng xám
- AI typing: 3 chấm nhảy

Nguyên tắc: skeleton dùng màu #E2E8F0, animation shimmer nhẹ.
```

---

## 6. Cách dùng bộ prompt này

| Bước | Việc làm |
|---|---|
| 1 | Đưa **Prompt 1 (Design System)** vào v0/Figma AI trước để có nền tảng |
| 2 | Đưa **Prompt 2.x** cho từng màn hình theo thứ tự ưu tiên |
| 3 | Đưa **Prompt 3 (AI Panel)** — đây là điểm nhấn đồ án, dành nhiều thời gian |
| 4 | Đưa **Prompt 4 (Mobile)** nếu cần demo tính di động |
| 5 | Đưa **Prompt 5 (Empty/Loading)** để có bộ UI hoàn chỉnh |

### Thứ tự ưu tiên thiết kế (theo giá trị đồ án)

1. **AI Assistant Panel** — linh hồn của đề tài.
2. **Dashboard** — ấn tượng đầu tiên khi bảo vệ.
3. **POS** — chứng minh nghiệp vụ bán hàng.
4. **Lịch hẹn grooming** — điểm khác biệt của pet store.
5. **Kho + Nhập kho** — chứng minh batch/expiry.
6. **Hồ sơ thú cưng** — cầu nối AI và nghiệp vụ.
7. **Tài chính** — phụ.
8. **Mobile** — bonus.

---

## 7. Lưu ý khi bảo vệ

Khi hội đồng hỏi “vì sao thiết kế như vậy?”, bạn có thể trả lời:

- **AI panel cố định bên phải:** vì chủ cửa hàng cần “copilot luôn bên cạnh”, không phải mở menu riêng.
- **Màu cam + teal:** cam tạo cảm giác ấm áp của pet store, teal tạo cảm giác sạch sẽ/y tế nhẹ.
- **Card sản phẩm có badge tồn/HSD ngay trên POS:** giúp nhân viên bán hàng thấy ngay hàng sắp hết/cận hạn để tư vấn.
- **AI có guardrail hiển thị rõ:** chứng minh hiểu biết pháp lý, không để AI tư vấn y tế.
- **Card kết quả AI có nút action:** AI không chỉ trả lời mà còn dẫn tới hành động (tạo phiếu nhập, xem báo cáo) — đúng tinh thần “Operations Assistant”.
