/**
 * Unit Tests: Order and Cart Business Logic
 * Run: node tests/unit/test-order-logic.js
 */

const assert = require('assert');

// ── Business Logic Functions (mirror production) ───────────────────────────

const DELIVERY_CHARGES = {
  colombo: 350,
  suburbs: 500,
  outstation: 750,
  free_threshold: 5000
};

const VALID_STATUS_TRANSITIONS = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'return_requested'],
  delivered: ['return_requested'],
  cancelled: [],
  return_requested: []
};

function calculateDeliveryCharge(area, subtotal) {
  if (subtotal >= DELIVERY_CHARGES.free_threshold) {
    return 0;
  }
  const areaLower = (area || '').toLowerCase();
  if (areaLower === 'colombo') return DELIVERY_CHARGES.colombo;
  if (['gampaha', 'kalutara', 'negombo'].includes(areaLower)) return DELIVERY_CHARGES.suburbs;
  return DELIVERY_CHARGES.outstation;
}

function calculateOrderTotal(items, deliveryArea, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.sale_price != null ? item.sale_price : item.base_price;
    return sum + (price * item.quantity);
  }, 0);
  const delivery = calculateDeliveryCharge(deliveryArea, subtotal);
  const discount = Math.min(discountAmount, subtotal);
  const total = subtotal + delivery - discount;
  return { subtotal, delivery, discount, total };
}

function validateStock(availableQty, reservedQty, requestedQty) {
  const effectiveStock = availableQty - reservedQty;
  return requestedQty > 0 && requestedQty <= effectiveStock;
}

function validatePrice(clientPrice, dbBasePrice, dbSalePrice) {
  const serverPrice = dbSalePrice != null ? dbSalePrice : dbBasePrice;
  return Math.abs(clientPrice - serverPrice) < 0.01;
}

function generateOrderRef(prefix, year, sequence) {
  const paddedSeq = String(sequence).padStart(6, '0');
  return `${prefix}-${year}-${paddedSeq}`;
}

