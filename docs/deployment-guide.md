# Deployment Guide

Complete setup instructions for the WhatsApp AI Sales Agent.

## 1. Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for n8n)
- A Supabase account (free tier works for development)
- A Meta Developer account
- An Anthropic API key

### Clone the Repository

```bash
git clone <repository-url>
cd doctordijango
cp .env.example .env
```

### Start n8n Locally

```bash
docker compose up -d
```

n8n will be available at `http://localhost:5678`.

### Start the Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

Dashboard available at `http://localhost:3000`.

---

## 2. Supabase Project Setup

### Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your organization, name the project (e.g., `fashion-house`).
4. Set a strong database password (save it securely).
5. Select a region close to Sri Lanka (e.g., Southeast Asia).
6. Click **Create new project** and wait for provisioning.

### Get Your Keys

In the Supabase dashboard, go to **Settings → API**:

- **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-side only)

Add these to your `.env` file.

---

## 3. Database Migration and Seeding

### Run Migrations

In the Supabase dashboard, go to **SQL Editor** and run each migration file in order:

1. Open `supabase/migrations/001_initial_schema.sql` → paste into the editor → click **Run**.
2. Open `supabase/migrations/002_functions.sql` → paste and run.
3. Open `supabase/migrations/003_rls_policies.sql` → paste and run.
4. Open `supabase/migrations/004_triggers.sql` → paste and run.

### Verify Tables

In **Table Editor**, you should see all 15 tables:
`customers`, `conversations`, `messages`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `inventory_movements`, `shop_settings`, `staff_users`, `handover_requests`, `processed_webhook_events`, `audit_logs`.

### Load Demo Data

Run `scripts/seed-data.sql` in the SQL Editor to load sample products and shop settings.

### Create a Staff User

1. Go to **Authentication → Users** in Supabase.
2. Click **Add user** → **Create new user**.
3. Enter an email and password for your admin account.
4. Copy the user's UUID.
5. In the SQL Editor, insert a staff record:

```sql
INSERT INTO staff_users (id, email, full_name, role, is_active)
VALUES ('<user-uuid>', 'admin@fashionhouse.lk', 'Shop Admin', 'admin', true);
```

---

## 4. Meta WhatsApp Cloud API Setup

See [whatsapp-setup-guide.md](whatsapp-setup-guide.md) for the full walkthrough.

Summary of values needed in `.env`:

| Variable | Where to Find |
|----------|--------------|
| `META_WHATSAPP_ACCESS_TOKEN` | Meta Developer Console → App → WhatsApp → API Setup |
| `META_PHONE_NUMBER_ID` | Same page, under phone number details |
| `META_WABA_ID` | WhatsApp Business Account ID from the console |
| `META_WEBHOOK_VERIFY_TOKEN` | You choose this — any random string |
| `META_APP_SECRET` | App Settings → Basic → App Secret |

---

## 5. Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Navigate to **API Keys**.
3. Create a new key.
4. Add it to `.env` as `ANTHROPIC_API_KEY`.

The default model is `claude-sonnet-4-20250514`. Change `AI_MODEL` in `.env` to use a different model.

---

## 6. n8n Credential Configuration

### In n8n (http://localhost:5678):

1. Go to **Settings → Credentials**.
2. Create credentials that workflows reference (or configure via environment variables).

### Environment Variables for n8n

n8n reads environment variables set in the Docker container or the host. The workflows use the `$env` function to access:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION`
- `META_WEBHOOK_VERIFY_TOKEN`
- `META_APP_SECRET`
- `ANTHROPIC_API_KEY`
- `AI_MODEL`
- `AI_MAX_TOKENS`
- `AI_TOOL_CALL_LIMIT`
- `AI_TIMEOUT_MS`
- `AI_FALLBACK_RESPONSE`
- `STAFF_NOTIFICATION_WHATSAPP`

Update `docker-compose.yml` to pass these:

```yaml
services:
  n8n:
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - META_WHATSAPP_ACCESS_TOKEN=${META_WHATSAPP_ACCESS_TOKEN}
      # ... add all required variables
```

---

## 7. Importing and Activating Workflows

1. In n8n, click **Add workflow** → **Import from file**.
2. Import each workflow from `n8n-workflows/`:
   - `workflow-a-webhook-receiver.json`
   - `workflow-b-ai-conversation.json`
   - `workflow-c-product-search.json`
   - `workflow-d-cart-and-orders.json`
   - `workflow-e-human-handover.json`
   - `workflow-f-order-notifications.json`
   - `workflow-g-error-handling.json`
3. For each workflow, review the nodes and verify environment variable references.
4. **Activate** each workflow (toggle on the top right).
5. Note the webhook URL for Workflow A — you'll need this for Meta configuration.

---

## 8. Admin Dashboard Deployment

### Option A: Vercel (Recommended)

1. Push the `admin-dashboard` folder to a Git repository.
2. Import the project in [Vercel](https://vercel.com).
3. Set the root directory to `admin-dashboard`.
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel domain)
5. Deploy.

### Option B: Self-Hosted

```bash
cd admin-dashboard
npm install
npm run build
npm start
```

Or use Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 9. HTTPS and Webhook Security

### HTTPS Requirement

Meta requires HTTPS for webhook endpoints. Options:

- **ngrok** (development): `ngrok http 5678` — gives you a temporary HTTPS URL
- **Cloudflare Tunnel**: Free, persistent HTTPS tunnel
- **Reverse proxy**: nginx or Caddy with Let's Encrypt certificates
- **Cloud hosting**: Most cloud platforms provide HTTPS by default

### Webhook URL Format

Your n8n webhook URL will look like:
```
https://your-domain.com/webhook/whatsapp-webhook
```

Set this as the **Callback URL** in the Meta Developer Console.

---

## 10. Production Checklist

See [production-checklist.md](production-checklist.md) for the complete pre-launch verification list.

Key items:
- [ ] All `.env` variables set with production values
- [ ] n8n `N8N_ENCRYPTION_KEY` set to a strong, unique value
- [ ] Supabase RLS enabled and policies active
- [ ] WhatsApp webhook verified and active
- [ ] HTTPS configured for all endpoints
- [ ] Error notification recipients configured
- [ ] Backup strategy for Supabase
- [ ] Monitoring for n8n workflow failures

---

## Updating

### Schema Changes

Add new migration files (005, 006, etc.) and run them in order. Never modify existing migrations that have been applied to production.

### Workflow Updates

Export the updated workflow from n8n and replace the JSON file in `n8n-workflows/`. To apply to a running instance, re-import the workflow (n8n will update the existing one if the ID matches, or create a new one).

### Dashboard Updates

```bash
cd admin-dashboard
git pull
npm install
npm run build
# restart the server
```
