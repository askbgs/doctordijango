/**
 * Unit Tests: WhatsApp Webhook Handler
 * Run: node tests/unit/test-webhook-handler.js
 */

const assert = require('assert');
const crypto = require('crypto');

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_VERIFY_TOKEN = 'test_verify_token_12345';
const MOCK_APP_SECRET = 'test_app_secret_abcdef';

const MOCK_TEXT_MESSAGE_WEBHOOK = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '100000000000000',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '94771234567',
          phone_number_id: '200000000000000'
        },
        contacts: [{
          profile: { name: 'Kamal Perera' },
          wa_id: '94771111111'
        }],
        messages: [{
          from: '94771111111',
          id: 'wamid.ABCdef123456',
          timestamp: '1700000000',
          text: { body: 'Hi, I want to buy a T-shirt' },
          type: 'text'
        }]
      },
      field: 'messages'
    }]
  }]
};

const MOCK_STATUS_WEBHOOK = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '100000000000000',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '94771234567',
          phone_number_id: '200000000000000'
        },
        statuses: [{
          id: 'wamid.ABCdef789012',
          status: 'delivered',
          timestamp: '1700000001',
          recipient_id: '94771111111'
        }]
      },
      field: 'messages'
    }]
  }]
};

const MOCK_IMAGE_MESSAGE_WEBHOOK = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '100000000000000',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '94771234567',
          phone_number_id: '200000000000000'
        },
        contacts: [{
          profile: { name: 'Priya' },
          wa_id: '94772222222'
        }],
        messages: [{
          from: '94772222222',
          id: 'wamid.IMG123456',
          timestamp: '1700000002',
          type: 'image',
          image: {
            mime_type: 'image/jpeg',
            sha256: 'abc123',
            id: '1234567890'
          }
        }]
      },
      field: 'messages'
    }]
  }]
};

const MOCK_READ_RECEIPT = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '100000000000000',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '94771234567',
          phone_number_id: '200000000000000'
        },
        statuses: [{
          id: 'wamid.ABCdef789012',
          status: 'read',
          timestamp: '1700000005',
          recipient_id: '94771111111'
        }]
      },
      field: 'messages'
    }]
  }]
};

// ── Helper Functions (mirror production logic) ─────────────────────────────

function verifyWebhook(query, expectedToken) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === expectedToken) {
    return { status: 200, body: challenge };
  }
  return { status: 403, body: 'Forbidden' };
}

function normalizeMessage(payload) {
  if (!payload || payload.object !== 'whatsapp_business_account') {
    return { type: 'invalid', error: 'Not a WhatsApp Business webhook' };
  }

  const entry = payload.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value) {
    return { type: 'invalid', error: 'Missing value in webhook payload' };
  }

  if (value.messages && value.messages.length > 0) {
    const msg = value.messages[0];
    const contact = value.contacts?.[0];
    return {
      type: 'message',
      data: {
        wa_id: msg.from,
        message_id: msg.id,
        timestamp: msg.timestamp,
        message_type: msg.type,
        display_name: contact?.profile?.name || null,
        body: msg.text?.body || null,
        media: msg.image || msg.video || msg.audio || msg.document || null
      }
    };
  }

  if (value.statuses && value.statuses.length > 0) {
    const status = value.statuses[0];
    return {
      type: 'status',
      data: {
        message_id: status.id,
        status: status.status,
        timestamp: status.timestamp,
        recipient_id: status.recipient_id
      }
    };
  }

  return { type: 'unknown', error: 'Unrecognized webhook event' };
}

function verifySignature(payload, signature, appSecret) {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
  const receivedHash = signature.slice(7);
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(receivedHash, 'hex')
  );
}

const processedEvents = new Set();

function isDuplicate(messageId) {
  if (processedEvents.has(messageId)) {
    return true;
  }
  processedEvents.add(messageId);
  return false;
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

console.log('\n=== Webhook Verification ===\n');

test('accepts valid verify token and returns challenge', () => {
  const query = {
    'hub.mode': 'subscribe',
    'hub.verify_token': MOCK_VERIFY_TOKEN,
    'hub.challenge': 'challenge_string_123'
  };
  const result = verifyWebhook(query, MOCK_VERIFY_TOKEN);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.body, 'challenge_string_123');
});

test('rejects invalid verify token with 403', () => {
  const query = {
    'hub.mode': 'subscribe',
    'hub.verify_token': 'wrong_token',
    'hub.challenge': 'challenge_string_123'
  };
  const result = verifyWebhook(query, MOCK_VERIFY_TOKEN);
  assert.strictEqual(result.status, 403);
});

test('rejects missing hub.mode', () => {
  const query = {
    'hub.verify_token': MOCK_VERIFY_TOKEN,
    'hub.challenge': 'challenge_string_123'
  };
  const result = verifyWebhook(query, MOCK_VERIFY_TOKEN);
  assert.strictEqual(result.status, 403);
});

test('rejects wrong hub.mode', () => {
  const query = {
    'hub.mode': 'unsubscribe',
    'hub.verify_token': MOCK_VERIFY_TOKEN,
    'hub.challenge': 'challenge_string_123'
  };
  const result = verifyWebhook(query, MOCK_VERIFY_TOKEN);
  assert.strictEqual(result.status, 403);
});

console.log('\n=== Message Normalization ===\n');

