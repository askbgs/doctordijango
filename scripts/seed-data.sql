-- =============================================================================
-- DEMO SEED DATA - WhatsApp AI Sales Agent for Clothing Shop
-- =============================================================================
-- This is DEMO DATA for development and testing purposes only.
-- All products, brands, and prices are fictional examples.
-- Run this after all migrations have been applied.
-- =============================================================================

-- Shop Settings
INSERT INTO shop_settings (id, key, value, description) VALUES
  (gen_random_uuid(), 'shop_name', '"Fashion House"', 'Business name'),
  (gen_random_uuid(), 'shop_tagline', '"Your Style, Our Passion"', 'Shop tagline'),
  (gen_random_uuid(), 'shop_currency', '"LKR"', 'Currency code'),
  (gen_random_uuid(), 'shop_country', '"LK"', 'Country code'),
  (gen_random_uuid(), 'shop_address', '"No. 45, Galle Road, Colombo 03, Sri Lanka"', 'Physical address'),
  (gen_random_uuid(), 'shop_phone', '"+94771234567"', 'Contact phone'),
  (gen_random_uuid(), 'shop_email', '"hello@fashionhouse.lk"', 'Contact email'),
  (gen_random_uuid(), 'business_hours', '{"weekdays": "9:00 AM - 8:00 PM", "saturday": "9:00 AM - 6:00 PM", "sunday": "10:00 AM - 4:00 PM"}', 'Operating hours'),
  (gen_random_uuid(), 'supported_languages', '["en", "ta", "si"]', 'Languages the agent supports'),
  (gen_random_uuid(), 'default_language', '"en"', 'Default response language'),
  (gen_random_uuid(), 'delivery_areas', '["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Kurunegala", "Negombo", "Jaffna", "Batticaloa"]', 'Areas we deliver to'),
  (gen_random_uuid(), 'delivery_charges', '{"colombo": 350, "suburbs": 500, "outstation": 750, "free_threshold": 5000}', 'Delivery charges in LKR'),
  (gen_random_uuid(), 'payment_methods', '["cash_on_delivery", "bank_transfer"]', 'Accepted payment methods'),
  (gen_random_uuid(), 'bank_details', '{"bank": "Commercial Bank", "branch": "Colombo 03", "account": "1234567890", "name": "Fashion House (Pvt) Ltd"}', 'Bank transfer details'),
  (gen_random_uuid(), 'return_policy', '"Items can be returned within 7 days of delivery in original condition with tags attached. Underwear, swimwear, and altered items cannot be returned."', 'Return policy'),
  (gen_random_uuid(), 'exchange_policy', '"Size exchanges are free within 7 days. Colour exchanges subject to availability. Customer pays return shipping for exchanges."', 'Exchange policy'),
  (gen_random_uuid(), 'ai_tone', '"friendly_professional"', 'AI agent personality'),
  (gen_random_uuid(), 'order_prefix', '"CLT"', 'Order reference prefix'),
  (gen_random_uuid(), 'handover_notification', '"+94771234567"', 'Staff WhatsApp for handover alerts')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================================================
-- DEMO PRODUCTS
-- =============================================================================

