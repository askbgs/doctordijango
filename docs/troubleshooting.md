# Troubleshooting Guide

Common issues and their solutions.

---

## Webhook Not Receiving Messages

**Symptoms:** Customer sends a WhatsApp message but nothing happens in n8n.

**Checks:**
1. **Is the webhook URL correct?** In Meta Developer Console → WhatsApp → Configuration, verify the Callback URL matches your n8n webhook URL.
2. **Is HTTPS working?** Meta only delivers to HTTPS endpoints. Test: `curl -I https://your-webhook-url`.
3. **Is n8n running?** Check the n8n dashboard and verify Workflow A is active.
4. **Is the `messages` field subscribed?** In Meta Console → Webhooks, ensure "messages" shows as Subscribed.
5. **Check Meta webhook delivery logs.** Meta Console → Webhooks → Recent deliveries shows failures.
6. **Firewall/proxy issues?** Ensure your server accepts POST requests from Meta's IP ranges on port 443.

**Fix:** If the webhook was never verified, re-trigger verification from the Meta Console. Ensure your verify token matches `META_WEBHOOK_VERIFY_TOKEN` in your n8n environment.

---

## AI Not Responding

**Symptoms:** Webhook received, but no response sent to the customer.

**Checks:**
1. **Is Workflow B active?** Check n8n.
2. **Is the Anthropic API key valid?** Check for 401 errors in Workflow B execution logs.
3. **Is the AI timing out?** Check `AI_TIMEOUT_MS` — increase it if the model needs more time.
4. **Is the tool call limit reached?** Check `AI_TOOL_CALL_LIMIT`. Complex queries may need more iterations.
5. **Check n8n execution history.** Open Workflow B → Executions → look for failed runs.

**Fix:** Test the Anthropic API directly:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'
```

---

## WhatsApp API Errors

### Rate Limit (429)
- **Cause:** Too many messages sent in a short period.
- **Fix:** The error handling workflow (G) retries with exponential backoff. If persistent, check your messaging tier in Meta Business Manager.

### Invalid Token (401/403)
- **Cause:** Access token expired or lacks permissions.
- **Fix:** Generate a new system user token with `whatsapp_business_messaging` permission.

### Message Window Expired
- **Cause:** Trying to send a free-form message more than 24 hours after the customer's last message.
- **Fix:** Use an approved message template for proactive outreach. The agent should always respond within 24 hours.

### Phone Number Not Registered
- **Cause:** Sending to a number not on WhatsApp.
- **Fix:** Inform the customer through an alternative channel.

---

## Supabase Connection Issues

**Symptoms:** Workflows fail with "Failed to fetch" or timeout errors when accessing Supabase.

**Checks:**
1. **Is `SUPABASE_URL` correct?** Should be `https://xxxxx.supabase.co`.
2. **Is `SUPABASE_SERVICE_ROLE_KEY` valid?** Check in Supabase → Settings → API.
3. **Is the Supabase project active?** Free-tier projects pause after inactivity.
4. **Are RLS policies blocking?** The service role key bypasses RLS, but verify this is configured correctly.

**Fix:** Test connection:
```bash
curl -s "${SUPABASE_URL}/rest/v1/products?select=id&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

If the Supabase project is paused, restore it from the dashboard.

---

## n8n Workflow Errors

### Workflow Not Triggering
- Check that the workflow is **active** (toggle is green).
- Webhooks only work when the workflow is active.
- After importing, you may need to re-activate.

### Node Execution Failed
- Open the failed execution in n8n.
- Click the red node to see the error.
- Common causes: missing environment variables, wrong URL, auth failure.

### "Expression evaluation error"
- An `$env` reference points to an undefined variable.
- Check that all required environment variables are set in your n8n container.

### Workflow Timeout
- Complex AI conversations with multiple tool calls can exceed n8n's default execution timeout.
- Increase `EXECUTIONS_TIMEOUT` in n8n settings if needed.

---

## Dashboard Login Issues

### "Invalid login credentials"
1. Verify the email and password in Supabase Auth → Users.
2. Check that a matching `staff_users` record exists.
3. Try resetting the password in Supabase Auth.

### Redirect Loop After Login
- Check `NEXTAUTH_URL` matches your dashboard URL.
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
- Clear browser cookies and try again.

### "Unauthorized" on Dashboard Pages
- The Supabase session may have expired.
- The middleware should refresh sessions — check `middleware.ts` is deployed.
- Verify the user's `is_active` flag is true in `staff_users`.

---

## Order Creation Failures

### "Insufficient stock"
- **Cause:** Another order reserved the last items before this one.
- **Expected behavior:** The AI informs the customer and suggests alternatives.
- **Admin action:** Check `product_variants` table for stock levels. Adjust `available_quantity` if needed.

### "Price mismatch"
- **Cause:** Product prices changed between cart addition and order placement.
- **Expected behavior:** The order is rejected, and the AI recalculates with current prices.
- **Admin action:** This is working correctly — prices are validated server-side.

### Order Created but Customer Not Notified
- Check that the WhatsApp send in Workflow D succeeded.
- Look at the n8n execution for the specific order.
- Verify `META_WHATSAPP_ACCESS_TOKEN` is valid.

---

## Stock Discrepancy

### Reserved Quantity Too High
- **Cause:** An order was placed but never confirmed or cancelled, leaving stock reserved.
- **Fix:** Check for orders with status `pending_confirmation` that are stale. Cancel them to release stock:
  ```sql
  SELECT cancel_order(id, 'Timed out') FROM orders
  WHERE status = 'pending_confirmation'
  AND created_at < now() - interval '24 hours';
  ```

### Available Quantity Negative
- This should never happen due to check constraints.
- If it does, there's a bug in the stock management logic.
- **Fix:** Manually correct the quantity and review `inventory_movements` for the variant.

---

## Message Delivery Failures

### Messages Sent but Not Delivered
- The customer may be offline — WhatsApp will deliver when they come online.
- Check message `status` in the `messages` table. `sent` → `delivered` → `read`.
- Status webhooks may be delayed.

### Messages Show as "Failed"
- Check the WhatsApp API error in the n8n execution log.
- Common cause: malformed message body (too long, invalid characters).
- Max WhatsApp message length is approximately 4096 characters.

---

## Language Detection Issues

### Wrong Language Detected
- Short messages (1-2 words) may be misidentified.
- Numbers and symbols default to English.
- **Fix:** The customer can explicitly say "Tamil please" or "සිංහලෙන් කතා කරන්න" to switch languages.

### Mixed Language Responses
- The AI should respond in one language per message.
- If this happens, check the system prompt for clear language instructions.
- Consider adding "Always respond entirely in one language" to the prompt.

---

## Common Environment Variable Issues

| Symptom | Likely Cause |
|---------|-------------|
| 401 on WhatsApp API | `META_WHATSAPP_ACCESS_TOKEN` wrong or expired |
| 401 on Anthropic API | `ANTHROPIC_API_KEY` wrong |
| No Supabase data | `SUPABASE_URL` or keys wrong |
| Webhook verification fails | `META_WEBHOOK_VERIFY_TOKEN` mismatch |
| Dashboard won't load data | `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` wrong |
| n8n can't read env vars | Variables not passed to the Docker container |

**Always restart services after changing environment variables.**