test('extracts text message fields correctly', () => {
  const result = normalizeMessage(MOCK_TEXT_MESSAGE_WEBHOOK);
  assert.strictEqual(result.type, 'message');
  assert.strictEqual(result.data.wa_id, '94771111111');
  assert.strictEqual(result.data.message_id, 'wamid.ABCdef123456');
  assert.strictEqual(result.data.message_type, 'text');
  assert.strictEqual(result.data.body, 'Hi, I want to buy a T-shirt');
  assert.strictEqual(result.data.display_name, 'Kamal Perera');
  assert.strictEqual(result.data.timestamp, '1700000000');
});

test('extracts image message fields (body is null, media present)', () => {
  const result = normalizeMessage(MOCK_IMAGE_MESSAGE_WEBHOOK);
  assert.strictEqual(result.type, 'message');
  assert.strictEqual(result.data.wa_id, '94772222222');
  assert.strictEqual(result.data.message_type, 'image');
  assert.strictEqual(result.data.body, null);
  assert.ok(result.data.media);
  assert.strictEqual(result.data.media.mime_type, 'image/jpeg');
});

test('normalizes status update correctly', () => {
  const result = normalizeMessage(MOCK_STATUS_WEBHOOK);
  assert.strictEqual(result.type, 'status');
  assert.strictEqual(result.data.message_id, 'wamid.ABCdef789012');
  assert.strictEqual(result.data.status, 'delivered');
  assert.strictEqual(result.data.recipient_id, '94771111111');
});

test('normalizes read receipt correctly', () => {
  const result = normalizeMessage(MOCK_READ_RECEIPT);
  assert.strictEqual(result.type, 'status');
  assert.strictEqual(result.data.status, 'read');
});

console.log('\n=== Invalid Payloads ===\n');

test('rejects null payload', () => {
  const result = normalizeMessage(null);
  assert.strictEqual(result.type, 'invalid');
});

test('rejects non-WhatsApp object', () => {
  const result = normalizeMessage({ object: 'page' });
  assert.strictEqual(result.type, 'invalid');
});

test('handles empty entry array', () => {
  const result = normalizeMessage({
    object: 'whatsapp_business_account',
    entry: []
  });
  assert.strictEqual(result.type, 'invalid');
});

test('handles missing changes', () => {
  const result = normalizeMessage({
    object: 'whatsapp_business_account',
    entry: [{ id: '1' }]
  });
  assert.strictEqual(result.type, 'invalid');
});

test('handles missing messages and statuses (unknown event)', () => {
  const result = normalizeMessage({
    object: 'whatsapp_business_account',
    entry: [{
      id: '1',
      changes: [{ value: { messaging_product: 'whatsapp' }, field: 'messages' }]
    }]
  });
  assert.strictEqual(result.type, 'unknown');
});

console.log('\n=== Duplicate Detection ===\n');

test('first processing of a message returns false (not duplicate)', () => {
  processedEvents.clear();
  assert.strictEqual(isDuplicate('wamid.UNIQUE001'), false);
});

test('second processing of same message returns true (duplicate)', () => {
  assert.strictEqual(isDuplicate('wamid.UNIQUE001'), true);
});

test('different message IDs are not duplicates', () => {
  assert.strictEqual(isDuplicate('wamid.UNIQUE002'), false);
  assert.strictEqual(isDuplicate('wamid.UNIQUE003'), false);
});

test('rapid duplicate of same message is caught', () => {
  processedEvents.clear();
  isDuplicate('wamid.RAPID');
  isDuplicate('wamid.RAPID');
  isDuplicate('wamid.RAPID');
  assert.strictEqual(processedEvents.size, 1);
});

console.log('\n=== Signature Verification ===\n');

test('accepts valid HMAC-SHA256 signature', () => {
  const payloadStr = JSON.stringify(MOCK_TEXT_MESSAGE_WEBHOOK);
  const hash = crypto
    .createHmac('sha256', MOCK_APP_SECRET)
    .update(payloadStr)
    .digest('hex');
  const signature = `sha256=${hash}`;
  assert.strictEqual(verifySignature(payloadStr, signature, MOCK_APP_SECRET), true);
});

test('rejects tampered payload', () => {
  const payloadStr = JSON.stringify(MOCK_TEXT_MESSAGE_WEBHOOK);
  const hash = crypto
    .createHmac('sha256', MOCK_APP_SECRET)
    .update(payloadStr)
    .digest('hex');
  const signature = `sha256=${hash}`;
  const tamperedPayload = payloadStr.replace('T-shirt', 'HACKED');
  assert.strictEqual(verifySignature(tamperedPayload, signature, MOCK_APP_SECRET), false);
});

test('rejects missing signature', () => {
  assert.strictEqual(verifySignature('{}', null, MOCK_APP_SECRET), false);
  assert.strictEqual(verifySignature('{}', '', MOCK_APP_SECRET), false);
});

test('rejects signature without sha256= prefix', () => {
  assert.strictEqual(verifySignature('{}', 'invalid_signature', MOCK_APP_SECRET), false);
});

test('rejects wrong app secret', () => {
  const payloadStr = JSON.stringify(MOCK_TEXT_MESSAGE_WEBHOOK);
  const hash = crypto
    .createHmac('sha256', MOCK_APP_SECRET)
    .update(payloadStr)
    .digest('hex');
  const signature = `sha256=${hash}`;
  assert.strictEqual(verifySignature(payloadStr, signature, 'wrong_secret_key'), false);
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
