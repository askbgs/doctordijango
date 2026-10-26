-- ============================================================================
-- 003_rls_policies.sql
-- WhatsApp AI Sales Agent - Clothing Shop
-- Row Level Security policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER: Check if the current user is staff with a given minimum role
-- ============================================================================
CREATE OR REPLACE FUNCTION is_staff(min_role text DEFAULT 'staff')
RETURNS boolean AS $$
DECLARE
    v_role text;
    v_active boolean;
BEGIN
    SELECT role, is_active INTO v_role, v_active
    FROM staff_users
    WHERE id = auth.uid();

    IF NOT FOUND OR NOT v_active THEN
        RETURN false;
    END IF;

    CASE min_role
        WHEN 'staff' THEN RETURN true;
        WHEN 'manager' THEN RETURN v_role IN ('manager', 'admin');
        WHEN 'admin' THEN RETURN v_role = 'admin';
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- PRODUCTS - Public read for active products; staff can manage
-- ============================================================================
CREATE POLICY products_anon_select ON products
    FOR SELECT TO anon
    USING (is_active = true);

CREATE POLICY products_auth_select ON products
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY products_staff_insert ON products
    FOR INSERT TO authenticated
    WITH CHECK (is_staff('manager'));

CREATE POLICY products_staff_update ON products
    FOR UPDATE TO authenticated
    USING (is_staff('manager'));

CREATE POLICY products_staff_delete ON products
    FOR DELETE TO authenticated
    USING (is_staff('admin'));

-- ============================================================================
-- PRODUCT VARIANTS - Public read for active; staff can manage
-- ============================================================================
CREATE POLICY product_variants_anon_select ON product_variants
    FOR SELECT TO anon
    USING (is_active = true);

CREATE POLICY product_variants_auth_select ON product_variants
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY product_variants_staff_insert ON product_variants
    FOR INSERT TO authenticated
    WITH CHECK (is_staff('manager'));

CREATE POLICY product_variants_staff_update ON product_variants
    FOR UPDATE TO authenticated
    USING (is_staff('manager'));

CREATE POLICY product_variants_staff_delete ON product_variants
    FOR DELETE TO authenticated
    USING (is_staff('admin'));

-- ============================================================================
-- CUSTOMERS - Staff can read all; service role has full access via bypass
-- ============================================================================
CREATE POLICY customers_staff_select ON customers
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY customers_staff_update ON customers
    FOR UPDATE TO authenticated
    USING (is_staff('manager'));

-- ============================================================================
-- CONVERSATIONS - Staff can read all
-- ============================================================================
CREATE POLICY conversations_staff_select ON conversations
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY conversations_staff_update ON conversations
    FOR UPDATE TO authenticated
    USING (is_staff());

-- ============================================================================
-- MESSAGES - Staff can read all
-- ============================================================================
CREATE POLICY messages_staff_select ON messages
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY messages_staff_insert ON messages
    FOR INSERT TO authenticated
    WITH CHECK (is_staff());

-- ============================================================================
-- CARTS - Staff can read all
-- ============================================================================
CREATE POLICY carts_staff_select ON carts
    FOR SELECT TO authenticated
    USING (is_staff());

-- ============================================================================
-- CART ITEMS - Staff can read all
-- ============================================================================
CREATE POLICY cart_items_staff_select ON cart_items
    FOR SELECT TO authenticated
    USING (is_staff());

-- ============================================================================
-- ORDERS - Staff can manage; read policy varies by role
-- ============================================================================
CREATE POLICY orders_staff_select ON orders
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY orders_staff_update ON orders
    FOR UPDATE TO authenticated
    USING (is_staff());

-- ============================================================================
-- ORDER ITEMS - Staff can read all
-- ============================================================================
CREATE POLICY order_items_staff_select ON order_items
    FOR SELECT TO authenticated
    USING (is_staff());

-- ============================================================================
-- INVENTORY MOVEMENTS - Staff can read; managers can insert
-- ============================================================================
CREATE POLICY inventory_movements_staff_select ON inventory_movements
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY inventory_movements_manager_insert ON inventory_movements
    FOR INSERT TO authenticated
    WITH CHECK (is_staff('manager'));

-- ============================================================================
-- SHOP SETTINGS - Staff can read; admin can manage
-- ============================================================================
CREATE POLICY shop_settings_staff_select ON shop_settings
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY shop_settings_admin_insert ON shop_settings
    FOR INSERT TO authenticated
    WITH CHECK (is_staff('admin'));

CREATE POLICY shop_settings_admin_update ON shop_settings
    FOR UPDATE TO authenticated
    USING (is_staff('admin'));

CREATE POLICY shop_settings_admin_delete ON shop_settings
    FOR DELETE TO authenticated
    USING (is_staff('admin'));

-- ============================================================================
-- STAFF USERS - Staff can see all; admin can manage
-- ============================================================================
CREATE POLICY staff_users_auth_select ON staff_users
    FOR SELECT TO authenticated
    USING (is_staff() OR id = auth.uid());

CREATE POLICY staff_users_admin_insert ON staff_users
    FOR INSERT TO authenticated
    WITH CHECK (is_staff('admin'));

CREATE POLICY staff_users_admin_update ON staff_users
    FOR UPDATE TO authenticated
    USING (is_staff('admin') OR id = auth.uid());

-- ============================================================================
-- HANDOVER REQUESTS - Staff can read and manage
-- ============================================================================
CREATE POLICY handover_requests_staff_select ON handover_requests
    FOR SELECT TO authenticated
    USING (is_staff());

CREATE POLICY handover_requests_staff_insert ON handover_requests
    FOR INSERT TO authenticated
    WITH CHECK (is_staff());

CREATE POLICY handover_requests_staff_update ON handover_requests
    FOR UPDATE TO authenticated
    USING (is_staff());

-- ============================================================================
-- PROCESSED WEBHOOK EVENTS - Only service role (RLS bypass) accesses these
-- No authenticated user policies needed
-- ============================================================================

-- ============================================================================
-- AUDIT LOGS - Staff can read; insert via service role only
-- ============================================================================
CREATE POLICY audit_logs_staff_select ON audit_logs
    FOR SELECT TO authenticated
    USING (is_staff());
