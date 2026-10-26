-- ============================================================================
-- 004_triggers.sql
-- WhatsApp AI Sales Agent - Clothing Shop
-- Triggers for automatic timestamps, order refs, and audit logging
-- ============================================================================

-- ============================================================================
-- AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================================
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_handover_requests_updated_at
    BEFORE UPDATE ON handover_requests
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_staff_users_updated_at
    BEFORE UPDATE ON staff_users
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER trg_shop_settings_updated_at
    BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamps();

-- ============================================================================
-- AUTO-GENERATE ORDER REFERENCE
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_generate_order_ref()
RETURNS trigger AS $$
BEGIN
    IF NEW.order_ref IS NULL OR NEW.order_ref = '' THEN
        NEW.order_ref := generate_order_ref();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_generate_ref
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION trg_generate_order_ref();

-- ============================================================================
-- AUDIT LOG: ORDER STATUS CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_audit_order_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, changes)
        VALUES (
            'order',
            NEW.id,
            'created',
            jsonb_build_object(
                'order_ref', NEW.order_ref,
                'status', NEW.status,
                'total_amount', NEW.total_amount,
                'customer_id', NEW.customer_id
            )
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, changes)
            VALUES (
                'order',
                NEW.id,
                'status_changed',
                jsonb_build_object(
                    'order_ref', NEW.order_ref,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        END IF;

        IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, changes)
            VALUES (
                'order',
                NEW.id,
                'amount_changed',
                jsonb_build_object(
                    'order_ref', NEW.order_ref,
                    'old_total', OLD.total_amount,
                    'new_total', NEW.total_amount
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_audit
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trg_audit_order_changes();

-- ============================================================================
-- AUDIT LOG: PRODUCT CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_audit_product_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, changes)
        VALUES (
            'product',
            NEW.id,
            'created',
            jsonb_build_object('sku', NEW.sku, 'name', NEW.name, 'base_price', NEW.base_price)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log price changes
        IF OLD.base_price IS DISTINCT FROM NEW.base_price
           OR OLD.sale_price IS DISTINCT FROM NEW.sale_price THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, changes)
            VALUES (
                'product',
                NEW.id,
                'price_changed',
                jsonb_build_object(
                    'sku', NEW.sku,
                    'old_base_price', OLD.base_price,
                    'new_base_price', NEW.base_price,
                    'old_sale_price', OLD.sale_price,
                    'new_sale_price', NEW.sale_price
                )
            );
        END IF;

        -- Log active status changes
        IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, changes)
            VALUES (
                'product',
                NEW.id,
                CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END,
                jsonb_build_object('sku', NEW.sku, 'name', NEW.name)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, changes)
        VALUES (
            'product',
            OLD.id,
            'deleted',
            jsonb_build_object('sku', OLD.sku, 'name', OLD.name)
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_audit
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION trg_audit_product_changes();

-- ============================================================================
-- AUDIT LOG: INVENTORY STOCK ADJUSTMENTS
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_audit_inventory_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.available_quantity IS DISTINCT FROM NEW.available_quantity
           OR OLD.reserved_quantity IS DISTINCT FROM NEW.reserved_quantity THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, changes)
            VALUES (
                'product_variant',
                NEW.id,
                'stock_changed',
                jsonb_build_object(
                    'sku', NEW.sku,
                    'old_available', OLD.available_quantity,
                    'new_available', NEW.available_quantity,
                    'old_reserved', OLD.reserved_quantity,
                    'new_reserved', NEW.reserved_quantity
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_variants_audit
    AFTER UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION trg_audit_inventory_changes();

-- ============================================================================
-- CONVERSATION: AUTO-UPDATE last_message_at WHEN MESSAGE INSERTED
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_update_conversation_last_message()
RETURNS trigger AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION trg_update_conversation_last_message();

-- ============================================================================
-- CUSTOMER: AUTO-UPDATE last_active_at WHEN MESSAGE RECEIVED
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_update_customer_last_active()
RETURNS trigger AS $$
BEGIN
    IF NEW.direction = 'inbound' THEN
        UPDATE customers
        SET last_active_at = now(),
            updated_at = now()
        WHERE id = NEW.customer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_update_customer_active
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION trg_update_customer_last_active();
