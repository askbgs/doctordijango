# Production Readiness Checklist

Complete this checklist before serving real customers.

---

## Infrastructure

- [ ] n8n instance deployed with HTTPS
- [ ] n8n `N8N_ENCRYPTION_KEY` set to a unique, strong value (not the default)
- [ ] Admin dashboard deployed with HTTPS
- [ ] Supabase project on a paid plan (free tier pauses after inactivity)
- [ ] All services accessible and responding

## Environment Variables

- [ ] `META_WHATSAPP_ACCESS_TOKEN` — permanent system user token (not temporary)
- [ ] `META_PHONE_NUMBER_ID` — production phone number ID
- [ ] `META_WABA_ID` — correct WhatsApp Business Account ID
- [ ] `META_WEBHOOK_VERIFY_TOKEN` — strong random value
- [ ] `META_APP_SECRET` — correct app secret from Meta Console
- [ ] `WHATSAPP_API_VERSION` — current stable version
- [ ] `ANTHROPIC_API_KEY` — valid API key with sufficient credits
- [ ] `AI_MODEL` — desired model ID
- [ ] `SUPABASE_URL` — production project URL
- [ ] `SUPABASE_ANON_KEY` — production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — production service role key
- [ ] `STAFF_NOTIFICATION_WHATSAPP` — real staff phone number
- [ ] No placeholder or demo values remaining in `.env`

## Database

- [ ] All 4 migrations applied in order (001 through 004)
- [ ] All 15 tables created successfully
- [ ] Database functions created and tested
- [ ] RLS enabled on all tables (verify: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`)
- [ ] RLS policies active and tested
- [ ] Updated-at triggers active
- [ ] Order audit triggers active
- [ ] `order_ref_seq` sequence exists
- [ ] Demo/seed data replaced with real product catalog
- [ ] At least one admin staff user created

## WhatsApp Integration

- [ ] Meta Business account verified
- [ ] App reviewed and approved (if required)
- [ ] Production phone number registered and verified
- [ ] Webhook URL set and verified in Meta Console
- [ ] `messages` field subscribed in webhook configuration
- [ ] WhatsApp Business display name approved
- [ ] Business profile complete (photo, description, address, website)
- [ ] Message templates created and approved for:
  - [ ] Order confirmation
  - [ ] Order shipped
  - [ ] Order delivered
- [ ] Test message sent and received successfully
- [ ] Webhook signature verification working

## n8n Workflows

- [ ] All 7 workflows imported
- [ ] All workflows activated
- [ ] Workflow A (Webhook Receiver) — receiving and routing messages
- [ ] Workflow B (AI Conversation) — processing messages and responding
- [ ] Workflow C (Product Search) — returning real products
- [ ] Workflow D (Cart & Orders) — managing carts and placing orders
- [ ] Workflow E (Human Handover) — pausing AI and notifying staff
- [ ] Workflow F (Order Notifications) — sending status updates
- [ ] Workflow G (Error Handling) — catching and logging errors
- [ ] All environment variables accessible in n8n
- [ ] No hardcoded credentials in any workflow

## Admin Dashboard

- [ ] Login working with Supabase Auth
- [ ] Dashboard overview loading with real data
- [ ] Product catalog displaying correctly
- [ ] Add/edit product working
- [ ] Product variants and stock management working
- [ ] Orders list and detail pages working
- [ ] Order status updates sending customer notifications
- [ ] Customer list accessible
- [ ] Inbox showing conversations
- [ ] Manual reply from inbox sending via WhatsApp
- [ ] Human handover queue functional
- [ ] Settings page saving to database
- [ ] Unauthorized access blocked (test by accessing URLs without login)

## Security

- [ ] Supabase service role key is server-side only (never in browser code)
- [ ] Supabase anon key only exposes read-only active products
- [ ] Customer data isolation verified (Customer A cannot see Customer B's data)
- [ ] Webhook signature verification enabled
- [ ] Webhook deduplication working
- [ ] No API keys, tokens, or secrets in:
  - [ ] Git repository
  - [ ] n8n workflow exports
  - [ ] Client-side JavaScript
  - [ ] Error logs
  - [ ] Customer-facing messages
- [ ] Admin dashboard routes protected by authentication
- [ ] SQL injection protection: all queries use parameterized values
- [ ] Prompt injection: AI rejects attempts to override instructions
- [ ] Rate limiting in place for the webhook endpoint

## Testing

- [ ] All unit tests passing:
  - [ ] `node tests/unit/test-webhook-handler.js` — 22 tests
  - [ ] `node tests/unit/test-order-logic.js` — 48 tests
  - [ ] `node tests/unit/test-ai-response.js` — 41 tests
- [ ] Integration test scenarios completed (see `tests/integration/test-guide.md`):
  - [ ] New customer greeting
  - [ ] Tamil conversation
  - [ ] Sinhala conversation
  - [ ] Product search and filtering
  - [ ] Complete order flow
  - [ ] Human handover
  - [ ] Duplicate webhook handling
  - [ ] Error fallback responses

## Monitoring and Maintenance

- [ ] Error notifications reaching staff (WhatsApp or email)
- [ ] n8n execution history retention configured
- [ ] Supabase database backups enabled (automatic on paid plans)
- [ ] Log retention policy decided
- [ ] Health check workflow (Workflow G) running every 15 minutes
- [ ] Plan for rotating access tokens documented
- [ ] Escalation contacts defined for after-hours issues

## Business Configuration

- [ ] Shop name, address, contact details configured
- [ ] Business hours set
- [ ] Delivery areas and charges configured
- [ ] Payment methods enabled
- [ ] Bank details entered (if bank transfer accepted)
- [ ] Return policy written and saved
- [ ] Exchange policy written and saved
- [ ] AI tone and language settings configured
- [ ] Product catalog populated with real products and images
- [ ] Product images hosted on publicly accessible URLs
- [ ] Stock quantities accurate

## Legal and Compliance

- [ ] WhatsApp Business Platform Terms of Service accepted
- [ ] Privacy policy published and accessible
- [ ] Customer data handling complies with local regulations
- [ ] Opt-out mechanism available (customer can say "stop" or block the number)
- [ ] Business information accurate (no misleading claims by the AI)
- [ ] AI discloses it is an automated assistant when asked

---

## Go-Live Steps

1. Final review of this checklist — all items checked.
2. Run all automated tests one more time.
3. Send a test order from a staff phone — verify the complete flow.
4. Switch from test phone number to production phone number (if not already done).
5. Monitor the first 10 real customer interactions closely.
6. Keep staff available for manual handover during the first day.
7. Review error logs and audit logs after the first 24 hours.
