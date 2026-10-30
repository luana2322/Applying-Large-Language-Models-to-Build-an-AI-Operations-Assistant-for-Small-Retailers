# Hệ thống Trợ lý AI Hỗ trợ Quản lý & Vận hành Cửa hàng Điện Nước, Thiết bị Vệ sinh
*(AI-Powered Operations Assistant for Hardware, Electrical, Plumbing & Sanitary Ware Retailers)*

> **Đồ án tốt nghiệp / Dự án ứng dụng:** Áp dụng Mô hình Ngôn ngữ Lớn (LLMs) vào Xây dựng Trợ lý Vận hành Thông minh cho Doanh nghiệp Bán lẻ Vừa và Nhỏ.

---

## 1. Giới thiệu dự án

Dự án tập trung giải quyết bài toán vận hành thực tế tại các cửa hàng kinh doanh **Vật tư Điện Nước, Thiết bị Vệ sinh (Lavabo, Bồn cầu, Sen vòi) và Gạch men hoàn thiện công trình** tại Việt Nam.

Khác với phần mềm bán lẻ truyền thống, hệ thống kết hợp **Cơ sở dữ liệu quan hệ (PostgreSQL)**, **Backend nghiệp vụ (Spring Boot 3)**, **Frontend hiện đại (React Vite + Tailwind CSS)** và **Lớp trí tuệ AI (FastAPI + LangChain / LLM Tool Calling)** nhằm tự động hóa và hỗ trợ ra quyết định:
1. **Quản lý công nợ công trình & AI nhắc nợ thông minh (Smart Debt Collection Assistant)**: Theo dõi nợ thợ điện nước, nhà thầu xây dựng theo từng công trình; phân tích tuổi nợ (aging debts) và sinh kịch bản nhắc nợ đa cấp độ gửi Zalo/SMS.
2. **Quản lý kho hàng & AI Cảnh báo nhập hàng (Smart Inventory & Restock Copilot)**: Quản lý thuộc tính kỹ thuật (phi ống nước, tiết diện dây cáp, màu sắc men sứ), đơn vị quy đổi (cuộn $\leftrightarrow$ mét, cây $\leftrightarrow$ mét, thùng $\leftrightarrow$ m²); tự động cảnh báo chạm ngưỡng an toàn và lập dự thảo đơn nhập hàng.
3. **Hệ thống Gợi ý Bán hàng & Phối ghép Combo (Sanitary Recommendation Engine)**:
   - *Tư vấn phối màu gạch men*: Lavabo trắng sứ phối cùng gạch men vân đá Calacatta White mờ (sang trọng), gạch Terrazzo xám hạt mịn (tối giản) hoặc gạch thẻ xanh ngọc lục bảo (điểm nhấn).
   - *Gợi ý trọn bộ phụ kiện tương thích*: Vòi thân cao đen mờ/chrome, bộ xả xi-phông nhấn nắp sứ trắng, cặp van góc Inox 304, keo silicone trung tính Apolo A500 chống mốc.
   - *Chiết khấu Combo*: Tự động áp dụng giảm giá 5% khi chốt trọn bộ đơn hàng tại POS.
4. **Trợ lý Điều hành AI (AI Operations Copilot)**: Phân tích doanh thu, hàng tồn lâu ngày, sức khỏe kinh doanh thông qua tương tác bằng tiếng Việt tự nhiên (không ảo giác dữ liệu tài chính).

---

## 2. Kiến trúc Hệ thống

