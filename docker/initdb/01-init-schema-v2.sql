-- ============================================================
-- DATABASE OPTIMIZATION SCRIPT
-- Hệ thống: Retail ERP & POS
-- Version: 2.0 (Optimized)
-- ============================================================

-- Bật extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Cho tìm kiếm text nhanh

-- ============================================================
-- PHẦN A: XÓA CÁC BẢNG CŨ (nếu chạy lại từ đầu)
-- ============================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS order_payments CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS cash_transactions CASCADE;
DROP TABLE IF EXISTS finance_ledger CASCADE;
DROP TABLE IF EXISTS cash_funds CASCADE;
DROP TABLE IF EXISTS inventory_log CASCADE;
DROP TABLE IF EXISTS stock_dispatch_lines CASCADE;
DROP TABLE IF EXISTS stock_dispatches CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS vouchers_redemptions CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS order_detail CASCADE;
DROP TABLE IF EXISTS sale_orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS stock_receipt_detail CASCADE;
DROP TABLE IF EXISTS stock_receipts CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS product_price_history CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_units CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS staff_password_reset_request CASCADE;
DROP TABLE IF EXISTS user_table_column_settings CASCADE;
DROP TABLE IF EXISTS alert_setting CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS store_profile CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================
-- PHẦN B: NHÓM HỆ THỐNG & NGƯỜI DÙNG
-- ============================================================