-- T-Shirts
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'TS-001', 'Classic Cotton Crew Tee', 'Soft 100% cotton crew neck T-shirt. Perfect for everyday wear.', 'tshirts', 'Urban Basics', 'men', 1800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/333/fff?text=Classic+Tee'], ARRAY['casual', 'cotton', 'everyday'], true),
  ('a1000000-0000-0000-0000-000000000002', 'TS-002', 'Graphic Print Street Tee', 'Bold graphic print T-shirt with modern street style design.', 'tshirts', 'Street Co', 'men', 2200.00, 1800.00, 'LKR', ARRAY['https://placehold.co/400x500/222/fff?text=Graphic+Tee'], ARRAY['casual', 'graphic', 'streetwear'], true),
  ('a1000000-0000-0000-0000-000000000003', 'TS-003', 'Relaxed Fit V-Neck Tee', 'Comfortable relaxed-fit V-neck in premium cotton blend.', 'tshirts', 'Urban Basics', 'women', 1600.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/pink/fff?text=V-Neck+Tee'], ARRAY['casual', 'comfortable', 'vneck'], true),
  ('a1000000-0000-0000-0000-000000000004', 'TS-004', 'Premium Polo Shirt', 'Classic polo with embroidered logo. Smart casual essential.', 'tshirts', 'Ceylon Style', 'men', 3200.00, 2800.00, 'LKR', ARRAY['https://placehold.co/400x500/navy/fff?text=Polo+Shirt'], ARRAY['smart_casual', 'polo', 'premium'], true);

-- Shirts
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a2000000-0000-0000-0000-000000000001', 'SH-001', 'Oxford Button-Down Shirt', 'Classic Oxford cloth button-down. Perfect for office or weekend.', 'shirts', 'Ceylon Style', 'men', 3500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/lightblue/333?text=Oxford+Shirt'], ARRAY['formal', 'office', 'oxford'], true),
  ('a2000000-0000-0000-0000-000000000002', 'SH-002', 'Linen Casual Shirt', 'Breathable pure linen shirt. Ideal for Sri Lankan weather.', 'shirts', 'Island Wear', 'men', 4200.00, 3600.00, 'LKR', ARRAY['https://placehold.co/400x500/beige/333?text=Linen+Shirt'], ARRAY['casual', 'linen', 'summer'], true),
  ('a2000000-0000-0000-0000-000000000003', 'SH-003', 'Floral Print Blouse', 'Elegant floral print blouse with flutter sleeves.', 'shirts', 'Liya Fashion', 'women', 2800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/floral/fff?text=Floral+Blouse'], ARRAY['casual', 'floral', 'elegant'], true);

-- Trousers
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a3000000-0000-0000-0000-000000000001', 'TR-001', 'Slim Fit Chinos', 'Modern slim fit chinos in stretch cotton. Comfortable all day.', 'trousers', 'Urban Basics', 'men', 3800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/khaki/333?text=Chinos'], ARRAY['smart_casual', 'chinos', 'slim_fit'], true),
  ('a3000000-0000-0000-0000-000000000002', 'TR-002', 'Formal Dress Trousers', 'Tailored formal trousers with crease front. Office essential.', 'trousers', 'Ceylon Style', 'men', 4500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/charcoal/fff?text=Formal+Trousers'], ARRAY['formal', 'office', 'tailored'], true),
  ('a3000000-0000-0000-0000-000000000003', 'TR-003', 'Wide Leg Palazzo Pants', 'Flowing wide-leg palazzo pants. Chic and comfortable.', 'trousers', 'Liya Fashion', 'women', 3200.00, 2600.00, 'LKR', ARRAY['https://placehold.co/400x500/olive/fff?text=Palazzo+Pants'], ARRAY['casual', 'wide_leg', 'comfortable'], true);

-- Jeans
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a4000000-0000-0000-0000-000000000001', 'JN-001', 'Classic Straight Fit Jeans', 'Durable classic straight fit denim. Timeless style.', 'jeans', 'Street Co', 'men', 4200.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/denim/fff?text=Straight+Jeans'], ARRAY['casual', 'denim', 'classic'], true),
  ('a4000000-0000-0000-0000-000000000002', 'JN-002', 'Skinny Stretch Jeans', 'Super stretch skinny jeans for ultimate comfort and style.', 'jeans', 'Street Co', 'women', 3800.00, 3200.00, 'LKR', ARRAY['https://placehold.co/400x500/indigo/fff?text=Skinny+Jeans'], ARRAY['casual', 'skinny', 'stretch'], true),
  ('a4000000-0000-0000-0000-000000000003', 'JN-003', 'Ripped Slim Fit Jeans', 'Trendy ripped detail slim fit jeans.', 'jeans', 'Street Co', 'unisex', 4500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/blue/fff?text=Ripped+Jeans'], ARRAY['trendy', 'ripped', 'slim_fit'], true);

-- Dresses
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a5000000-0000-0000-0000-000000000001', 'DR-001', 'Floral Maxi Dress', 'Beautiful floral print maxi dress. Perfect for any occasion.', 'dresses', 'Liya Fashion', 'women', 4800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/rose/fff?text=Maxi+Dress'], ARRAY['party', 'floral', 'maxi'], true),
  ('a5000000-0000-0000-0000-000000000002', 'DR-002', 'Elegant Cocktail Dress', 'Sleek cocktail dress for evening events. Understated glamour.', 'dresses', 'Liya Fashion', 'women', 6500.00, 5200.00, 'LKR', ARRAY['https://placehold.co/400x500/black/fff?text=Cocktail+Dress'], ARRAY['party', 'evening', 'elegant'], true),
  ('a5000000-0000-0000-0000-000000000003', 'DR-003', 'Casual Sundress', 'Light and breezy cotton sundress for tropical days.', 'dresses', 'Island Wear', 'women', 2800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/yellow/333?text=Sundress'], ARRAY['casual', 'summer', 'cotton'], true);

-- Sarees
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a6000000-0000-0000-0000-000000000001', 'SA-001', 'Handloom Cotton Saree', 'Traditional Sri Lankan handloom saree. Pure cotton with intricate border.', 'sarees', 'Lanka Handloom', 'women', 5500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/saffron/fff?text=Handloom+Saree'], ARRAY['traditional', 'handloom', 'cotton'], true),
  ('a6000000-0000-0000-0000-000000000002', 'SA-002', 'Silk Party Saree', 'Luxurious silk saree with gold zari border. Perfect for weddings.', 'sarees', 'Lanka Handloom', 'women', 12500.00, 10500.00, 'LKR', ARRAY['https://placehold.co/400x500/purple/gold?text=Silk+Saree'], ARRAY['wedding', 'silk', 'party', 'premium'], true),
  ('a6000000-0000-0000-0000-000000000003', 'SA-003', 'Modern Printed Saree', 'Contemporary printed saree with matching blouse piece.', 'sarees', 'Liya Fashion', 'women', 3800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/teal/fff?text=Printed+Saree'], ARRAY['casual', 'modern', 'printed'], true);

-- Kidswear
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a7000000-0000-0000-0000-000000000001', 'KW-001', 'Kids Fun Print T-Shirt', 'Colorful printed T-shirt for kids. 100% soft cotton.', 'kidswear', 'Little Stars', 'kids', 1200.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/orange/fff?text=Kids+Tee'], ARRAY['kids', 'casual', 'cotton'], true),
  ('a7000000-0000-0000-0000-000000000002', 'KW-002', 'Kids Denim Shorts', 'Durable denim shorts for active kids. Adjustable waist.', 'kidswear', 'Little Stars', 'kids', 1800.00, 1500.00, 'LKR', ARRAY['https://placehold.co/400x500/denim/fff?text=Kids+Shorts'], ARRAY['kids', 'denim', 'shorts'], true),
  ('a7000000-0000-0000-0000-000000000003', 'KW-003', 'Girls Party Frock', 'Adorable party frock with bow detail and tulle skirt.', 'kidswear', 'Little Stars', 'kids', 2500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/pink/fff?text=Party+Frock'], ARRAY['kids', 'party', 'girls'], true);

-- Sportswear
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a8000000-0000-0000-0000-000000000001', 'SP-001', 'Dry-Fit Sports Tee', 'Moisture-wicking sports T-shirt. Stay cool during workouts.', 'sportswear', 'Active Lanka', 'unisex', 2200.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/lime/333?text=Sports+Tee'], ARRAY['sports', 'gym', 'dryfit'], true),
  ('a8000000-0000-0000-0000-000000000002', 'SP-002', 'Running Shorts', 'Lightweight running shorts with inner brief. Reflective details.', 'sportswear', 'Active Lanka', 'men', 1800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/gray/fff?text=Running+Shorts'], ARRAY['sports', 'running', 'shorts'], true),
  ('a8000000-0000-0000-0000-000000000003', 'SP-003', 'Yoga Leggings', 'High-waist yoga leggings with phone pocket. 4-way stretch.', 'sportswear', 'Active Lanka', 'women', 2800.00, 2400.00, 'LKR', ARRAY['https://placehold.co/400x500/purple/fff?text=Yoga+Leggings'], ARRAY['sports', 'yoga', 'leggings'], true);

-- Accessories
INSERT INTO products (id, sku, name, description, category, brand, gender, base_price, sale_price, currency, image_urls, tags, is_active) VALUES
  ('a9000000-0000-0000-0000-000000000001', 'AC-001', 'Leather Belt', 'Genuine leather belt with brushed metal buckle.', 'accessories', 'Ceylon Style', 'men', 1500.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/brown/fff?text=Leather+Belt'], ARRAY['accessories', 'leather', 'belt'], true),
  ('a9000000-0000-0000-0000-000000000002', 'AC-002', 'Cotton Scarf', 'Lightweight cotton scarf. Versatile styling accessory.', 'accessories', 'Island Wear', 'women', 1200.00, 900.00, 'LKR', ARRAY['https://placehold.co/400x500/coral/fff?text=Cotton+Scarf'], ARRAY['accessories', 'scarf', 'cotton'], true),
  ('a9000000-0000-0000-0000-000000000003', 'AC-003', 'Canvas Tote Bag', 'Eco-friendly canvas tote bag with zip closure.', 'accessories', 'Urban Basics', 'unisex', 1800.00, NULL, 'LKR', ARRAY['https://placehold.co/400x500/natural/333?text=Tote+Bag'], ARRAY['accessories', 'bag', 'canvas', 'eco'], true);

-- =============================================================================
-- PRODUCT VARIANTS (sizes, colours, stock)
-- =============================================================================

-- Classic Cotton Crew Tee (TS-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'S', 'Black', 'TS-001-S-BLK', 15, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'M', 'Black', 'TS-001-M-BLK', 25, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'L', 'Black', 'TS-001-L-BLK', 20, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'XL', 'Black', 'TS-001-XL-BLK', 10, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'M', 'White', 'TS-001-M-WHT', 30, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'L', 'White', 'TS-001-L-WHT', 20, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'M', 'Navy', 'TS-001-M-NAV', 18, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'L', 'Navy', 'TS-001-L-NAV', 12, 0, true);

-- Graphic Print Street Tee (TS-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'S', 'Black', 'TS-002-S-BLK', 8, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'M', 'Black', 'TS-002-M-BLK', 12, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'L', 'Black', 'TS-002-L-BLK', 10, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'M', 'White', 'TS-002-M-WHT', 0, 0, true); -- OUT OF STOCK

-- V-Neck Tee (TS-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'S', 'Pink', 'TS-003-S-PNK', 20, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'M', 'Pink', 'TS-003-M-PNK', 15, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'L', 'Pink', 'TS-003-L-PNK', 10, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'S', 'White', 'TS-003-S-WHT', 18, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'M', 'White', 'TS-003-M-WHT', 22, 0, true);

-- Polo Shirt (TS-004) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'M', 'Navy', 'TS-004-M-NAV', 10, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'L', 'Navy', 'TS-004-L-NAV', 8, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'XL', 'Navy', 'TS-004-XL-NAV', 5, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'M', 'White', 'TS-004-M-WHT', 12, 0, true),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'L', 'White', 'TS-004-L-WHT', 10, 0, true);