```mermaid
graph TD
    subgraph Client [Frontend (Port 3000 / 5173)]
        UI_DASH[Dashboard Tổng quan & KPIs]
        UI_POS[POS Bán hàng & Gợi ý Combo]
        UI_REC[Gợi ý Phối Màu & Combo TBVS]
        UI_DEBT[Sổ Nợ Công Trình & AI Nhắc Nợ]
        UI_INV[Quản lý Kho & Quy đổi Đơn vị]
    end

    subgraph Backend [Backend Service (Port 8080)]
        API_GATEWAY[Spring Boot 3 REST API]
        SEC_AUTH[JWT Authentication & RBAC]
        MOD_CATALOG[Quản lý Sản phẩm & Đơn vị tính]
        MOD_DEBT[Quản lý Công nợ Đối tác]
        MOD_REC[Engine Gợi ý Phối màu & Phụ kiện]
        MOD_INV[Kho hàng & Nhập xuất]
    end

    subgraph AIService [AI Microservice (Port 8000)]
        ORCHESTRATOR[FastAPI + LangChain Agent]
        TOOL_DEBT[Debt Collection Tool]
        TOOL_RESTOCK[Restock Advisor Tool]
        TOOL_REC[Sanitary Combo Recommender]
    end

    subgraph DB [Database (Port 5432)]
        POSTGRES[(PostgreSQL 15)]
    end

    Client -->|Reverse Proxy / HTTP| API_GATEWAY
    API_GATEWAY -->|Internal RPC / REST| ORCHESTRATOR
    API_GATEWAY -->|JPA / Hibernate / JDBC| POSTGRES
    ORCHESTRATOR -->|Tool Calling| API_GATEWAY
```

---

## 3. Cấu trúc Thư mục

```text
├── ai-service/             # AI Microservice (FastAPI + LangChain + Python 3.11)
│   ├── app/
│   │   ├── agent/          # Orchestrator & Logic Agent điều phối
│   │   ├── tools/          # Công cụ nghiệp vụ (sanitary_recommend_tools, debt_advisor_tools)
│   │   └── main.py         # Điểm khởi chạy FastAPI Uvicorn
│   └── Dockerfile
├── backend/                # Backend Core (Spring Boot 3.3.4 + Java 21)
│   ├── src/main/java/com/retail/assistant/
│   │   ├── controller/
│   │   │   ├── recommend/  # RecommendationController (Gợi ý Combo Lavabo & Gạch)
│   │   │   ├── debt/       # ContractorDebtController (Sổ nợ & AI nhắc nợ)
│   │   │   ├── catalog/    # Quản lý Sản phẩm, Thông số kỹ thuật
│   │   │   └── system/     # Dashboard, Kho hàng, Thu chi
│   │   ├── domain/         # Entities JPA & Repositories
│   └── src/main/resources/db/
│       ├── migration_dien_nuoc.sql # Schema nâng cấp ngành điện nước
│       └── seed_dien_nuoc_data.sql # Bộ dữ liệu mẫu thực tế
├── frontend/               # Frontend Single Page App (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── features/
│   │   │   ├── recommendations/ # Giao diện Phối màu & Gợi ý Combo TBVS
│   │   │   ├── cashflow/        # Quản lý Dòng tiền & Sổ nợ
│   │   │   ├── product-management/ # Quản lý Sản phẩm Điện Nước
│   │   │   └── orders/          # Bán hàng POS
│   │   └── components/     # UI Components, Layout, Sidebar
│   └── nginx.conf          # Nginx reverse proxy sang Backend & AI-Service
├── docs/                   # Tài liệu đặc tả kỹ thuật
│   └── SRS_DIEN_NUOC_V2.md # Software Requirements Specification v2.0
├── docker-compose.yml      # Cấu hình triển khai toàn bộ cụm dịch vụ
└── README.md
```

---

## 4. Hướng dẫn Khởi chạy Hệ thống

### 4.1. Yêu cầu Môi trường
- **Docker** & **Docker Compose** (bản 20.10+).
- *Tùy chọn nếu chạy local không qua Docker*: Java 21 JDK, Maven 3.9+, Node.js 20+, Python 3.11+.

### 4.2. Khởi động bằng Docker Compose (Khuyến nghị)
Chỉ cần thực hiện lệnh sau tại thư mục gốc của dự án:

```bash
docker compose up -d --build
```

Docker Compose sẽ tự động biên dịch và khởi chạy 4 container:
1. `retail-postgres`: Cơ sở dữ liệu PostgreSQL 15 (Port `5432`).
2. `retail-backend`: Dịch vụ Core Spring Boot (Port `8080`).
3. `retail-ai-service`: Trợ lý AI Python FastAPI (Port `8000`).
4. `retail-frontend`: Giao diện React phục vụ qua Nginx (Port `3000` & `5173`).

---

## 5. Tài khoản & Địa chỉ Truy cập

