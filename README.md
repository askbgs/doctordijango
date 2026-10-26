# WhatsApp AI Sales Agent for Clothing Retail

An AI-powered WhatsApp sales assistant for clothing shops in Sri Lanka, built with **n8n**, **Supabase**, **Next.js**, and the **Meta WhatsApp Cloud API**. The agent communicates naturally with customers in English, Tamil, and Sinhala — helping them browse products, select sizes, and place orders.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Customer    │────▶│  Meta Cloud  │────▶│  n8n         │
│  (WhatsApp)  │◀────│  API         │◀────│  Workflows   │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         │                      │                      │
                         ▼                      ▼                      ▼
                  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                  │  Anthropic   │     │  Supabase    │     │  Admin       │
                  │  Claude API  │     │  PostgreSQL  │     │  Dashboard   │
                  │  (AI Agent)  │     │  (Database)  │     │  (Next.js)   │
                  └──────────────┘     └──────────────┘     └──────────────┘
```

### Flow

1. Customer sends a WhatsApp message.
2. Meta delivers it to n8n via webhook.
3. n8n identifies the customer, retrieves conversation history, and queries product data from Supabase.
4. The AI agent (Claude) generates a response using product data, cart state, and conversation context.
5. n8n sends the reply back through the WhatsApp Cloud API.
6. Orders, messages, and events are persisted in Supabase.
7. Shop staff manage everything through the admin dashboard.

## Features

- **Trilingual support** — English, Tamil (தமிழ்), Sinhala (සිංහල)
- **Product catalog** — search by category, price, size, colour, keyword
- **Shopping cart** — persistent cart with add, update, remove
- **Order management** — full lifecycle from pending to delivered
- **Stock control** — atomic reservation, oversell prevention
- **Human handover** — seamless escalation to staff
- **Admin dashboard** — products, orders, inbox, reports, settings
- **Webhook deduplication** — safe against retry storms
- **Audit logging** — full trail of changes

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [n8n](https://n8n.io/) instance (self-hosted or cloud)
- [Supabase](https://supabase.com/) project
- [Meta Developer](https://developers.facebook.com/) account with WhatsApp Business API
- [Anthropic](https://console.anthropic.com/) API key

### 1. Clone and Configure

```bash
git clone <repository-url>
cd doctordijango
cp .env.example .env
# Fill in all values in .env
```

### 2. Set Up Supabase

Create a Supabase project, then run the migrations in order:

```bash
# In the Supabase SQL Editor, run each file:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_functions.sql
supabase/migrations/003_rls_policies.sql
supabase/migrations/004_triggers.sql

# Then load demo data:
scripts/seed-data.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 3. Start n8n

```bash
docker compose up -d
# Open http://localhost:5678
```

### 4. Import Workflows

In n8n, import each workflow JSON from `n8n-workflows/`:

1. `workflow-a-webhook-receiver.json` — WhatsApp webhook handler
2. `workflow-b-ai-conversation.json` — AI sales agent
3. `workflow-c-product-search.json` — Product search
4. `workflow-d-cart-and-orders.json` — Cart and orders
5. `workflow-e-human-handover.json` — Human handover
6. `workflow-f-order-notifications.json` — Order notifications
7. `workflow-g-error-handling.json` — Error handling

Configure credentials in n8n for Supabase and WhatsApp API, then activate all workflows.

### 5. Configure WhatsApp Webhook

In the Meta Developer Console:
- Set the webhook URL to your n8n webhook endpoint (Workflow A)
- Set the verify token to match `META_WEBHOOK_VERIFY_TOKEN`
- Subscribe to `messages` events

See [docs/whatsapp-setup-guide.md](docs/whatsapp-setup-guide.md) for detailed steps.

### 6. Start the Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

### 7. Run Tests

```bash
node tests/unit/test-webhook-handler.js
node tests/unit/test-order-logic.js
node tests/unit/test-ai-response.js
```

## Project Structure

```
├── admin-dashboard/        # Next.js admin dashboard
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       ├── lib/            # Supabase clients, utilities
│       └── types/          # TypeScript type definitions
├── ai-prompts/
│   └── sales-agent.md      # AI system prompt
├── docs/
│   ├── deployment-guide.md
│   ├── whatsapp-setup-guide.md
│   ├── troubleshooting.md
│   └── production-checklist.md
├── n8n-workflows/          # Importable n8n workflow JSONs
│   ├── workflow-a-webhook-receiver.json
│   ├── workflow-b-ai-conversation.json
│   ├── workflow-c-product-search.json
│   ├── workflow-d-cart-and-orders.json
│   ├── workflow-e-human-handover.json
│   ├── workflow-f-order-notifications.json
│   └── workflow-g-error-handling.json
├── scripts/
│   └── seed-data.sql        # Demo product catalog
├── supabase/
│   └── migrations/          # SQL migrations
│       ├── 001_initial_schema.sql
│       ├── 002_functions.sql
│       ├── 003_rls_policies.sql
│       └── 004_triggers.sql
├── tests/
│   ├── unit/               # Automated unit tests
│   └── integration/        # Manual integration test guide
├── .env.example            # Environment variable template
├── docker-compose.yml      # Local dev (n8n)
└── README.md
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Automation Engine | n8n |
| Database | Supabase (PostgreSQL) |
| AI Model | Anthropic Claude |
| Messaging | Meta WhatsApp Cloud API |
| Admin Dashboard | Next.js 15, TypeScript, Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Authentication | Supabase Auth |

## Configuration

All configuration is managed through:
- **Environment variables** — credentials, API keys, URLs (`.env`)
- **Shop settings** — business rules stored in the `shop_settings` Supabase table, editable from the admin dashboard
- **AI prompt** — the agent's personality and rules in `ai-prompts/sales-agent.md`

## Documentation

- [Deployment Guide](docs/deployment-guide.md) — full setup from scratch
- [WhatsApp Setup Guide](docs/whatsapp-setup-guide.md) — Meta API configuration
- [Troubleshooting](docs/troubleshooting.md) — common issues and fixes
- [Production Checklist](docs/production-checklist.md) — go-live verification
- [Integration Test Guide](tests/integration/test-guide.md) — manual test scenarios

## Security

- Supabase Row Level Security enforced on all tables
- Service-role key used only server-side (n8n, admin API routes)
- Anon key exposes only active products (read-only)
- Customer data isolated by `customer_id`
- Webhook signature verification via HMAC-SHA256
- Webhook deduplication prevents replay attacks
- Parameterized queries throughout — no SQL injection
- Prompt injection detection in the AI layer
- Audit logging for all sensitive operations

## License

MIT
