-- ============================================================================
-- 001_initial_schema.sql
-- WhatsApp AI Sales Agent - Clothing Shop
-- Core tables, constraints, and indexes
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
CREATE TABLE customers (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_id     text NOT NULL,
    phone_number    text,
    display_name    text,
    preferred_language text NOT NULL DEFAULT 'en'
        CHECK (preferred_language IN ('en', 'ta', 'si')),
    first_seen_at   timestamptz NOT NULL DEFAULT now(),
    last_active_at  timestamptz NOT NULL DEFAULT now(),
    metadata        jsonb NOT NULL DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT customers_whatsapp_id_unique UNIQUE (whatsapp_id)
);

CREATE INDEX idx_customers_phone_number ON customers (phone_number);
CREATE INDEX idx_customers_last_active_at ON customers (last_active_at);

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================
CREATE TABLE conversations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused_for_handover', 'closed')),
    language        text,
    context         jsonb NOT NULL DEFAULT '{}',
    started_at      timestamptz NOT NULL DEFAULT now(),
    last_message_at timestamptz,
    ended_at        timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_customer_id ON conversations (customer_id);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================
CREATE TABLE messages (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    direction           text NOT NULL
        CHECK (direction IN ('inbound', 'outbound')),
    message_type        text NOT NULL DEFAULT 'text'
        CHECK (message_type IN ('text', 'image', 'template', 'interactive', 'system')),
    content             text,
    whatsapp_message_id text,
    status              text NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    metadata            jsonb NOT NULL DEFAULT '{}',
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_messages_whatsapp_message_id
    ON messages (whatsapp_message_id)
    WHERE whatsapp_message_id IS NOT NULL;

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_customer_id ON messages (customer_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
CREATE TABLE products (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku         text NOT NULL,
    name        text NOT NULL,
    description text,
    category    text NOT NULL,
    brand       text,
    gender      text
        CHECK (gender IS NULL OR gender IN ('men', 'women', 'unisex', 'kids')),
    base_price  numeric(10,2) NOT NULL CHECK (base_price > 0),
    sale_price  numeric(10,2) CHECK (sale_price IS NULL OR sale_price > 0),
    currency    text NOT NULL DEFAULT 'LKR',
    image_urls  text[] NOT NULL DEFAULT '{}',
    tags        text[] NOT NULL DEFAULT '{}',
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT products_sku_unique UNIQUE (sku)
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_gender ON products (gender);
CREATE INDEX idx_products_is_active ON products (is_active);
CREATE INDEX idx_products_base_price ON products (base_price);
CREATE INDEX idx_products_category_active ON products (category, is_active)
    WHERE is_active = true;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================
CREATE TABLE product_variants (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size                text NOT NULL,
    colour              text NOT NULL,
    sku                 text NOT NULL,
    available_quantity  integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reserved_quantity   integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT product_variants_sku_unique UNIQUE (sku),
    CONSTRAINT product_variants_product_size_colour_unique
        UNIQUE (product_id, size, colour)
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_product_variants_available ON product_variants (available_quantity)
    WHERE is_active = true AND available_quantity > 0;

-- ============================================================================
-- CARTS
-- ============================================================================
CREATE TABLE carts (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status      text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'checked_out', 'abandoned')),
    expires_at  timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One active cart per customer
CREATE UNIQUE INDEX idx_carts_customer_active
    ON carts (customer_id) WHERE status = 'active';

-- ============================================================================
-- CART ITEMS
-- ============================================================================
CREATE TABLE cart_items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id     uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id  uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity    integer NOT NULL CHECK (quantity > 0),
    unit_price  numeric(10,2) NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT cart_items_cart_variant_unique UNIQUE (cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);

-- ============================================================================
-- ORDER REFERENCE SEQUENCE
-- ============================================================================
CREATE SEQUENCE order_ref_seq START WITH 1 INCREMENT BY 1;

-- ============================================================================
-- ORDERS
-- ============================================================================
CREATE TABLE orders (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref       text NOT NULL,
    customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status          text NOT NULL DEFAULT 'pending_confirmation'
        CHECK (status IN (
            'pending_confirmation', 'confirmed', 'processing',
            'packed', 'shipped', 'delivered', 'cancelled', 'return_requested'
        )),
    customer_name   text NOT NULL,
    delivery_address text NOT NULL,
    contact_number  text,
    payment_method  text,
    subtotal        numeric(10,2) NOT NULL CHECK (subtotal >= 0),
    delivery_charge numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    discount_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount    numeric(10,2) NOT NULL CHECK (total_amount >= 0),
    currency        text NOT NULL DEFAULT 'LKR',
    notes           text,
    confirmed_at    timestamptz,
    cancelled_at    timestamptz,
    delivered_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT orders_order_ref_unique UNIQUE (order_ref)
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_order_ref ON orders (order_ref);

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================
CREATE TABLE order_items (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id   uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name text NOT NULL,
    size         text NOT NULL,
    colour       text NOT NULL,
    quantity     integer NOT NULL CHECK (quantity > 0),
    unit_price   numeric(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price  numeric(10,2) NOT NULL CHECK (total_price >= 0),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- ============================================================================
-- INVENTORY MOVEMENTS
-- ============================================================================
CREATE TABLE inventory_movements (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id      uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type   text NOT NULL
        CHECK (movement_type IN ('stock_in', 'reserved', 'sold', 'released', 'adjustment')),
    quantity        integer NOT NULL,
    reference_type  text,
    reference_id    uuid,
    notes           text,
    created_by      uuid,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_variant_id ON inventory_movements (variant_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements (created_at DESC);
CREATE INDEX idx_inventory_movements_reference
    ON inventory_movements (reference_type, reference_id)
    WHERE reference_type IS NOT NULL;

-- ============================================================================
-- SHOP SETTINGS
-- ============================================================================
CREATE TABLE shop_settings (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key         text NOT NULL,
    value       jsonb NOT NULL,
    description text,
    updated_at  timestamptz NOT NULL DEFAULT now(),
    updated_by  uuid,

    CONSTRAINT shop_settings_key_unique UNIQUE (key)
);

-- ============================================================================
-- STAFF USERS
-- ============================================================================
CREATE TABLE staff_users (
    id          uuid PRIMARY KEY,
    email       text NOT NULL,
    full_name   text NOT NULL,
    role        text NOT NULL DEFAULT 'staff'
        CHECK (role IN ('admin', 'manager', 'staff')),
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT staff_users_email_unique UNIQUE (email)
);

-- ============================================================================
-- HANDOVER REQUESTS
-- ============================================================================
CREATE TABLE handover_requests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reason          text NOT NULL,
    priority        text NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status          text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'assigned', 'resolved', 'expired')),
    assigned_to     uuid REFERENCES staff_users(id),
    resolved_at     timestamptz,
    resolved_by     uuid REFERENCES staff_users(id),
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_handover_requests_status ON handover_requests (status);
CREATE INDEX idx_handover_requests_conversation_id ON handover_requests (conversation_id);
CREATE INDEX idx_handover_requests_customer_id ON handover_requests (customer_id);
CREATE INDEX idx_handover_requests_assigned_to ON handover_requests (assigned_to)
    WHERE assigned_to IS NOT NULL;

-- ============================================================================
-- PROCESSED WEBHOOK EVENTS (deduplication)
-- ============================================================================
CREATE TABLE processed_webhook_events (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     text NOT NULL,
    event_type   text NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now(),
    metadata     jsonb NOT NULL DEFAULT '{}',

    CONSTRAINT processed_webhook_events_event_id_unique UNIQUE (event_id)
);

CREATE INDEX idx_processed_webhook_events_processed_at
    ON processed_webhook_events (processed_at DESC);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE audit_logs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type   text NOT NULL,
    entity_id     uuid NOT NULL,
    action        text NOT NULL,
    changes       jsonb,
    performed_by  uuid,
    ip_address    text,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs (performed_by)
    WHERE performed_by IS NOT NULL;