-- 1. Bảng roles
CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255),
    permission      JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system       BOOLEAN DEFAULT FALSE, -- Vai trò hệ thống không được xóa
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- 2. Bảng users
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20),
    role_id         INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','LOCKED','PENDING')),
    last_login      TIMESTAMP,
    staff_code      VARCHAR(50) UNIQUE,
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- 3. Bảng store_profile
CREATE TABLE store_profile (
    id                  SERIAL PRIMARY KEY,
    owner_id            INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name                VARCHAR(255) NOT NULL,
    business_category   VARCHAR(255),
    address             TEXT,
    phone               VARCHAR(30),
    email               VARCHAR(255),
    website             VARCHAR(500),
    tax_code            VARCHAR(50),
    logo_url            VARCHAR(500),
    currency            VARCHAR(10) DEFAULT 'VND',
    timezone            VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_store_profile_owner ON store_profile(owner_id);

-- 4. Bảng refresh_tokens
CREATE TABLE refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    user_agent  VARCHAR(500),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP  -- Sửa từ delete_ymd
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- 5. Bảng notifications
CREATE TABLE notifications (
    id                  SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type   VARCHAR(30) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    reference_type      VARCHAR(50),
    reference_id        INT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at             TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 6. Bảng system_logs
CREATE TABLE system_logs (
    id              BIGSERIAL PRIMARY KEY,
    log_level       VARCHAR(20) NOT NULL
                    CHECK (log_level IN ('DEBUG','INFO','WARN','ERROR','FATAL')),
    module          VARCHAR(100),
    action          VARCHAR(255),
    user_id         INT REFERENCES users(id) ON DELETE SET NULL,
    message         TEXT,
    stack_trace     TEXT,
    context_data    JSONB DEFAULT '{}'::jsonb,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_created ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_context ON system_logs USING GIN (context_data);

-- 7. Bảng alert_setting
CREATE TABLE alert_setting (
    id                  SERIAL PRIMARY KEY,
    owner_id            INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type          VARCHAR(30) NOT NULL,
    threshold_value     DECIMAL(10,2),
    channel             VARCHAR(20) CHECK (channel IN ('EMAIL','SMS','PUSH','IN_APP')),
    frequency           VARCHAR(20) CHECK (frequency IN ('INSTANT','DAILY','WEEKLY')),
    is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    recipients          JSONB DEFAULT '[]'::jsonb,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_setting_owner ON alert_setting(owner_id);

-- 8. Bảng user_table_column_settings
CREATE TABLE user_table_column_settings (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_key       VARCHAR(80) NOT NULL,
    hidden_columns  JSONB DEFAULT '[]'::jsonb,
    column_order    JSONB DEFAULT '[]'::jsonb,
    updated_by      BIGINT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, table_key)
);

CREATE INDEX idx_user_table_settings_user ON user_table_column_settings(user_id);

-- 9. Bảng staff_password_reset_request (SỬA LỖI use_id -> user_id)
CREATE TABLE staff_password_reset_request (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
    processed_by    INT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMP
);

CREATE INDEX idx_pwd_reset_user ON staff_password_reset_request(user_id);
CREATE INDEX idx_pwd_reset_status ON staff_password_reset_request(status);

-- ============================================================
-- PHẦN C: NHÓM SẢN PHẨM & DANH MỤC
-- ============================================================

-- 10. Bảng categories
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    category_code   VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    parent_id       INT REFERENCES categories(id) ON DELETE SET NULL,
    sort_order      INT DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_name_trgm ON categories USING GIN (name gin_trgm_ops);

-- 11. Bảng products
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
    sku_code        VARCHAR(50) NOT NULL UNIQUE,
    barcode         VARCHAR(100) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    image_url       VARCHAR(500),
    description     TEXT,
    weight          DECIMAL(10,4) DEFAULT 0,  -- Tăng độ chính xác
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','DISCONTINUED')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku_code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- 12. Bảng product_units
CREATE TABLE product_units (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name       VARCHAR(50) NOT NULL,
    conversion_rate DECIMAL(12,4) NOT NULL DEFAULT 1,
    is_base_unit    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, unit_name)
);

CREATE INDEX idx_product_units_product ON product_units(product_id);

-- 13. Bảng product_images
CREATE TABLE product_images (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(500),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT DEFAULT 0,
    file_size_bytes INT,
    mime_type       VARCHAR(100),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE UNIQUE INDEX idx_product_images_primary ON product_images(product_id)
    WHERE is_primary = TRUE;

-- 14. Bảng product_price_history
CREATE TABLE product_price_history (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cost_price      DECIMAL(15,2) NOT NULL DEFAULT 0,
    sale_price      DECIMAL(15,2) NOT NULL DEFAULT 0,
    effective_date  DATE NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON product_price_history(product_id);
CREATE INDEX idx_price_history_effective ON product_price_history(effective_date DESC);

-- ============================================================
-- PHẦN D: NHÓM NHÀ CUNG CẤP & NHẬP KHO
-- ============================================================

-- 15. Bảng suppliers
CREATE TABLE suppliers (
    id              SERIAL PRIMARY KEY,
    supplier_code   VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    addr            TEXT,
    tax_code        VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','BLOCKED')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_name_trgm ON suppliers USING GIN (name gin_trgm_ops);

-- 16. Bảng stock_receipts
CREATE TABLE stock_receipts (
    id              SERIAL PRIMARY KEY,
    receipt_code    VARCHAR(50) NOT NULL UNIQUE,
    supplier_id     INT REFERENCES suppliers(id) ON DELETE RESTRICT,
    staff_id        INT REFERENCES users(id) ON DELETE SET NULL,
    receipt_date    DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','PENDING','APPROVED','REJECTED','CANCELLED')),
    invoice_number  VARCHAR(100),
    total_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    approved_by     INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_receipts_supplier ON stock_receipts(supplier_id);
CREATE INDEX idx_stock_receipts_status ON stock_receipts(status);
CREATE INDEX idx_stock_receipts_date ON stock_receipts(receipt_date DESC);

-- 17. Bảng stock_receipt_detail
CREATE TABLE stock_receipt_detail (
    id              SERIAL PRIMARY KEY,
    receipt_id      INT NOT NULL REFERENCES stock_receipts(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id         INT REFERENCES product_units(id) ON DELETE SET NULL,
    quantity        DECIMAL(15,4) NOT NULL CHECK (quantity > 0),
    cost_price      DECIMAL(15,2) NOT NULL CHECK (cost_price >= 0),
    batch_number    VARCHAR(100),
    expiry_date     DATE,
    line_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipt_detail_receipt ON stock_receipt_detail(receipt_id);
CREATE INDEX idx_receipt_detail_product ON stock_receipt_detail(product_id);
CREATE INDEX idx_receipt_detail_batch ON stock_receipt_detail(batch_number);
CREATE INDEX idx_receipt_detail_expiry ON stock_receipt_detail(expiry_date);

-- ============================================================
-- PHẦN E: NHÓM KHO VẬN (thêm bảng locations)
-- ============================================================

-- 18. Bảng locations (BỔ SUNG - trước đây bị thiếu)
CREATE TABLE locations (
    id              SERIAL PRIMARY KEY,
    location_code   VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    type            VARCHAR(20) DEFAULT 'WAREHOUSE'
                    CHECK (type IN ('WAREHOUSE','STORE','TRANSIT','RETURN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_type ON locations(type);

-- 19. Bảng inventory
CREATE TABLE inventory (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id     INT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    batch_number    VARCHAR(100) NOT NULL DEFAULT 'DEFAULT',
    expiry_date     DATE,
    quantity        DECIMAL(15,4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_quantity    DECIMAL(15,4) NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, location_id, batch_number)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity, min_quantity)
    WHERE quantity <= min_quantity;

-- 20. Bảng stock_dispatches
CREATE TABLE stock_dispatches (
    id              SERIAL PRIMARY KEY,
    dispatch_code   VARCHAR(50) NOT NULL UNIQUE,
    order_id        INT, -- Tham chiếu sale_orders(id), được gắn foreign key sau khi tạo bảng sale_orders
    user_id         INT REFERENCES users(id) ON DELETE SET NULL,
    location_id     INT REFERENCES locations(id) ON DELETE RESTRICT,
    dispatch_date   DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','PENDING','SHIPPED','DELIVERED','CANCELLED')),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispatches_order ON stock_dispatches(order_id);
CREATE INDEX idx_dispatches_status ON stock_dispatches(status);
CREATE INDEX idx_dispatches_date ON stock_dispatches(dispatch_date DESC);

-- 21. Bảng stock_dispatch_lines (SỬA LỖI quality -> quantity)
CREATE TABLE stock_dispatch_lines (
    id                  SERIAL PRIMARY KEY,
    dispatch_id         INT NOT NULL REFERENCES stock_dispatches(id) ON DELETE CASCADE,
    product_id          INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    inventory_id        INT REFERENCES inventory(id) ON DELETE SET NULL,
    quantity            DECIMAL(15,4) NOT NULL CHECK (quantity > 0),  -- Sửa từ quality
    unit_price_snapshot NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispatch_lines_dispatch ON stock_dispatch_lines(dispatch_id);
CREATE INDEX idx_dispatch_lines_product ON stock_dispatch_lines(product_id);
CREATE INDEX idx_dispatch_lines_inventory ON stock_dispatch_lines(inventory_id);

-- 22. Bảng inventory_log
CREATE TABLE inventory_log (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    action_type         VARCHAR(20) NOT NULL
                        CHECK (action_type IN ('IN','OUT','ADJUST','TRANSFER','RETURN')),
    quantity_change     DECIMAL(15,4) NOT NULL,
    unit_id             INT REFERENCES product_units(id) ON DELETE SET NULL,
    user_id             INT REFERENCES users(id) ON DELETE SET NULL,
    dispatch_id         INT REFERENCES stock_dispatches(id) ON DELETE SET NULL,
    receipt_id          INT REFERENCES stock_receipts(id) ON DELETE SET NULL,
    from_location_id    INT REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id      INT REFERENCES locations(id) ON DELETE SET NULL,
    reference_note      VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_log_product ON inventory_log(product_id);
CREATE INDEX idx_inv_log_action ON inventory_log(action_type);
CREATE INDEX idx_inv_log_created ON inventory_log(created_at DESC);

-- ============================================================
-- PHẦN F: NHÓM KHÁCH HÀNG & BÁN HÀNG
-- ============================================================

-- 23. Bảng customers
CREATE TABLE customers (
    id              SERIAL PRIMARY KEY,
    customer_code   VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    addr            TEXT,
    loyalty_points  INT NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    total_spent     DECIMAL(15,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','BLOCKED')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_name_trgm ON customers USING GIN (name gin_trgm_ops);

-- 24. Bảng sale_orders
CREATE TABLE sale_orders (
    id                  SERIAL PRIMARY KEY,
    order_code          VARCHAR(50) NOT NULL UNIQUE,
    customer_id         INT REFERENCES customers(id) ON DELETE SET NULL,
    user_id             INT REFERENCES users(id) ON DELETE SET NULL,
    total_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    final_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(15,2) NOT NULL DEFAULT 0,  -- Bổ sung
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED','RETURNED')),
    parent_order_id     INT REFERENCES sale_orders(id) ON DELETE SET NULL,
    shipping_address    TEXT,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    cancelled_at        TIMESTAMP,
    cancelled_by        INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sale_orders_customer ON sale_orders(customer_id);
CREATE INDEX idx_sale_orders_user ON sale_orders(user_id);
CREATE INDEX idx_sale_orders_status ON sale_orders(status);
CREATE INDEX idx_sale_orders_created ON sale_orders(created_at DESC);
CREATE INDEX idx_sale_orders_code ON sale_orders(order_code);

-- Khóa ngoại từ stock_dispatches sang sale_orders
ALTER TABLE stock_dispatches
    ADD CONSTRAINT fk_stock_dispatches_order
    FOREIGN KEY (order_id) REFERENCES sale_orders(id) ON DELETE SET NULL;

-- 25. Bảng order_detail
CREATE TABLE order_detail (
    id              SERIAL PRIMARY KEY,
    order_id        INT NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id         INT REFERENCES product_units(id) ON DELETE SET NULL,
    quantity        DECIMAL(15,4) NOT NULL CHECK (quantity > 0),
    price_at_time   DECIMAL(15,2) NOT NULL CHECK (price_at_time >= 0),
    line_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    dispatched_qty  DECIMAL(15,4) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_detail_order ON order_detail(order_id);
CREATE INDEX idx_order_detail_product ON order_detail(product_id);

-- 26. Bảng vouchers
CREATE TABLE vouchers (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    discount_type   VARCHAR(20) NOT NULL
                    CHECK (discount_type IN ('PERCENT','FIXED')),
    discount_value  NUMERIC(15,2) NOT NULL CHECK (discount_value >= 0),
    max_discount    NUMERIC(15,2),
    min_order_value NUMERIC(15,2) DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from      DATE NOT NULL,
    valid_to        DATE NOT NULL,
    used_count      INT NOT NULL DEFAULT 0,
    max_uses        INT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (valid_to >= valid_from)
);

CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active, valid_from, valid_to);

-- 27. Bảng vouchers_redemptions
CREATE TABLE vouchers_redemptions (
    id              SERIAL PRIMARY KEY,
    voucher_id      INT NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    sales_order_id  INT NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
    discount_used   DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (voucher_id, sales_order_id)
);

CREATE INDEX idx_voucher_redemptions_voucher ON vouchers_redemptions(voucher_id);
CREATE INDEX idx_voucher_redemptions_order ON vouchers_redemptions(sales_order_id);

-- ============================================================
-- PHẦN G: NHÓM TÀI CHÍNH (bổ sung order_payments)
-- ============================================================

-- 28. Bảng order_payments (BỔ SUNG - ghi nhận thanh toán)
CREATE TABLE order_payments (
    id              SERIAL PRIMARY KEY,
    order_id        INT NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
    payment_code    VARCHAR(50) NOT NULL UNIQUE,
    method          VARCHAR(30) NOT NULL
                    CHECK (method IN ('CASH','BANK_TRANSFER','CARD','E_WALLET','COD')),
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_ref VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    paid_at         TIMESTAMP,
    notes           TEXT,
    created_by      INT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_payments_order ON order_payments(order_id);
CREATE INDEX idx_order_payments_status ON order_payments(status);
CREATE INDEX idx_order_payments_method ON order_payments(method);

-- 29. Bảng cash_funds
CREATE TABLE cash_funds (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    fund_type       VARCHAR(20) DEFAULT 'CASH'
                    CHECK (fund_type IN ('CASH','BANK','E_WALLET')),
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_funds_active ON cash_funds(is_active);

-- 30. Bảng finance_ledger
CREATE TABLE finance_ledger (
    id                  SERIAL PRIMARY KEY,
    ledger_code         VARCHAR(50) UNIQUE,
    transaction_date    DATE NOT NULL,
    transaction_type    VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN ('INCOME','EXPENSE','TRANSFER','ADJUSTMENT')),
    reference_type      VARCHAR(30)
                        CHECK (reference_type IN ('ORDER','RECEIPT','DISPATCH','PAYMENT','MANUAL','OTHER')),
    reference_id        INT,
    amount              DECIMAL(15,2) NOT NULL CHECK (amount != 0),
    description         TEXT,
    created_by          INT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_finance_ledger_date ON finance_ledger(transaction_date DESC);
CREATE INDEX idx_finance_ledger_type ON finance_ledger(transaction_type);
CREATE INDEX idx_finance_ledger_ref ON finance_ledger(reference_type, reference_id);

-- 31. Bảng cash_transactions
CREATE TABLE cash_transactions (
    id                  SERIAL PRIMARY KEY,
    transaction_code    VARCHAR(50) NOT NULL UNIQUE,
    fund_id             INT REFERENCES cash_funds(id) ON DELETE RESTRICT,
    direction           VARCHAR(10) NOT NULL CHECK (direction IN ('IN','OUT')),
    amount              DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    category            VARCHAR(255),
    description         TEXT,
    payment_method      VARCHAR(30),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','COMPLETED','CANCELLED')),
    transaction_date    DATE NOT NULL,
    finance_ledger_id   INT REFERENCES finance_ledger(id) ON DELETE SET NULL,
    created_by          INT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_tx_fund ON cash_transactions(fund_id);
CREATE INDEX idx_cash_tx_date ON cash_transactions(transaction_date DESC);
CREATE INDEX idx_cash_tx_status ON cash_transactions(status);

-- ============================================================
-- PHẦN H: BẢNG AUDIT LOG (BỔ SUNG - Audit Trail chung)
-- ============================================================

-- 32. Bảng audit_logs
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    table_name      VARCHAR(100) NOT NULL,
    record_id       BIGINT NOT NULL,
    action          VARCHAR(10) NOT NULL
                    CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_data        JSONB,
    new_data        JSONB,
    changed_by      INT REFERENCES users(id) ON DELETE SET NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_time ON audit_logs(changed_at DESC);

-- ============================================================
-- PHẦN I: TRIGGERS TỰ ĐỘNG CẬP NHẬT updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho tất cả các bảng có updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
        ', t, t);
    END LOOP;
END $$;

-- ============================================================
-- PHẦN J: TRIGGERS TỰ ĐỘNG CẬP NHẬT TỒN KHO
-- ============================================================

-- Trigger: Sau khi nhập kho -> cộng tồn kho
CREATE OR REPLACE FUNCTION fn_after_receipt_detail_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO inventory (product_id, location_id, batch_number, expiry_date, quantity)
    VALUES (
        NEW.product_id,
        1, -- Mặc định kho chính, có thể sửa để lấy từ receipt
        COALESCE(NEW.batch_number, 'DEFAULT'),
        NEW.expiry_date,
        NEW.quantity
    )
    ON CONFLICT (product_id, location_id, batch_number)
    DO UPDATE SET
        quantity = inventory.quantity + EXCLUDED.quantity,
        expiry_date = COALESCE(EXCLUDED.expiry_date, inventory.expiry_date),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_receipt_detail
AFTER INSERT ON stock_receipt_detail
FOR EACH ROW EXECUTE FUNCTION fn_after_receipt_detail_insert();

-- Trigger: Sau khi xuất kho -> trừ tồn kho
CREATE OR REPLACE FUNCTION fn_after_dispatch_line_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory record % not found', NEW.inventory_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_dispatch_line
AFTER INSERT ON stock_dispatch_lines
FOR EACH ROW EXECUTE FUNCTION fn_after_dispatch_line_insert();

-- ============================================================
-- PHẦN K: VIEWS HỮU ÍCH
-- ============================================================

-- View: Tồn kho chi tiết
CREATE OR REPLACE VIEW v_inventory_detail AS
SELECT
    i.id,
    p.sku_code,
    p.name AS product_name,
    l.name AS location_name,
    i.batch_number,
    i.expiry_date,
    i.quantity,
    i.min_quantity,
    CASE WHEN i.quantity <= i.min_quantity THEN 'LOW' ELSE 'OK' END AS stock_status
FROM inventory i
JOIN products p ON p.id = i.product_id
JOIN locations l ON l.id = i.location_id;

-- View: Doanh thu theo ngày
CREATE OR REPLACE VIEW v_revenue_daily AS
SELECT
    DATE(created_at) AS date,
    COUNT(*) AS total_orders,
    SUM(final_amount) AS total_revenue,
    SUM(discount_amount) AS total_discount
FROM sale_orders
WHERE status IN ('DELIVERED','SHIPPED')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Sản phẩm bán chạy
CREATE OR REPLACE VIEW v_top_products AS
SELECT
    p.id,
    p.sku_code,
    p.name,
    SUM(od.quantity) AS total_sold,
    SUM(od.line_total) AS total_revenue
FROM order_detail od
JOIN products p ON p.id = od.product_id
JOIN sale_orders so ON so.id = od.order_id
WHERE so.status IN ('DELIVERED','SHIPPED')
GROUP BY p.id, p.sku_code, p.name
ORDER BY total_sold DESC;

-- ============================================================
-- PHẦN L: DỮ LIỆU MẪU (SEED DATA)
-- ============================================================

INSERT INTO roles (name, description, permission) VALUES
('ADMIN', 'Quản trị viên', '{"all": true}'::jsonb),
('MANAGER', 'Quản lý', '{"product": ["read","write"], "order": ["read","write"]}'::jsonb),
('STAFF', 'Nhân viên', '{"product": ["read"], "order": ["read","create"]}'::jsonb);

INSERT INTO locations (location_code, name, address, type) VALUES
('WH001', 'Kho chính', 'Hà Nội', 'WAREHOUSE'),
('ST001', 'Cửa hàng 1', 'Hà Nội', 'STORE');

INSERT INTO cash_funds (code, name, fund_type, is_default) VALUES
('CASH001', 'Tiền mặt', 'CASH', TRUE),
('BANK001', 'Ngân hàng VCB', 'BANK', FALSE);

-- ============================================================
-- HOÀN TẤT
-- ============================================================
SELECT 'Database optimization completed successfully!' AS status;
-- 1. ROLES
INSERT INTO roles (id, name, description, permission) VALUES
(1, 'ADMIN', 'Quản trị viên toàn quyền hệ thống', '{"all": true}'::jsonb),
(2, 'STAFF', 'Nhân viên bán hàng và thu ngân', '{"product": ["read"], "order": ["read","create"], "pet": ["read"], "service": ["read"]}'::jsonb),
(3, 'OWNER', 'Chủ cửa hàng kinh doanh', '{"all": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. USERS (Status in UPPERCASE: 'ACTIVE')
INSERT INTO users (id, username, password_hash, full_name, email, phone, role_id, status, staff_code, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$ID/8bh4S610dSC/a8Vy/X.vsA5WbJcNnnxcExEkAy5WTUbMv3874q', 'System Administrator', 'admin@smartinventory.vn', '0901234567', 1, 'ACTIVE', 'ADMIN01', NOW(), NOW()),
(2, 'owner1', '$2a$10$ID/8bh4S610dSC/a8Vy/X.vsA5WbJcNnnxcExEkAy5WTUbMv3874q', 'Nguyễn Văn Minh', 'minh.nguyen@taphoaminhthanh.vn', '0901234500', 3, 'ACTIVE', 'NV-OWNER', NOW(), NOW()),
(3, 'staff1', '$2a$10$ID/8bh4S610dSC/a8Vy/X.vsA5WbJcNnnxcExEkAy5WTUbMv3874q', 'Trần Thị Lan', 'lan.tran@taphoaminhthanh.vn', '0912345001', 2, 'ACTIVE', 'NV001', NOW(), NOW()),
(4, 'staff2', '$2a$10$ID/8bh4S610dSC/a8Vy/X.vsA5WbJcNnnxcExEkAy5WTUbMv3874q', 'Lê Văn Hùng', 'hung.le@taphoaminhthanh.vn', '0923456002', 2, 'ACTIVE', 'NV002', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role_id = EXCLUDED.role_id, status = EXCLUDED.status;

-- 3. STORE PROFILE
INSERT INTO store_profile (id, owner_id, name, address, phone, email, tax_code, website, currency, timezone, created_at, updated_at) VALUES
(1, 1, 'Pet & Retail Assistant Store', '123 Cầu Giấy, Hà Nội', '0901234567', 'admin@smartinventory.vn', '0102030405', 'https://smartinventory.vn', 'VND', 'Asia/Ho_Chi_Minh', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- 4. LOCATIONS
INSERT INTO locations (id, location_code, name, address, type) VALUES
(1, 'WH001', 'Kho tổng Hà Nội', '123 Cầu Giấy, Hà Nội', 'WAREHOUSE'),
(2, 'ST001', 'Cửa hàng PetHouse', '45 Hai Bà Trưng, Hà Nội', 'STORE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. CASH FUNDS
INSERT INTO cash_funds (id, code, name, fund_type, is_default) VALUES
(1, 'CASH001', 'Quỹ tiền mặt quầy thu ngân', 'CASH', TRUE),
(2, 'BANK001', 'Tài khoản Vietcombank', 'BANK', FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. CATEGORIES
INSERT INTO categories (id, category_code, name, sort_order, status, created_at, updated_at) VALUES
(1, 'CAT-FOOD', 'Thức ăn cho thú cưng', 1, 'ACTIVE', NOW(), NOW()),
(2, 'CAT-SNACK', 'Snack & Bánh thưởng', 2, 'ACTIVE', NOW(), NOW()),
(3, 'CAT-ACC', 'Phụ kiện & Đồ chơi', 3, 'ACTIVE', NOW(), NOW()),
(4, 'CAT-HYG', 'Vệ sinh & Chăm sóc', 4, 'ACTIVE', NOW(), NOW()),
(5, 'CAT-MED', 'Thuốc & Thực phẩm bổ sung', 5, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 7. SUPPLIERS
INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, addr, tax_code, status, created_at, updated_at) VALUES
(1, 'NCC001', 'Công ty TNHH Phân Phối Thú Cưng Royal', 'Nguyễn Văn Long', '0988123456', 'contact@royalcanin.vn', 'KCN Tân Bình, TP.HCM', '0312456789', 'ACTIVE', NOW(), NOW()),
(2, 'NCC002', 'Đại lý Dinh Dưỡng Thú Cưng SmartPet', 'Trần Thu Thảo', '0977234567', 'sales@smartpet.vn', 'KCN Thạch Thất, Hà Nội', '0103567890', 'ACTIVE', NOW(), NOW()),
(3, 'NCC003', 'Phụ Kiện Thú Cưng Cầu Giấy', 'Lê Đình Bảo', '0966345678', 'bao.le@petaccessories.com', '12 Hoàng Quốc Việt, Hà Nội', '0104678901', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 8. CUSTOMERS
INSERT INTO customers (id, customer_code, name, phone, email, addr, loyalty_points, total_spent, status, created_at, updated_at) VALUES
(1, 'KH001', 'Khách lẻ vãng lai', '0000000000', 'walkin@retail.com', 'Tại quầy', 0, 0, 'ACTIVE', NOW(), NOW()),
(2, 'KH002', 'Hoàng Văn Nam', '0912345678', 'nam.hoang@gmail.com', 'Số 15 Lê Văn Lương, Cầu Giấy, Hà Nội', 150, 3200000, 'ACTIVE', NOW(), NOW()),
(3, 'KH003', 'Trần Thị Lan', '0987654321', 'lan.tran@outlook.com', 'Số 88 Trần Duy Hưng, Hà Nội', 220, 5400000, 'ACTIVE', NOW(), NOW()),
(4, 'KH004', 'Phạm Quốc Bảo', '0903456789', 'bao.pham@gmail.com', 'Toà nhà Keangnam, Mễ Trì, Hà Nội', 85, 1750000, 'ACTIVE', NOW(), NOW()),
(5, 'KH005', 'Ngô Thu Hương', '0934567890', 'huong.ngo@yahoo.com', 'Số 5 Liễu Giai, Ba Đình, Hà Nội', 340, 7800000, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 9. PRODUCTS
INSERT INTO products (id, category_id, sku_code, barcode, name, image_url, description, weight, status, pet_type, product_type, created_at, updated_at) VALUES
(1, 1, 'FOOD-RC-MINI', '893000000001', 'Thức ăn hạt Royal Canin Mini Adult (Cho chó nhỏ 2kg)', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Thức ăn cao cấp dành cho chó trưởng thành giống nhỏ', 2.0, 'ACTIVE', 'DOG', 'GOODS', NOW(), NOW()),
(2, 1, 'FOOD-RC-KITTEN', '893000000002', 'Thức ăn hạt Royal Canin Kitten (Cho mèo con 2kg)', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Dinh dưỡng cân bằng cho mèo con từ 4 đến 12 tháng', 2.0, 'ACTIVE', 'CAT', 'GOODS', NOW(), NOW()),
(3, 1, 'FOOD-WHISKAS', '893000000003', 'Pate Whiskas Vị Cá Thu & Cá Hồi 85g', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Pate thơm ngon giàu Omega 3-6 cho mèo', 0.085, 'ACTIVE', 'CAT', 'GOODS', NOW(), NOW()),
(4, 2, 'SNACK-BOWWOW', '893000000004', 'Bánh thưởng Bowwow Thanh Thịt Bò 150g', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Snack nhai sạch răng cho chó', 0.15, 'ACTIVE', 'DOG', 'GOODS', NOW(), NOW()),
(5, 3, 'ACC-LEASH-HARNESS', '893000000005', 'Dây dắt kèm yếm trợ lực phản quang cho cún', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Chất liệu vải dù cao cấp, chắc chắn, êm ái', 0.3, 'ACTIVE', 'DOG', 'GOODS', NOW(), NOW()),
(6, 4, 'HYG-CAT-LITTER', '893000000006', 'Cát vệ sinh đậu nành Cature Tofu 6L (Hương Than)', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Cát hữu cơ tan trong nước xả bồn cầu, khử mùi đỉnh', 2.5, 'ACTIVE', 'CAT', 'GOODS', NOW(), NOW()),
(7, 4, 'HYG-SHAMPOO-PET', '893000000007', 'Sữa tắm thảo dược dưỡng lông SOS 530ml', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Dưỡng lông mềm mượt khử mùi hôi cơ thể', 0.6, 'ACTIVE', 'ALL', 'GOODS', NOW(), NOW()),
(8, 2, 'SNACK-CIAO-CHURU', '893000000008', 'Súp thưởng Ciao Churu vị ức gà & phô mai (Gói 4 thanh)', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300', 'Món khoái khẩu bổ sung nước cho mọi giống mèo', 0.06, 'ACTIVE', 'CAT', 'GOODS', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 10. PRODUCT UNITS
INSERT INTO product_units (id, product_id, unit_name, conversion_rate, is_base_unit) VALUES
(1, 1, 'Bao 2kg', 1.0, TRUE),
(2, 2, 'Bao 2kg', 1.0, TRUE),
(3, 3, 'Gói 85g', 1.0, TRUE),
(4, 4, 'Gói', 1.0, TRUE),
(5, 5, 'Bộ', 1.0, TRUE),
(6, 6, 'Túi 6L', 1.0, TRUE),
(7, 7, 'Chai 530ml', 1.0, TRUE),
(8, 8, 'Gói 4 thanh', 1.0, TRUE)
ON CONFLICT (id) DO UPDATE SET unit_name = EXCLUDED.unit_name;

-- 11. PRODUCT PRICE HISTORY
INSERT INTO product_price_history (id, product_id, cost_price, sale_price, effective_date, created_at) VALUES
(1, 1, 280000, 360000, CURRENT_DATE, NOW()),
(2, 2, 290000, 375000, CURRENT_DATE, NOW()),
(3, 3, 14000, 22000, CURRENT_DATE, NOW()),
(4, 4, 45000, 70000, CURRENT_DATE, NOW()),
(5, 5, 80000, 135000, CURRENT_DATE, NOW()),
(6, 6, 95000, 145000, CURRENT_DATE, NOW()),
(7, 7, 75000, 120000, CURRENT_DATE, NOW()),
(8, 8, 22000, 35000, CURRENT_DATE, NOW())
ON CONFLICT (id) DO UPDATE SET sale_price = EXCLUDED.sale_price;

-- 12. INVENTORY STOCK
INSERT INTO inventory (id, product_id, location_id, batch_number, expiry_date, quantity, min_quantity, updated_at) VALUES
(1, 1, 1, 'LOT-RC-2601', CURRENT_DATE + INTERVAL '180 days', 45, 10, NOW()),
(2, 2, 1, 'LOT-RC-2602', CURRENT_DATE + INTERVAL '180 days', 38, 10, NOW()),
(3, 3, 1, 'LOT-WK-2603', CURRENT_DATE + INTERVAL '240 days', 180, 30, NOW()),
(4, 4, 1, 'LOT-BW-2604', CURRENT_DATE + INTERVAL '150 days', 65, 15, NOW()),
(5, 5, 1, 'LOT-AC-2605', CURRENT_DATE + INTERVAL '720 days', 28, 5, NOW()),
(6, 6, 1, 'LOT-CT-2606', CURRENT_DATE + INTERVAL '360 days', 92, 20, NOW()),
(7, 7, 1, 'LOT-SOS-2607', CURRENT_DATE + INTERVAL '360 days', 40, 10, NOW()),
(8, 8, 1, 'LOT-CC-2608', CURRENT_DATE + INTERVAL '120 days', 110, 25, NOW())
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- 13. STOCK RECEIPTS
INSERT INTO stock_receipts (id, receipt_code, supplier_id, staff_id, receipt_date, status, invoice_number, total_amount, notes, approved_by, approved_at, created_at, updated_at) VALUES
(1, 'NK-2026-001', 1, 1, CURRENT_DATE - INTERVAL '10 days', 'APPROVED', 'HD-RC-8812', 15800000, 'Nhập lô hạt Royal Canin đợt đầu tháng', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(2, 'NK-2026-002', 2, 1, CURRENT_DATE - INTERVAL '5 days', 'APPROVED', 'HD-SP-9931', 8900000, 'Nhập snack Bowwow và Cát đậu nành', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(3, 'NK-2026-003', 3, 1, CURRENT_DATE - INTERVAL '1 days', 'PENDING', 'HD-PK-1120', 4500000, 'Đơn nhập dây yếm dắt phản quang', NULL, NULL, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days')
ON CONFLICT (id) DO UPDATE SET total_amount = EXCLUDED.total_amount;

-- 14. SALE ORDERS
INSERT INTO sale_orders (id, order_code, customer_id, user_id, total_amount, discount_amount, final_amount, paid_amount, status, shipping_address, notes, created_at, updated_at) VALUES
(1, 'DH-2026-001', 2, 1, 1145000, 45000, 1100000, 1100000, 'DELIVERED', '15 Lê Văn Lương, Cầu Giấy, Hà Nội', 'Giao giờ hành chính', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(2, 'DH-2026-002', 3, 1, 740000, 0, 740000, 740000, 'DELIVERED', 'Mua trực tiếp tại quầy', 'Khách thanh toán chuyển khoản', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(3, 'DH-2026-003', 4, 1, 520000, 20000, 500000, 500000, 'DELIVERED', 'Mua trực tiếp tại quầy', 'Tiền mặt', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
(4, 'DH-2026-004', 5, 1, 1850000, 100000, 1750000, 1750000, 'DELIVERED', '5 Liễu Giai, Ba Đình, Hà Nội', 'Giao nhanh trước 17h', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days')
ON CONFLICT (id) DO UPDATE SET final_amount = EXCLUDED.final_amount;

-- 15. ORDER DETAILS
INSERT INTO order_detail (id, order_id, product_id, unit_id, quantity, price_at_time, line_total, dispatched_qty, created_at) VALUES
(1, 1, 1, 1, 2, 350000, 700000, 2, NOW() - INTERVAL '4 days'),
(2, 1, 6, 6, 3, 140000, 420000, 3, NOW() - INTERVAL '4 days'),
(3, 2, 2, 2, 1, 375000, 375000, 1, NOW() - INTERVAL '2 days'),
(4, 2, 7, 7, 1, 120000, 120000, 1, NOW() - INTERVAL '2 days'),
(5, 2, 4, 4, 3, 70000, 210000, 3, NOW() - INTERVAL '2 days'),
(6, 3, 6, 6, 2, 145000, 290000, 2, NOW() - INTERVAL '1 days'),
(7, 3, 8, 8, 6, 35000, 210000, 6, NOW() - INTERVAL '1 days')
ON CONFLICT (id) DO UPDATE SET line_total = EXCLUDED.line_total;

-- 16. STOCK DISPATCHES
INSERT INTO stock_dispatches (id, dispatch_code, order_id, user_id, location_id, dispatch_date, status, notes, created_at, updated_at) VALUES
(1, 'XK-2026-001', 1, 1, 1, CURRENT_DATE - INTERVAL '4 days', 'DELIVERED', 'Xuất kho giao đơn hàng bán lẻ online', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(2, 'XK-2026-002', 2, 1, 1, CURRENT_DATE - INTERVAL '2 days', 'DELIVERED', 'Xuất kho khách mua tại quầy', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 17. CASH TRANSACTIONS
INSERT INTO cash_transactions (id, transaction_code, fund_id, direction, amount, category, description, payment_method, status, transaction_date, created_by, created_at, updated_at) VALUES
(1, 'TX-2026-001', 1, 'IN', 1100000, 'REVENUE', 'Thu tiền bán đơn hàng DH-2026-001', 'BANK_TRANSFER', 'COMPLETED', CURRENT_DATE - INTERVAL '4 days', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(2, 'TX-2026-002', 1, 'IN', 740000, 'REVENUE', 'Thu tiền bán đơn hàng DH-2026-002', 'CASH', 'COMPLETED', CURRENT_DATE - INTERVAL '2 days', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(3, 'TX-2026-003', 1, 'IN', 500000, 'REVENUE', 'Thu tiền bán đơn hàng DH-2026-003', 'CASH', 'COMPLETED', CURRENT_DATE - INTERVAL '1 days', 1, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
(4, 'TX-2026-004', 1, 'IN', 1750000, 'REVENUE', 'Thu tiền bán đơn hàng DH-2026-004', 'BANK_TRANSFER', 'COMPLETED', CURRENT_DATE - INTERVAL '1 days', 1, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
(5, 'TX-2026-005', 2, 'OUT', 15800000, 'SUPPLIER_PAYMENT', 'Thanh toán tiền hàng phiếu NK-2026-001 cho NCC Royal', 'BANK_TRANSFER', 'COMPLETED', CURRENT_DATE - INTERVAL '10 days', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(6, 'TX-2026-006', 1, 'OUT', 1200000, 'EXPENSE', 'Chi phí điện nước và internet cửa hàng tháng này', 'CASH', 'COMPLETED', CURRENT_DATE - INTERVAL '3 days', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount;

-- 18. PETS
INSERT INTO pets (id, customer_id, name, species, breed, gender, birth_date, weight_kg, color, allergies, health_notes, is_active, created_at, updated_at) VALUES
(1, 2, 'Miu', 'CAT', 'Anh lông ngắn', 'FEMALE', '2022-03-15', 4.2, 'Xám tro', 'Không', 'Đã tiêm phòng dại & 4 bệnh đầy đủ', TRUE, NOW(), NOW()),
(2, 2, 'Bông', 'DOG', 'Poodle', 'MALE', '2021-11-01', 3.8, 'Trắng', 'Dị ứng phấn hoa', 'Lông hơi xơ, cần tỉa định kỳ 4 tuần/lần', TRUE, NOW(), NOW()),
(3, 3, 'Kiki', 'DOG', 'Corgi', 'MALE', '2023-01-10', 10.5, 'Vàng trắng', 'Không', 'Sức khỏe tốt, tính hiếu động', TRUE, NOW(), NOW()),
(4, 4, 'Bơ', 'CAT', 'Mèo ta lai Xiêm', 'FEMALE', '2023-05-20', 3.2, 'Vàng kem', 'Không', 'Triệt sản tháng 1/2024', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 19. SERVICES
INSERT INTO services (id, service_code, name, category, duration_minutes, base_price, pet_type, is_active, created_at, updated_at) VALUES
(1, 'SV-TAM-MEO', 'Tắm & sấy spa mèo', 'BATH', 45, 120000.00, 'CAT', TRUE, NOW(), NOW()),
(2, 'SV-TAM-CHO', 'Tắm & sấy spa chó', 'BATH', 60, 150000.00, 'DOG', TRUE, NOW(), NOW()),
(3, 'SV-CAT-TIA', 'Cắt tỉa lông tạo kiểu nghệ thuật', 'GROOMING', 90, 250000.00, 'ALL', TRUE, NOW(), NOW()),
(4, 'SV-CAT-MONG', 'Cắt móng & vệ sinh tai chuyên sâu', 'NAIL', 20, 60000.00, 'ALL', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, base_price = EXCLUDED.base_price;

-- 20. SERVICE BOOKINGS
INSERT INTO service_bookings (id, booking_code, customer_id, pet_id, staff_id, booking_date, start_time, end_time, status, total_amount, notes, created_at, updated_at) VALUES
(1, 'BK-2026-001', 2, 1, 1, CURRENT_DATE, '09:30', '10:30', 'IN_PROGRESS', 180000.00, 'Bé hơi nhát nước, cần tắm nhẹ tay', NOW(), NOW()),
(2, 'BK-2026-002', 3, 2, 1, CURRENT_DATE, '14:00', '15:30', 'CONFIRMED', 250000.00, 'Cắt ngắn phần chân và tỉa tròn mặt', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 21. RESET SEQUENCES
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('store_profile_id_seq', (SELECT COALESCE(MAX(id), 1) FROM store_profile));
SELECT setval('locations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM locations));
SELECT setval('cash_funds_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cash_funds));
SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customers));
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM suppliers));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('inventory_id_seq', (SELECT COALESCE(MAX(id), 1) FROM inventory));
SELECT setval('product_price_history_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_price_history));
SELECT setval('stock_receipts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stock_receipts));
SELECT setval('stock_dispatches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stock_dispatches));
SELECT setval('sale_orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM sale_orders));
SELECT setval('order_detail_id_seq', (SELECT COALESCE(MAX(id), 1) FROM order_detail));
SELECT setval('cash_transactions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cash_transactions));
SELECT setval('pets_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pets));
SELECT setval('services_id_seq', (SELECT COALESCE(MAX(id), 1) FROM services));
SELECT setval('service_bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM service_bookings));
INSERT INTO service_bookings (id, booking_code, customer_id, pet_id, staff_id, scheduled_at, status, total_amount, notes, created_at, updated_at) VALUES
(1, 'BK-2026-001', 2, 1, 1, NOW() + INTERVAL '1 hour', 'CONFIRMED', 180000.00, 'Bé hơi nhát nước, cần tắm nhẹ tay', NOW(), NOW()),
(2, 'BK-2026-002', 3, 2, 1, NOW() + INTERVAL '3 hours', 'CONFIRMED', 250000.00, 'Cắt ngắn phần chân và tỉa tròn mặt', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
SELECT setval('service_bookings_id_seq', 2);
