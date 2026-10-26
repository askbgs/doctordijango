-- ============================================================================
-- 002_functions.sql
-- WhatsApp AI Sales Agent - Clothing Shop
-- Database functions for business logic
-- ============================================================================

-- ============================================================================
-- update_timestamps() - Trigger function for auto-updating updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- generate_order_ref() - Generates references like CLT-2026-000001
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_order_ref()
RETURNS text AS $$
DECLARE
    v_seq bigint;
    v_year text;
BEGIN
    v_seq := nextval('order_ref_seq');
    v_year := to_char(now(), 'YYYY');
    RETURN 'CLT-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- reserve_stock() - Atomically reserves stock for a variant
-- Returns true on success, false if insufficient stock
-- ============================================================================
CREATE OR REPLACE FUNCTION reserve_stock(
    p_variant_id uuid,
    p_quantity integer
)
RETURNS boolean AS $$
DECLARE
    v_updated integer;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    UPDATE product_variants
    SET available_quantity = available_quantity - p_quantity,
        reserved_quantity = reserved_quantity + p_quantity,
        updated_at = now()
    WHERE id = p_variant_id
      AND is_active = true
      AND available_quantity >= p_quantity;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN false;
    END IF;

    INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, notes)
    VALUES (p_variant_id, 'reserved', p_quantity, 'reservation', 'Stock reserved');

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- release_stock() - Releases previously reserved stock
-- ============================================================================
CREATE OR REPLACE FUNCTION release_stock(
    p_variant_id uuid,
    p_quantity integer
)
RETURNS void AS $$
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    UPDATE product_variants
    SET available_quantity = available_quantity + p_quantity,
        reserved_quantity = GREATEST(reserved_quantity - p_quantity, 0),
        updated_at = now()
    WHERE id = p_variant_id;

    INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, notes)
    VALUES (p_variant_id, 'released', p_quantity, 'release', 'Stock released');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- place_order() - Atomic order creation with stock validation
--
-- Expects JSON:
-- {
--   "customer_id": "uuid",
--   "customer_name": "text",
--   "delivery_address": "text",
--   "contact_number": "text",
--   "payment_method": "text",
--   "delivery_charge": 0,
--   "discount_amount": 0,
--   "notes": "text",
--   "items": [
--     {
--       "product_id": "uuid",
--       "variant_id": "uuid",
--       "quantity": 1
--     }
--   ]
-- }
--
-- Returns the new order ID or raises an exception.
-- ============================================================================
CREATE OR REPLACE FUNCTION place_order(p_order jsonb)
RETURNS uuid AS $$
DECLARE
    v_order_id uuid;
    v_order_ref text;
    v_item jsonb;
    v_product record;
    v_variant record;
    v_subtotal numeric(10,2) := 0;
    v_item_total numeric(10,2);
    v_unit_price numeric(10,2);
    v_delivery_charge numeric(10,2);
    v_discount_amount numeric(10,2);
    v_total numeric(10,2);
    v_reserved boolean;