function isValidStatusTransition(currentStatus, newStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

function addToCart(cart, variantId, quantity, unitPrice) {
  const existing = cart.find(item => item.variant_id === variantId);
  if (existing) {
    existing.quantity += quantity;
    return cart;
  }
  cart.push({ variant_id: variantId, quantity, unit_price: unitPrice });
  return cart;
}

function updateCartItem(cart, variantId, newQuantity) {
  if (newQuantity <= 0) {
    return cart.filter(item => item.variant_id !== variantId);
  }
  const item = cart.find(item => item.variant_id === variantId);
  if (item) item.quantity = newQuantity;
  return cart;
}

function removeFromCart(cart, variantId) {
  return cart.filter(item => item.variant_id !== variantId);
}

function reserveStock(variants, variantId, quantity) {
  const variant = variants.find(v => v.id === variantId);
  if (!variant) return { success: false, error: 'Variant not found' };
  const effective = variant.available_quantity - variant.reserved_quantity;
  if (quantity > effective) {
    return { success: false, error: 'Insufficient stock' };
  }
  variant.reserved_quantity += quantity;
  return { success: true };
}

// ── Tests ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

console.log('\n=== Order Total Calculation ===\n');

test('calculates subtotal from base prices', () => {
  const items = [
    { base_price: 1800, sale_price: null, quantity: 2 },
    { base_price: 3500, sale_price: null, quantity: 1 }
  ];
  const result = calculateOrderTotal(items, 'colombo');
  assert.strictEqual(result.subtotal, 7100);
});

test('uses sale price when available', () => {
  const items = [
    { base_price: 2200, sale_price: 1800, quantity: 1 }
  ];
  const result = calculateOrderTotal(items, 'colombo');
  assert.strictEqual(result.subtotal, 1800);
});

test('adds delivery charge to total', () => {
  const items = [
    { base_price: 2000, sale_price: null, quantity: 1 }
  ];
  const result = calculateOrderTotal(items, 'colombo');
  assert.strictEqual(result.delivery, 350);
  assert.strictEqual(result.total, 2350);
});

test('subtracts discount from total', () => {
  const items = [
    { base_price: 3000, sale_price: null, quantity: 1 }
  ];
  const result = calculateOrderTotal(items, 'colombo', 500);
  assert.strictEqual(result.discount, 500);
  assert.strictEqual(result.total, 2850);
});

test('discount cannot exceed subtotal', () => {
  const items = [
    { base_price: 500, sale_price: null, quantity: 1 }
  ];
  const result = calculateOrderTotal(items, 'colombo', 1000);
  assert.strictEqual(result.discount, 500);
  assert.strictEqual(result.total, 350);
});

console.log('\n=== Delivery Charge Calculation ===\n');

test('Colombo delivery costs LKR 350', () => {
  assert.strictEqual(calculateDeliveryCharge('Colombo', 1000), 350);
});

test('Colombo is case-insensitive', () => {
  assert.strictEqual(calculateDeliveryCharge('COLOMBO', 1000), 350);
});

test('suburb areas cost LKR 500', () => {
  assert.strictEqual(calculateDeliveryCharge('Gampaha', 1000), 500);
  assert.strictEqual(calculateDeliveryCharge('Kalutara', 1000), 500);
  assert.strictEqual(calculateDeliveryCharge('Negombo', 1000), 500);
});

test('outstation areas cost LKR 750', () => {
  assert.strictEqual(calculateDeliveryCharge('Kandy', 1000), 750);
  assert.strictEqual(calculateDeliveryCharge('Galle', 1000), 750);
  assert.strictEqual(calculateDeliveryCharge('Jaffna', 1000), 750);
});

test('free delivery for orders >= LKR 5000', () => {
  assert.strictEqual(calculateDeliveryCharge('Colombo', 5000), 0);
  assert.strictEqual(calculateDeliveryCharge('Kandy', 6000), 0);
});

test('delivery charged at LKR 4999', () => {
  assert.strictEqual(calculateDeliveryCharge('Colombo', 4999), 350);
});

test('unknown area defaults to outstation', () => {
  assert.strictEqual(calculateDeliveryCharge('Unknown Place', 1000), 750);
});

test('empty area defaults to outstation', () => {
  assert.strictEqual(calculateDeliveryCharge('', 1000), 750);
  assert.strictEqual(calculateDeliveryCharge(null, 1000), 750);
});

console.log('\n=== Stock Validation ===\n');

test('accepts order within available stock', () => {
  assert.strictEqual(validateStock(10, 0, 5), true);
});

test('accepts order for all available stock', () => {
  assert.strictEqual(validateStock(10, 0, 10), true);
});

test('rejects order exceeding available stock', () => {
  assert.strictEqual(validateStock(10, 0, 11), false);
});

test('accounts for reserved quantity', () => {
  assert.strictEqual(validateStock(10, 8, 3), false);
  assert.strictEqual(validateStock(10, 8, 2), true);
});

test('rejects zero quantity', () => {
  assert.strictEqual(validateStock(10, 0, 0), false);
});

test('rejects negative quantity', () => {
  assert.strictEqual(validateStock(10, 0, -1), false);
});

test('rejects when all stock is reserved', () => {
  assert.strictEqual(validateStock(5, 5, 1), false);
});

console.log('\n=== Price Validation ===\n');

test('accepts matching base price', () => {
  assert.strictEqual(validatePrice(1800, 1800, null), true);
});

test('accepts matching sale price', () => {
  assert.strictEqual(validatePrice(1500, 2000, 1500), true);
});

test('rejects mismatched price (client uses base, DB has sale)', () => {
  assert.strictEqual(validatePrice(2000, 2000, 1500), false);
});

test('rejects completely wrong price', () => {
  assert.strictEqual(validatePrice(100, 1800, null), false);
});

test('handles floating point within tolerance', () => {
  assert.strictEqual(validatePrice(1800.004, 1800.00, null), true);
});

console.log('\n=== Order Reference Generation ===\n');

test('generates correct format CLT-YYYY-NNNNNN', () => {
  const ref = generateOrderRef('CLT', 2026, 1);
  assert.strictEqual(ref, 'CLT-2026-000001');
});

test('pads sequence number to 6 digits', () => {
  assert.strictEqual(generateOrderRef('CLT', 2026, 42), 'CLT-2026-000042');
  assert.strictEqual(generateOrderRef('CLT', 2026, 999999), 'CLT-2026-999999');
});

test('works with different prefixes', () => {
  assert.strictEqual(generateOrderRef('FH', 2026, 100), 'FH-2026-000100');
});

console.log('\n=== Order Status Transitions ===\n');

test('pending_confirmation → confirmed is valid', () => {
  assert.strictEqual(isValidStatusTransition('pending_confirmation', 'confirmed'), true);
});

test('pending_confirmation → cancelled is valid', () => {
  assert.strictEqual(isValidStatusTransition('pending_confirmation', 'cancelled'), true);
});

test('pending_confirmation → shipped is invalid (skip steps)', () => {
  assert.strictEqual(isValidStatusTransition('pending_confirmation', 'shipped'), false);
});

test('confirmed → processing is valid', () => {
  assert.strictEqual(isValidStatusTransition('confirmed', 'processing'), true);
});

test('shipped → delivered is valid', () => {
  assert.strictEqual(isValidStatusTransition('shipped', 'delivered'), true);
});

test('delivered → return_requested is valid', () => {
  assert.strictEqual(isValidStatusTransition('delivered', 'return_requested'), true);
});

test('cancelled → any status is invalid (terminal state)', () => {
  assert.strictEqual(isValidStatusTransition('cancelled', 'confirmed'), false);
  assert.strictEqual(isValidStatusTransition('cancelled', 'pending_confirmation'), false);
});

test('delivered → cancelled is invalid', () => {
  assert.strictEqual(isValidStatusTransition('delivered', 'cancelled'), false);
});

test('unknown status returns false', () => {
  assert.strictEqual(isValidStatusTransition('nonexistent', 'confirmed'), false);
});

console.log('\n=== Cart Management ===\n');

test('adds item to empty cart', () => {
  const cart = addToCart([], 'v1', 2, 1800);
  assert.strictEqual(cart.length, 1);
  assert.strictEqual(cart[0].variant_id, 'v1');
  assert.strictEqual(cart[0].quantity, 2);
});

test('increases quantity for existing item', () => {
  let cart = addToCart([], 'v1', 2, 1800);
  cart = addToCart(cart, 'v1', 3, 1800);
  assert.strictEqual(cart.length, 1);
  assert.strictEqual(cart[0].quantity, 5);
});

test('adds different items separately', () => {
  let cart = addToCart([], 'v1', 1, 1800);
  cart = addToCart(cart, 'v2', 2, 3500);
  assert.strictEqual(cart.length, 2);
});

test('updates cart item quantity', () => {
  let cart = addToCart([], 'v1', 5, 1800);
  cart = updateCartItem(cart, 'v1', 3);
  assert.strictEqual(cart[0].quantity, 3);
});

test('removes item when quantity set to 0', () => {
  let cart = addToCart([], 'v1', 5, 1800);
  cart = updateCartItem(cart, 'v1', 0);
  assert.strictEqual(cart.length, 0);
});

test('removes specific item from cart', () => {
  let cart = addToCart([], 'v1', 1, 1800);
  cart = addToCart(cart, 'v2', 2, 3500);
  cart = removeFromCart(cart, 'v1');
  assert.strictEqual(cart.length, 1);
  assert.strictEqual(cart[0].variant_id, 'v2');
});

test('removing non-existent item is a no-op', () => {
  let cart = addToCart([], 'v1', 1, 1800);
  cart = removeFromCart(cart, 'v999');
  assert.strictEqual(cart.length, 1);
});

console.log('\n=== Concurrent Stock Reservation ===\n');

test('first reservation succeeds for last items', () => {
  const variants = [
    { id: 'v1', available_quantity: 2, reserved_quantity: 0 }
  ];
  const result = reserveStock(variants, 'v1', 2);
  assert.strictEqual(result.success, true);
  assert.strictEqual(variants[0].reserved_quantity, 2);
});

test('second reservation fails when stock fully reserved', () => {
  const variants = [
    { id: 'v1', available_quantity: 2, reserved_quantity: 2 }
  ];
  const result = reserveStock(variants, 'v1', 1);
  assert.strictEqual(result.success, false);
});

test('partial reservation scenario: two buyers, one item', () => {
  const variants = [
    { id: 'v1', available_quantity: 1, reserved_quantity: 0 }
  ];
  const buyer1 = reserveStock(variants, 'v1', 1);
  assert.strictEqual(buyer1.success, true);

  const buyer2 = reserveStock(variants, 'v1', 1);
  assert.strictEqual(buyer2.success, false);
});

test('reservation for non-existent variant fails', () => {
  const variants = [
    { id: 'v1', available_quantity: 10, reserved_quantity: 0 }
  ];
  const result = reserveStock(variants, 'v_missing', 1);
  assert.strictEqual(result.success, false);
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
