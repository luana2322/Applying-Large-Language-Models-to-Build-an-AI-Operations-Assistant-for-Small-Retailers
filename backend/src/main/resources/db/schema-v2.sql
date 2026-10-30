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
DROP TABLE IF EXISTS service_payments CASCADE;
DROP TABLE IF EXISTS service_booking_items CASCADE;
DROP TABLE IF EXISTS service_bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS ai_tool_results CASCADE;
DROP TABLE IF EXISTS ai_tool_calls CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
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
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS stock_receipt_detail CASCADE;
DROP TABLE IF EXISTS stock_receipts CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
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
    business_category   VARCHAR(255) DEFAULT 'PET_STORE',
    address             TEXT,
    phone               VARCHAR(30),
    email               VARCHAR(255),
    website             VARCHAR(500),
    tax_code            VARCHAR(50),
    logo_url            VARCHAR(500),
    currency            VARCHAR(10) DEFAULT 'VND',
    timezone            VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    opening_hours       JSONB DEFAULT '{}'::jsonb,
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
    weight          DECIMAL(10,4) DEFAULT 0,
    pet_type        VARCHAR(20) CHECK (pet_type IN ('DOG','CAT','SMALL_PET','BIRD','FISH','ALL','OTHER')),
    product_type    VARCHAR(30) CHECK (product_type IN ('FOOD_DRY','FOOD_WET','SNACK','SUPPLEMENT','ACCESSORY','HYGIENE','TOY','OTHER')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','DISCONTINUED')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku_code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_pet_type ON products(pet_type);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- 11b. Bảng product_attributes
CREATE TABLE product_attributes (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_code  VARCHAR(50) NOT NULL,
    attribute_value VARCHAR(255) NOT NULL,
    source          VARCHAR(50) DEFAULT 'MANUFACTURER_LABEL'
                    CHECK (source IN ('MANUFACTURER_LABEL','DISTRIBUTOR_DOC','MANUAL')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_attr_product ON product_attributes(product_id);
CREATE INDEX idx_product_attr_code ON product_attributes(attribute_code);

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

-- 23b. Bảng pets (Hồ sơ Thú cưng)
CREATE TABLE pets (
    id              SERIAL PRIMARY KEY,
    customer_id     INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    species         VARCHAR(20) NOT NULL
                    CHECK (species IN ('DOG','CAT','SMALL_PET','BIRD','FISH','OTHER')),
    breed           VARCHAR(100),
    gender          VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','UNKNOWN')),
    birth_date      DATE,
    weight_kg       DECIMAL(6,2),
    color           VARCHAR(50),
    allergies       TEXT,
    health_notes    TEXT,
    photo_url       VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_pets_customer ON pets(customer_id);
CREATE INDEX idx_pets_species ON pets(species);

-- 24. Bảng sale_orders
CREATE TABLE sale_orders (
    id                  SERIAL PRIMARY KEY,
    order_code          VARCHAR(50) NOT NULL UNIQUE,
    customer_id         INT REFERENCES customers(id) ON DELETE SET NULL,
    pet_id              INT REFERENCES pets(id) ON DELETE SET NULL,
    user_id             INT REFERENCES users(id) ON DELETE SET NULL,
    total_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    final_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(15,2) NOT NULL DEFAULT 0,
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
CREATE INDEX idx_sale_orders_pet ON sale_orders(pet_id);
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
    applies_to      VARCHAR(20) NOT NULL DEFAULT 'ALL'
                    CHECK (applies_to IN ('PRODUCT','SERVICE','ALL')),
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
-- PHẦN I: AI OPERATIONS ASSISTANT MODULE (LLM & TOOLS)
-- ============================================================

-- 33. Bảng ai_conversations
CREATE TABLE ai_conversations (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(128) NOT NULL UNIQUE,
    store_id        BIGINT NOT NULL,
    title           VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_store ON ai_conversations(store_id);

-- 34. Bảng ai_messages
CREATE TABLE ai_messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role            VARCHAR(16) NOT NULL,
    content         TEXT NOT NULL,
    intent          VARCHAR(64),
    status          VARCHAR(32),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

-- 35. Bảng ai_tool_calls
CREATE TABLE ai_tool_calls (
    id              BIGSERIAL PRIMARY KEY,
    message_id      BIGINT NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    tool_name       VARCHAR(100) NOT NULL,
    arguments       TEXT,
    status          VARCHAR(32),
    error_message   VARCHAR(1024),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tool_calls_message ON ai_tool_calls(message_id);

-- 36. Bảng ai_tool_results
CREATE TABLE ai_tool_results (
    id              BIGSERIAL PRIMARY KEY,
    tool_call_id    BIGINT NOT NULL REFERENCES ai_tool_calls(id) ON DELETE CASCADE,
    result_data     TEXT,
    error_message   VARCHAR(1024),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tool_results_call ON ai_tool_results(tool_call_id);

-- ============================================================
-- PHẦN J: NHÓM DỊCH VỤ GROOMING / SPA (SERVICES)
-- ============================================================

-- 37. Bảng services
CREATE TABLE services (
    id                  SERIAL PRIMARY KEY,
    service_code        VARCHAR(50) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(50) CHECK (category IN ('GROOMING','SPA','BATH','NAIL','EAR','DENTAL','OTHER')),
    description         TEXT,
    duration_minutes    INT NOT NULL DEFAULT 30,
    base_price          DECIMAL(15,2) NOT NULL,
    pet_type            VARCHAR(20) CHECK (pet_type IN ('DOG','CAT','ALL')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- 38. Bảng service_bookings
CREATE TABLE service_bookings (
    id                  SERIAL PRIMARY KEY,
    booking_code        VARCHAR(50) NOT NULL UNIQUE,
    customer_id         INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    pet_id              INT NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
    staff_id            INT REFERENCES users(id) ON DELETE SET NULL,
    booking_date        DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')),
    total_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON service_bookings(customer_id);
CREATE INDEX idx_bookings_pet ON service_bookings(pet_id);
CREATE INDEX idx_bookings_staff ON service_bookings(staff_id);
CREATE INDEX idx_bookings_date ON service_bookings(booking_date);
CREATE INDEX idx_bookings_status ON service_bookings(status);

-- 39. Bảng service_booking_items
CREATE TABLE service_booking_items (
    id                  SERIAL PRIMARY KEY,
    booking_id          INT NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
    service_id          INT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    price_at_time       DECIMAL(15,2) NOT NULL,
    quantity            INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total          DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_items_booking ON service_booking_items(booking_id);
CREATE INDEX idx_booking_items_service ON service_booking_items(service_id);

-- 40. Bảng service_payments
CREATE TABLE service_payments (
    id                  SERIAL PRIMARY KEY,
    booking_id          INT NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
    payment_code        VARCHAR(50) NOT NULL UNIQUE,
    method              VARCHAR(30) NOT NULL
                        CHECK (method IN ('CASH','BANK_TRANSFER','CARD','E_WALLET')),
    amount              DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_ref     VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    paid_at             TIMESTAMP,
    notes               TEXT,
    created_by          INT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_payments_booking ON service_payments(booking_id);
CREATE INDEX idx_service_payments_status ON service_payments(status);

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
('MANAGER', 'Quản lý', '{"product": ["read","write"], "order": ["read","write"], "pet": ["read","write"], "service": ["read","write"]}'::jsonb),
('STAFF', 'Nhân viên', '{"product": ["read"], "order": ["read","create"], "pet": ["read"], "service": ["read"]}'::jsonb),
('GROOMER', 'Nhân viên grooming', '{"service": ["read","write"], "pet": ["read"]}'::jsonb);

INSERT INTO locations (location_code, name, address, type) VALUES
('WH001', 'Kho tổng Hà Nội', '123 Cầu Giấy, Hà Nội', 'WAREHOUSE'),
('ST001', 'Cửa hàng Thú cưng PetHouse', '45 Hai Bà Trưng, Hà Nội', 'STORE');

INSERT INTO cash_funds (code, name, fund_type, is_default) VALUES
('CASH001', 'Quỹ tiền mặt quầy thu ngân', 'CASH', TRUE),
('BANK001', 'Tài khoản Vietcombank', 'BANK', FALSE);

INSERT INTO categories (category_code, name, sort_order, status) VALUES
('CAT-FOOD', 'Thức ăn cho thú cưng', 1, 'ACTIVE'),
('CAT-SNACK', 'Snack & Bánh thưởng', 2, 'ACTIVE'),
('CAT-ACC', 'Phụ kiện & Đồ chơi', 3, 'ACTIVE'),
('CAT-HYG', 'Vệ sinh & Chăm sóc', 4, 'ACTIVE');

INSERT INTO services (service_code, name, category, duration_minutes, base_price, pet_type, is_active) VALUES
('SV-TAM-MEO', 'Tắm & sấy mèo', 'BATH', 45, 120000.00, 'CAT', TRUE),
('SV-TAM-CHO', 'Tắm & sấy chó', 'BATH', 60, 150000.00, 'DOG', TRUE),
('SV-CAT-TIA', 'Cắt tỉa lông toàn thân', 'GROOMING', 90, 250000.00, 'ALL', TRUE),
('SV-CAT-MONG', 'Cắt móng', 'NAIL', 15, 50000.00, 'ALL', TRUE);

-- ============================================================
-- HOÀN TẤT
-- ============================================================
SELECT 'Database optimization completed successfully!' AS status;
