-- ====================================================================
-- MIGRATION SCHEMA CHO CỬA HÀNG ĐIỆN NƯỚC & THIẾT BỊ VỆ SINH (SRS V2.0)
-- ====================================================================

-- 1. Cập nhật ràng buộc kiểu sản phẩm ngành điện nước
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pet_type_check;

ALTER TABLE products ADD CONSTRAINT products_product_type_check 
CHECK (product_type IN (
    'ELECTRICAL',         -- Thiết bị điện (Dây cáp, công tắc, ổ cắm, aptomat, đèn led)
    'PLUMBING',           -- Ống nước & Phụ kiện (PVC, PPR, HDPE, van, co, lơ, tê)
    'SANITARY_WARE',      -- Thiết bị vệ sinh (Lavabo, bồn cầu, bồn tiểu, bồn tắm)
    'BATHROOM_FITTINGS',   -- Vòi chậu, sen tắm, củ sen, xả xi-phông, phụ kiện phòng tắm
    'TILES_FLOORING',     -- Gạch men ốp tường, gạch lát nền, keo dán gạch
    'HARDWARE_TOOLS',     -- Dụng cụ kim khí, máy khoan, ốc vít, keo dán, cao su non
    'WATER_HEATER_PUMP'   -- Máy bơm nước, bình nước nóng
));

-- 2. Bảng thông số kỹ thuật sản phẩm (Color, Material, Dimensions, Installation Type)
CREATE TABLE IF NOT EXISTS product_specifications (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50),
    material VARCHAR(100),
    dimensions VARCHAR(100),
    voltage_power VARCHAR(50),
    finish_style VARCHAR(50),
    installation_type VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng quy đổi đơn vị tính (Unit Conversions)
CREATE TABLE IF NOT EXISTS product_unit_conversions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    base_unit VARCHAR(50) NOT NULL,       -- Mét, Chiếc, m2
    packaging_unit VARCHAR(50) NOT NULL,  -- Cuộn 100m, Cây 4m, Thùng, Túi 50 cái
    conversion_rate NUMERIC(10,4) NOT NULL, -- 100, 4, 50, 1.44
    is_default_sales_unit BOOLEAN DEFAULT FALSE
);

-- 4. Bảng quản lý Công trình xây dựng (Customer Projects)
CREATE TABLE IF NOT EXISTS customer_projects (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    address TEXT,
    contractor_name VARCHAR(100),
    contractor_phone VARCHAR(20),
    start_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, SUSPENDED
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Sổ Công nợ đối tác (Partner / Contractor Debts)
CREATE TABLE IF NOT EXISTS partner_debts (
    id BIGSERIAL PRIMARY KEY,
    partner_type VARCHAR(50) NOT NULL,    -- 'CONTRACTOR', 'ELECTRICIAN_PLUMBER', 'HOMEOWNER', 'SUPPLIER'
    customer_id BIGINT REFERENCES customers(id),
    project_id BIGINT REFERENCES customer_projects(id),
    order_id BIGINT REFERENCES sale_orders(id),
    total_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    remaining_amount NUMERIC(15,2) NOT NULL,
    credit_limit NUMERIC(15,2) DEFAULT 20000000,
    due_date DATE NOT NULL,
    overdue_days INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, PARTIAL, OVERDUE, SETTLED, BAD_DEBT
    risk_level VARCHAR(20) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Nhật ký nhắc nợ bằng AI (Debt Reminders)
CREATE TABLE IF NOT EXISTS debt_reminders (
    id BIGSERIAL PRIMARY KEY,
    debt_id BIGINT REFERENCES partner_debts(id) ON DELETE CASCADE,
    reminder_level VARCHAR(50) NOT NULL, -- GENTLE, REMINDER, URGENT, FINAL_NOTICE
    channel VARCHAR(20) DEFAULT 'ZALO',  -- ZALO, SMS, PHONE
    ai_generated_message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, SENT, FAILED
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    response_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng Quy tắc Gợi ý Combo & Phối màu (Combo Recommendation Rules)
CREATE TABLE IF NOT EXISTS combo_recommendation_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    trigger_product_type VARCHAR(50) NOT NULL,
    trigger_color VARCHAR(50),
    recommended_product_id BIGINT REFERENCES products(id),
    recommended_role VARCHAR(50) NOT NULL, -- 'REQUIRED_ACCESSORY', 'MATCHING_COLOR_TILE', 'COMPLEMENTARY_HARDWARE'
    recommendation_reason TEXT,
    discount_pct NUMERIC(5,2) DEFAULT 5.0,
    priority_score INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