BEGIN
    -- Validate required fields
    IF p_order->>'customer_id' IS NULL THEN
        RAISE EXCEPTION 'customer_id is required';
    END IF;
    IF p_order->>'customer_name' IS NULL OR p_order->>'customer_name' = '' THEN
        RAISE EXCEPTION 'customer_name is required';
    END IF;
    IF p_order->>'delivery_address' IS NULL OR p_order->>'delivery_address' = '' THEN
        RAISE EXCEPTION 'delivery_address is required';
    END IF;
    IF p_order->'items' IS NULL OR jsonb_array_length(p_order->'items') = 0 THEN
        RAISE EXCEPTION 'At least one item is required';
    END IF;

    v_delivery_charge := COALESCE((p_order->>'delivery_charge')::numeric, 0);
    v_discount_amount := COALESCE((p_order->>'discount_amount')::numeric, 0);

    -- Validate and reserve stock for each item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_order->'items')
    LOOP
        -- Lock and fetch variant
        SELECT pv.*, p.name AS product_name, p.base_price, p.sale_price, p.is_active AS product_active
        INTO v_variant
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = (v_item->>'variant_id')::uuid
          AND pv.product_id = (v_item->>'product_id')::uuid
        FOR UPDATE OF pv;

        IF v_variant IS NULL THEN
            RAISE EXCEPTION 'Product variant % not found', v_item->>'variant_id';
        END IF;

        IF NOT v_variant.is_active OR NOT v_variant.product_active THEN
            RAISE EXCEPTION 'Product variant % is not available', v_variant.sku;
        END IF;

        IF v_variant.available_quantity < (v_item->>'quantity')::integer THEN
            RAISE EXCEPTION 'Insufficient stock for variant % (available: %, requested: %)',
                v_variant.sku, v_variant.available_quantity, v_item->>'quantity';
        END IF;

        -- Use sale_price if set, otherwise base_price (server-authoritative pricing)
        v_unit_price := COALESCE(v_variant.sale_price, v_variant.base_price);
        v_item_total := v_unit_price * (v_item->>'quantity')::integer;
        v_subtotal := v_subtotal + v_item_total;

        -- Reserve stock
        v_reserved := reserve_stock(
            (v_item->>'variant_id')::uuid,
            (v_item->>'quantity')::integer
        );

        IF NOT v_reserved THEN
            RAISE EXCEPTION 'Failed to reserve stock for variant %', v_variant.sku;
        END IF;
    END LOOP;

    -- Calculate total
    v_total := v_subtotal + v_delivery_charge - v_discount_amount;
    IF v_total < 0 THEN
        v_total := 0;
    END IF;

    -- Generate order ref
    v_order_ref := generate_order_ref();

    -- Create the order
    INSERT INTO orders (
        order_ref, customer_id, status, customer_name,
        delivery_address, contact_number, payment_method,
        subtotal, delivery_charge, discount_amount, total_amount,
        notes
    ) VALUES (
        v_order_ref,
        (p_order->>'customer_id')::uuid,
        'pending_confirmation',
        p_order->>'customer_name',
        p_order->>'delivery_address',
        p_order->>'contact_number',
        p_order->>'payment_method',
        v_subtotal,
        v_delivery_charge,
        v_discount_amount,
        v_total,
        p_order->>'notes'
    )
    RETURNING id INTO v_order_id;

    -- Create order items with server-side pricing
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_order->'items')
    LOOP
        SELECT pv.*, p.name AS product_name, p.base_price, p.sale_price
        INTO v_variant
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = (v_item->>'variant_id')::uuid;

        v_unit_price := COALESCE(v_variant.sale_price, v_variant.base_price);
        v_item_total := v_unit_price * (v_item->>'quantity')::integer;

        INSERT INTO order_items (
            order_id, product_id, variant_id,
            product_name, size, colour,
            quantity, unit_price, total_price
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::uuid,
            (v_item->>'variant_id')::uuid,
            v_variant.product_name,
            v_variant.size,
            v_variant.colour,
            (v_item->>'quantity')::integer,
            v_unit_price,
            v_item_total
        );

        -- Record the movement linked to this order
        INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, reference_id, notes)
        VALUES (
            (v_item->>'variant_id')::uuid,
            'reserved',
            (v_item->>'quantity')::integer,
            'order',
            v_order_id,
            'Reserved for order ' || v_order_ref
        );
    END LOOP;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- confirm_order() - Confirms a pending order
-- ============================================================================
CREATE OR REPLACE FUNCTION confirm_order(p_order_id uuid)
RETURNS void AS $$
DECLARE
    v_order record;
    v_item record;
BEGIN
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_order.status != 'pending_confirmation' THEN
        RAISE EXCEPTION 'Order % cannot be confirmed (current status: %)',
            v_order.order_ref, v_order.status;
    END IF;

    UPDATE orders
    SET status = 'confirmed',
        confirmed_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    -- Convert reserved stock to sold
    FOR v_item IN
        SELECT * FROM order_items WHERE order_id = p_order_id
    LOOP
        UPDATE product_variants
        SET reserved_quantity = GREATEST(reserved_quantity - v_item.quantity, 0),
            updated_at = now()
        WHERE id = v_item.variant_id;

        INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, reference_id, notes)
        VALUES (v_item.variant_id, 'sold', v_item.quantity, 'order', p_order_id,
                'Confirmed order ' || v_order.order_ref);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- cancel_order() - Cancels an order and releases reserved stock
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_order(p_order_id uuid, p_reason text DEFAULT NULL)
RETURNS void AS $$
DECLARE
    v_order record;
    v_item record;
