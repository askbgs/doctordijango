# WhatsApp Cloud API Setup Guide

Step-by-step instructions for configuring the Meta WhatsApp Cloud API for the sales agent.

## Prerequisites

- A Facebook account
- A Meta Business account (create at [business.facebook.com](https://business.facebook.com))
- A phone number that can receive SMS or calls for verification (this number will become your WhatsApp Business number)

---

## Step 1: Create a Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Click **Get Started** or **My Apps**.
3. If prompted, register as a developer and verify your account.

---

## Step 2: Create a New App

1. Click **Create App**.
2. Under use cases select **Other**, then click **Next**.
3. Select **Business** as the app type.
4. Enter:
   - **App name**: e.g., "Fashion House WhatsApp Agent"
   - **App contact email**: your business email
   - **Business Account**: select your Meta Business account
5. Click **Create App**.

---

## Step 3: Add WhatsApp Product

1. On the app dashboard, find **WhatsApp** in the product list.
2. Click **Set Up**.
3. Select or create a Meta Business Account if prompted.

---

## Step 4: Get API Credentials

On the **WhatsApp → API Setup** page:

### Temporary Access Token
- A temporary token is displayed (valid for 24 hours).
- For development, copy this to `META_WHATSAPP_ACCESS_TOKEN`.
- **For production, create a permanent token** (see Step 8).

### Phone Number ID
- Under **From**, you'll see a test phone number provided by Meta.
- The **Phone number ID** is displayed — copy to `META_PHONE_NUMBER_ID`.

### WhatsApp Business Account ID
- Found in the URL or on the **WhatsApp → Overview** page.
- Copy to `META_WABA_ID`.

---

## Step 5: Configure the Test Phone Number

1. Under **To**, click **Manage phone number list**.
2. Add your personal WhatsApp number for testing (up to 5 numbers in test mode).
3. Enter the verification code sent to your number.

You can now send test messages to these numbers.

---

## Step 6: Set Up the Webhook

### Generate a Verify Token

Choose a random string as your verify token:

```bash
openssl rand -hex 16
```

Save this as `META_WEBHOOK_VERIFY_TOKEN` in your `.env`.

### Configure the Webhook in Meta

1. Go to **WhatsApp → Configuration** in the Meta Developer Console.
2. Under **Webhook**, click **Edit**.
3. Enter:
   - **Callback URL**: Your n8n webhook URL (e.g., `https://your-domain.com/webhook/whatsapp-webhook`)
   - **Verify token**: The token you generated above
4. Click **Verify and Save**.
5. Meta will send a GET request to your URL. Workflow A handles verification automatically.

### Subscribe to Events

After verification, subscribe to these webhook fields:
- **messages** (required — this is how you receive customer messages)

Click **Subscribe** next to the `messages` field.

---

## Step 7: Get the App Secret

1. Go to **App Settings → Basic**.
2. Click **Show** next to **App Secret**.
3. Enter your Facebook password to reveal it.
4. Copy to `META_APP_SECRET`.

This is used for webhook signature verification (HMAC-SHA256).

---

## Step 8: Create a Permanent Access Token (Production)

The temporary token expires after 24 hours. For production:

### System User Token (Recommended)

1. Go to [business.facebook.com](https://business.facebook.com) → **Settings → Business Settings**.
2. Under **Users → System Users**, create a new system user:
   - Name: "WhatsApp Agent Bot"
   - Role: Admin
3. Click **Add Assets** → select your WhatsApp Business Account → grant **Full Control**.
4. Click **Generate New Token**.
5. Select your app.
6. Add the permission: `whatsapp_business_messaging`.
7. Click **Generate Token** and copy it.
8. Save as `META_WHATSAPP_ACCESS_TOKEN`.

This token does not expire.

---

## Step 9: Add Your Business Phone Number (Production)

To use your own business phone number instead of the test number:

1. Go to **WhatsApp → Overview → Phone Numbers**.
2. Click **Add Phone Number**.
3. Enter your business phone number.
4. Complete the verification (SMS or voice call).
5. Update `META_PHONE_NUMBER_ID` with the new phone number ID.

**Important:** The phone number must not be registered on any other WhatsApp account (personal or business). If it is, you'll need to delete that WhatsApp account first.

---

## Going Live Checklist

Before receiving messages from real customers:

- [ ] **Business verification**: Complete Meta Business Verification at [business.facebook.com](https://business.facebook.com) → **Settings → Business info → Business verification**.
- [ ] **App review**: Submit your app for review in the Meta Developer Console if required for your use case.
- [ ] **Display name**: Set your WhatsApp Business display name (reviewed by Meta).
- [ ] **Business profile**: Complete your business profile (photo, description, address, website, email).
- [ ] **Permanent token**: Replace the temporary token with a system user token (Step 8).
- [ ] **Production phone number**: Add your business phone number (Step 9).
- [ ] **Message templates**: Create approved message templates for proactive messaging (e.g., order confirmations, shipping updates).
- [ ] **Webhook HTTPS**: Ensure your webhook URL uses HTTPS with a valid certificate.
- [ ] **Error handling**: Verify error notifications are configured and working.
- [ ] **Testing**: Complete all integration tests with the production phone number.

---

## Messaging Policies

### 24-Hour Messaging Window

- After a customer sends a message, you have a **24-hour window** to respond with any content (free-form messages).
- After 24 hours, you can only send **pre-approved message templates**.
- Each customer message resets the 24-hour window.

### Message Templates

For proactive messages (order confirmations, shipping updates sent outside the 24-hour window):

1. Go to **WhatsApp → Message Templates**.
2. Create templates for common notifications:
   - `order_confirmation` — "Your order {{1}} has been confirmed! Total: LKR {{2}}"
   - `order_shipped` — "Great news! Your order {{1}} has been shipped."
   - `order_delivered` — "Your order {{1}} has been delivered. Thank you for shopping with us!"
3. Submit for approval (usually approved within minutes to hours).

### Rate Limits

- **Messaging limits** depend on your tier (1,000 to 100,000+ messages per day).
- New accounts start at Tier 1 (1,000 unique customers per day).
- Tiers increase automatically based on message quality and volume.

---

## Troubleshooting

### Webhook Not Receiving Messages

1. Check that the webhook URL is correct and accessible from the internet.
2. Verify HTTPS is working (Meta only sends to HTTPS endpoints).
3. Check the verify token matches your `.env`.
4. In Meta Developer Console → **Webhooks**, check for delivery errors.
5. Ensure the `messages` field is subscribed.

### "Message Undeliverable" Error

- The recipient hasn't opted in or their number isn't on WhatsApp.
- The 24-hour messaging window expired (use a template instead).
- The phone number format is incorrect (use international format without + or 00).

### "Invalid Access Token"

- The temporary token expired (use a permanent system user token).
- The token doesn't have the `whatsapp_business_messaging` permission.
- The token's system user doesn't have access to the WhatsApp Business Account.

### "Rate Limit Exceeded"

- You've hit Meta's rate limits.
- Implement exponential backoff and retry.
- Check your messaging tier and quality rating in the Meta Business Manager.

### Webhook Signature Verification Fails

- Ensure `META_APP_SECRET` is correct.
- Check that the raw request body (not parsed JSON) is used for HMAC computation.
- Verify the `X-Hub-Signature-256` header is being read correctly.