-- Oxford Shirt (SH-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'M', 'Light Blue', 'SH-001-M-LBL', 15, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'L', 'Light Blue', 'SH-001-L-LBL', 12, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'XL', 'Light Blue', 'SH-001-XL-LBL', 8, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'M', 'White', 'SH-001-M-WHT', 18, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'L', 'White', 'SH-001-L-WHT', 14, 0, true);

-- Linen Shirt (SH-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000002', 'M', 'Beige', 'SH-002-M-BEG', 10, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000002', 'L', 'Beige', 'SH-002-L-BEG', 8, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000002', 'M', 'White', 'SH-002-M-WHT', 12, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000002', 'L', 'White', 'SH-002-L-WHT', 0, 0, true); -- OUT OF STOCK

-- Floral Blouse (SH-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000003', 'S', 'Blue Floral', 'SH-003-S-BFL', 14, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000003', 'M', 'Blue Floral', 'SH-003-M-BFL', 18, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000003', 'L', 'Blue Floral', 'SH-003-L-BFL', 10, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000003', 'S', 'Pink Floral', 'SH-003-S-PFL', 16, 0, true),
  (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000003', 'M', 'Pink Floral', 'SH-003-M-PFL', 12, 0, true);

-- Chinos (TR-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', '30', 'Khaki', 'TR-001-30-KHK', 10, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', '32', 'Khaki', 'TR-001-32-KHK', 15, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', '34', 'Khaki', 'TR-001-34-KHK', 12, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', '32', 'Navy', 'TR-001-32-NAV', 10, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', '34', 'Navy', 'TR-001-34-NAV', 8, 0, true);

-- Formal Trousers (TR-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000002', '32', 'Charcoal', 'TR-002-32-CHL', 10, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000002', '34', 'Charcoal', 'TR-002-34-CHL', 12, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000002', '36', 'Charcoal', 'TR-002-36-CHL', 8, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000002', '32', 'Black', 'TR-002-32-BLK', 14, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000002', '34', 'Black', 'TR-002-34-BLK', 10, 0, true);

-- Palazzo Pants (TR-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000003', 'S', 'Olive', 'TR-003-S-OLV', 8, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000003', 'M', 'Olive', 'TR-003-M-OLV', 12, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000003', 'L', 'Olive', 'TR-003-L-OLV', 6, 0, true),
  (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000003', 'M', 'Black', 'TR-003-M-BLK', 10, 0, true);

-- Straight Jeans (JN-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', '30', 'Blue', 'JN-001-30-BLU', 10, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', '32', 'Blue', 'JN-001-32-BLU', 18, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', '34', 'Blue', 'JN-001-34-BLU', 14, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', '32', 'Dark Blue', 'JN-001-32-DBL', 12, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', '34', 'Dark Blue', 'JN-001-34-DBL', 10, 0, true);

-- Skinny Jeans (JN-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000002', '26', 'Indigo', 'JN-002-26-IND', 8, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000002', '28', 'Indigo', 'JN-002-28-IND', 12, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000002', '30', 'Indigo', 'JN-002-30-IND', 10, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000002', '28', 'Black', 'JN-002-28-BLK', 14, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000002', '30', 'Black', 'JN-002-30-BLK', 0, 0, true); -- OUT OF STOCK

-- Ripped Jeans (JN-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000003', '30', 'Light Blue', 'JN-003-30-LBL', 6, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000003', '32', 'Light Blue', 'JN-003-32-LBL', 10, 0, true),
  (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000003', '34', 'Light Blue', 'JN-003-34-LBL', 8, 0, true);

-- Maxi Dress (DR-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'S', 'Rose', 'DR-001-S-RSE', 6, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'M', 'Rose', 'DR-001-M-RSE', 10, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'L', 'Rose', 'DR-001-L-RSE', 8, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'M', 'Blue', 'DR-001-M-BLU', 5, 0, true);

-- Cocktail Dress (DR-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000002', 'S', 'Black', 'DR-002-S-BLK', 4, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000002', 'M', 'Black', 'DR-002-M-BLK', 6, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000002', 'L', 'Black', 'DR-002-L-BLK', 3, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000002', 'M', 'Red', 'DR-002-M-RED', 4, 0, true);

-- Sundress (DR-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000003', 'S', 'Yellow', 'DR-003-S-YLW', 12, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000003', 'M', 'Yellow', 'DR-003-M-YLW', 15, 0, true),
  (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000003', 'L', 'Yellow', 'DR-003-L-YLW', 10, 0, true);

-- Handloom Saree (SA-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'Free', 'Saffron', 'SA-001-F-SAF', 8, 0, true),
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'Free', 'Maroon', 'SA-001-F-MRN', 6, 0, true),
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'Free', 'Green', 'SA-001-F-GRN', 10, 0, true);

-- Silk Saree (SA-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000002', 'Free', 'Purple & Gold', 'SA-002-F-PGD', 3, 0, true),
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000002', 'Free', 'Red & Gold', 'SA-002-F-RGD', 4, 0, true),
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000002', 'Free', 'Blue & Silver', 'SA-002-F-BSV', 2, 0, true);

-- Printed Saree (SA-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000003', 'Free', 'Teal', 'SA-003-F-TEL', 15, 0, true),
  (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000003', 'Free', 'Coral', 'SA-003-F-CRL', 12, 0, true);

-- Kids Fun Tee (KW-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', '2-3Y', 'Orange', 'KW-001-23-ORG', 20, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', '4-5Y', 'Orange', 'KW-001-45-ORG', 18, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', '6-7Y', 'Orange', 'KW-001-67-ORG', 15, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', '4-5Y', 'Blue', 'KW-001-45-BLU', 16, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', '6-7Y', 'Blue', 'KW-001-67-BLU', 14, 0, true);

-- Kids Denim Shorts (KW-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000002', '4-5Y', 'Blue', 'KW-002-45-BLU', 10, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000002', '6-7Y', 'Blue', 'KW-002-67-BLU', 12, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000002', '8-9Y', 'Blue', 'KW-002-89-BLU', 8, 0, true);

-- Party Frock (KW-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000003', '2-3Y', 'Pink', 'KW-003-23-PNK', 6, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000003', '4-5Y', 'Pink', 'KW-003-45-PNK', 8, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000003', '6-7Y', 'Pink', 'KW-003-67-PNK', 5, 0, true),
  (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000003', '4-5Y', 'White', 'KW-003-45-WHT', 7, 0, true);

-- Sports Tee (SP-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', 'S', 'Lime', 'SP-001-S-LME', 12, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', 'M', 'Lime', 'SP-001-M-LME', 18, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', 'L', 'Lime', 'SP-001-L-LME', 15, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', 'M', 'Black', 'SP-001-M-BLK', 20, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', 'L', 'Black', 'SP-001-L-BLK', 16, 0, true);

-- Running Shorts (SP-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000002', 'M', 'Grey', 'SP-002-M-GRY', 14, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000002', 'L', 'Grey', 'SP-002-L-GRY', 10, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000002', 'M', 'Black', 'SP-002-M-BLK', 16, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000002', 'L', 'Black', 'SP-002-L-BLK', 12, 0, true);

-- Yoga Leggings (SP-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000003', 'S', 'Purple', 'SP-003-S-PRP', 10, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000003', 'M', 'Purple', 'SP-003-M-PRP', 14, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000003', 'L', 'Purple', 'SP-003-L-PRP', 8, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000003', 'M', 'Black', 'SP-003-M-BLK', 18, 0, true),
  (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000003', 'L', 'Black', 'SP-003-L-BLK', 12, 0, true);

-- Leather Belt (AC-001) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'M', 'Brown', 'AC-001-M-BRN', 20, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'L', 'Brown', 'AC-001-L-BRN', 15, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'M', 'Black', 'AC-001-M-BLK', 18, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'L', 'Black', 'AC-001-L-BLK', 14, 0, true);

-- Cotton Scarf (AC-002) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000002', 'Free', 'Coral', 'AC-002-F-CRL', 25, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000002', 'Free', 'Navy', 'AC-002-F-NAV', 20, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000002', 'Free', 'White', 'AC-002-F-WHT', 22, 0, true);

-- Tote Bag (AC-003) variants
INSERT INTO product_variants (id, product_id, size, colour, sku, available_quantity, reserved_quantity, is_active) VALUES
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000003', 'Free', 'Natural', 'AC-003-F-NAT', 30, 0, true),
  (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000003', 'Free', 'Black', 'AC-003-F-BLK', 25, 0, true);

-- =============================================================================
-- DEMO CUSTOMERS (for testing)
-- =============================================================================
INSERT INTO customers (id, whatsapp_id, phone_number, display_name, preferred_language) VALUES
  ('c1000000-0000-0000-0000-000000000001', '94771111111', '+94771111111', 'Kamal Perera', 'si'),
  ('c1000000-0000-0000-0000-000000000002', '94772222222', '+94772222222', 'Priya Selvam', 'ta'),
  ('c1000000-0000-0000-0000-000000000003', '94773333333', '+94773333333', 'John Silva', 'en');