BEGIN
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_order.status IN ('delivered', 'cancelled') THEN
        RAISE EXCEPTION 'Order % cannot be cancelled (current status: %)',
            v_order.order_ref, v_order.status;
    END IF;

    UPDATE orders
    SET status = 'cancelled',
        cancelled_at = now(),
        notes = CASE
            WHEN p_reason IS NOT NULL THEN
                COALESCE(notes || E'\n', '') || 'Cancelled: ' || p_reason
            ELSE notes
        END,
        updated_at = now()
    WHERE id = p_order_id;

    -- Release stock if order was still pending or confirmed
    IF v_order.status IN ('pending_confirmation', 'confirmed', 'processing') THEN
        FOR v_item IN
            SELECT * FROM order_items WHERE order_id = p_order_id
        LOOP
            PERFORM release_stock(v_item.variant_id, v_item.quantity);

            INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, reference_id, notes)
            VALUES (v_item.variant_id, 'released', v_item.quantity, 'order', p_order_id,
                    'Cancelled order ' || v_order.order_ref);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- search_products() - Flexible product search with multiple optional filters
-- ============================================================================
CREATE OR REPLACE FUNCTION search_products(
    p_category text DEFAULT NULL,
    p_min_price numeric DEFAULT NULL,
    p_max_price numeric DEFAULT NULL,
    p_size text DEFAULT NULL,
    p_colour text DEFAULT NULL,
    p_gender text DEFAULT NULL,
    p_keyword text DEFAULT NULL,
    p_limit integer DEFAULT 20
)
RETURNS TABLE (
    product_id uuid,
    sku text,
    name text,
    description text,
    category text,
    brand text,
    gender text,
    base_price numeric,
    sale_price numeric,
    effective_price numeric,
    currency text,
    image_urls text[],
    variants jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS product_id,
        p.sku,
        p.name,
        p.description,
        p.category,
        p.brand,
        p.gender,
        p.base_price,
        p.sale_price,
        COALESCE(p.sale_price, p.base_price) AS effective_price,
        p.currency,
        p.image_urls,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'variant_id', pv.id,
                        'size', pv.size,
                        'colour', pv.colour,
                        'sku', pv.sku,
                        'available_quantity', pv.available_quantity
                    )
                )
                FROM product_variants pv
                WHERE pv.product_id = p.id
                  AND pv.is_active = true
                  AND pv.available_quantity > 0
                  AND (p_size IS NULL OR lower(pv.size) = lower(p_size))
                  AND (p_colour IS NULL OR lower(pv.colour) = lower(p_colour))
            ),
            '[]'::jsonb
        ) AS variants
    FROM products p
    WHERE p.is_active = true
      AND (p_category IS NULL OR lower(p.category) = lower(p_category))
      AND (p_gender IS NULL OR lower(p.gender) = lower(p_gender))
      AND (p_min_price IS NULL OR COALESCE(p.sale_price, p.base_price) >= p_min_price)
      AND (p_max_price IS NULL OR COALESCE(p.sale_price, p.base_price) <= p_max_price)
      AND (p_keyword IS NULL OR (
          p.name ILIKE '%' || p_keyword || '%'
          OR p.description ILIKE '%' || p_keyword || '%'
          OR p.brand ILIKE '%' || p_keyword || '%'
          OR p_keyword = ANY(p.tags)
      ))
      -- Only include products that have matching available variants
      AND EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.is_active = true
            AND pv.available_quantity > 0
            AND (p_size IS NULL OR lower(pv.size) = lower(p_size))
            AND (p_colour IS NULL OR lower(pv.colour) = lower(p_colour))
      )
    ORDER BY
        CASE WHEN p.sale_price IS NOT NULL THEN 0 ELSE 1 END,
        COALESCE(p.sale_price, p.base_price) ASC
    LIMIT LEAST(p_limit, 50);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- get_or_create_customer() - Upserts a customer by WhatsApp ID
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_customer(
    p_whatsapp_id text,
    p_phone text DEFAULT NULL,
    p_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    v_customer_id uuid;
BEGIN
    -- Try to find existing customer
    SELECT id INTO v_customer_id
    FROM customers
    WHERE whatsapp_id = p_whatsapp_id;

    IF v_customer_id IS NOT NULL THEN
        -- Update last active and any new info
        UPDATE customers
        SET last_active_at = now(),
            phone_number = COALESCE(p_phone, phone_number),
            display_name = COALESCE(p_name, display_name),
            updated_at = now()
        WHERE id = v_customer_id;

        RETURN v_customer_id;
    END IF;

    -- Create new customer
    INSERT INTO customers (whatsapp_id, phone_number, display_name)
    VALUES (p_whatsapp_id, p_phone, p_name)
    ON CONFLICT (whatsapp_id) DO UPDATE
        SET last_active_at = now(),
            phone_number = COALESCE(EXCLUDED.phone_number, customers.phone_number),
            display_name = COALESCE(EXCLUDED.display_name, customers.display_name),
            updated_at = now()
    RETURNING id INTO v_customer_id;

    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