| Dịch vụ | Địa chỉ URL | Ghi chú |
|---|---|---|
| **Giao diện Ứng dụng (Web App)** | [http://localhost:3000](http://localhost:3000) | Giao diện điều hành bán hàng & kho |
| **Backend REST API** | [http://localhost:8080](http://localhost:8080) | API Core Spring Boot |
| **AI Service API (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Tài liệu OpenAPI AI Agent |

### Thông tin Đăng nhập Mặc định
- **Tài khoản**: `admin@smartinventory.vn`
- **Mật khẩu**: `Admin@123`
*(Hệ thống đã cấu hình phân quyền Admin toàn quyền truy cập tất cả phân hệ).*

---

## 6. Các Tính Năng Nổi Bật & Kịch Bản Kiểm Thử

### 6.1. Gợi ý Combo Thiết bị Vệ sinh & Phối Màu Gạch Men (Recommend System)
- **Truy cập**: Menu bên trái $\rightarrow$ **"Tư Vấn & Combo TBVS"** $\rightarrow$ **"Gợi ý Phối Màu & Combo"** (hoặc truy cập trực tiếp `/recommendations`).
- **Nghiệp vụ**:
  - Chọn sản phẩm chủ đạo: **Chậu Lavabo sứ đặt bàn INAX AL-299V (Trắng tuyết)**.
  - Hệ thống tự động kích hoạt luật gợi ý:
    - *Tư vấn phối màu gạch men*: Đề xuất gạch Calacatta White 30x60 mờ, gạch Terrazzo xám hạt mịn hoặc gạch thẻ xanh ngọc lục bảo (Emerald Green) kèm lý do thiết kế thẩm mỹ.
    - *Gợi ý phụ kiện bắt buộc*: Vòi nóng lạnh cổ cao 30cm đen mờ (cho chậu đặt bàn), xi-phông nhấn nắp sứ trắng đồng bộ, cặp van góc inox 304, keo silicone Apolo A500 chống mốc.
    - *Ưu đãi*: Chiết khấu ngay **5%** khi chọn mua trọn gói Combo.
    - Bấm nút **"Áp dụng Combo vào Đơn hàng"** để chuyển dữ liệu sang hóa đơn bán hàng.

### 6.2. Quản lý Công Nợ Thợ/Nhà Thầu & AI Nhắc Nợ
- **Truy cập**: Menu **"Dòng tiền"** $\rightarrow$ **"Công nợ"** (hoặc `/cashflow/debts`).
- **Nghiệp vụ**:
  - Báo cáo phân loại tuổi nợ (Debt Aging): Nợ chưa đến hạn, quá hạn 8-15 ngày, quá hạn trên 30 ngày.
  - Theo dõi công nợ theo công trình: *Biệt thự Gamuda Garden*, *Nhà phố Nam Cường*.
  - **AI Nhắc nợ thông minh**: Tạo tin nhắn nhắc nợ tùy biến theo 3 cấp độ (Nhẹ nhàng nhắc tiến độ $\rightarrow$ Nhắc đợt quyết toán $\rightarrow$ Thông báo tạm dừng cấp hàng) để gửi Zalo cho khách hàng.

### 6.3. Quản lý Kho Hàng & Quy đổi Đơn vị Tính
- **Truy cập**: Menu **"Tồn kho"** (hoặc `/inventory`).
- **Nghiệp vụ**:
  - Theo dõi 19 mã sản phẩm điện nước thực tế (dây điện Cadivi, ống nhựa Tiền Phong, bồn cầu Viglacera, keo silicone Apolo...).
  - Thiết lập định mức tồn kho tối thiểu, cảnh báo thiếu hàng (`isLowStock`) và đề xuất nhập hàng tự động.
  - Hỗ trợ đơn vị quy đổi: Cuộn 100m sang mét, Cây 4m sang mét, Thùng sang m².

---

## 7. Tài liệu Tham khảo

- [Tài liệu Đặc tả Yêu cầu Phần mềm (SRS v2.0)](docs/SRS_DIEN_NUOC_V2.md)
- [Đặc tả Kỹ thuật & Lộ trình Triển khai (Technical Specification & Roadmap)](file:///Users/luana/.gemini/antigravity/brain/61fabcd3-31a8-4c04-a0e3-ac9d1178fc32/DIEN_NUOC_SPECIFICATION_AND_ROADMAP.md)
