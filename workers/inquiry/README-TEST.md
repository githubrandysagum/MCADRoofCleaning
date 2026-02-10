# Test Worker - n8n Integration

## 🎯 Purpose

Test version of the inquiry worker that:
- ✅ Validates form data
- ✅ Sends to n8n webhook
- ✅ n8n processes and sends email via Gmail
- ⚠️ **Skips Turnstile verification** for easy testing

**Flow:**
```
Form → Cloudflare Worker → n8n Webhook → Gmail
```

## 🚀 Deployment

### Option 1: Update Existing Worker

If you already deployed `tes-mcad-inquiry-worker`:

1. Go to https://dash.cloudflare.com
2. **Workers & Pages** → **tes-mcad-inquiry-worker**
3. Click **Edit Code**
4. **Delete all code**
5. **Copy all code** from `worker.test.js`
6. **Paste** into editor
7. Click **Save and Deploy**

### Option 2: Deploy via Wrangler CLI

```bash
cd workers/inquiry
wrangler deploy -c wrangler.test.toml
```

## 🔒 Set Secrets

**Required:** N8N_WEBHOOK_URL

**Via Cloudflare Dashboard:**
1. **Workers & Pages** → **tes-mcad-inquiry-worker**
2. **Settings** → **Variables and Secrets**
3. Click **Add variable**
   - Name: `N8N_WEBHOOK_URL`
   - Value: Your n8n webhook URL
   - ✅ **Encrypt**

**Optional but Recommended:** N8N_API_KEY
4. Click **Add variable**
   - Name: `N8N_API_KEY`
   - Value: Your shared secret
   - ✅ **Encrypt**

**Via Wrangler CLI:**
```bash
wrangler secret put N8N_WEBHOOK_URL -c wrangler.test.toml
wrangler secret put N8N_API_KEY -c wrangler.test.toml
```

## 📧 n8n Workflow Setup

### 1. Create Webhook Node (Trigger)
- Method: **POST**
- Response Mode: **When Last Node Finishes**
- Copy the webhook URL

### 2. Optional: Add Function Node (API Key Auth)
```javascript
const apiKey = $request.headers['x-api-key'];
if (apiKey !== $env.N8N_API_KEY) {
  throw new Error('Unauthorized');
}
return $input.all();
```

### 3. Add Gmail Node
- **To:** Your email address
- **Subject:** `New Inquiry from {{$json.name}}`
- **Message:**
```
New inquiry received:

Name: {{$json.name}}
Email: {{$json.email}}
Phone: {{$json.phone}}
Message: {{$json.message}}

Submitted: {{$json.submittedAt}}
Source: {{$json.source}}
Test Mode: {{$json.testMode}}
```

### 4. Activate Workflow
- Click **Active** toggle
- Copy webhook URL for Cloudflare secrets

## 📝 Payload Structure

The worker sends this to n8n:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "message": "User's message",
  "submittedAt": "2026-02-10T12:34:56.789Z",
  "source": "mcadroofcleaning.co.uk",
  "testMode": true,
  "verified": true
}
```

## 🧪 Testing

1. Open `test-index.html` in browser
2. Fill form with test data
3. Submit
4. Check:
   - ✅ Browser shows success message
   - ✅ Cloudflare Worker logs (no errors)
   - ✅ n8n workflow execution (successful)
   - ✅ Gmail inbox (email received)

## 🔒 Security Notes

This test version:
- ✅ Has CORS open for testing
- ✅ Skips Turnstile verification
- ✅ Webhook URL stored as encrypted secret
- ✅ Optional API key for n8n authentication

For production (worker.js):
- Add Turnstile verification
- Restrict CORS to your domain only
- Keep all secrets encrypted

## 🔄 Next Steps

1. ✅ Create n8n workflow
2. ✅ Get webhook URL
3. ✅ Add N8N_WEBHOOK_URL to Cloudflare
4. ✅ Test with test-index.html
5. ✅ Verify email delivery
6. ✅ Move to production worker.js with Turnstile
