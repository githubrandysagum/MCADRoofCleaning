# Test Version of Inquiry Worker

## ⚠️ Important

This test version **SKIPS TURNSTILE VERIFICATION** for easier testing. 

**DO NOT use this in production!** It's vulnerable to spam without Turnstile protection.

## What's Different in Test Version?

### worker.test.js
- ✅ Accepts form submissions without valid Turnstile token
- ✅ **CORS enabled for ALL origins** (localhost, 127.0.0.1, your domain)
- ✅ Works with local development (no CORS blocking)
- ✅ Still validates name, email, message fields
- ✅ Still sends email via MailChannels
- ✅ Emails are marked with `[TEST]` prefix
- ⚠️ No spam protection
- ⚠️ Allows requests from anywhere (testing only!)

### worker.js (Production)
- ✅ Full Turnstile verification
- ✅ CORS restricted to your domain only
- ✅ Validates all fields
- ✅ Sends email via MailChannels
- ✅ Protected against spam/bots

## How to Deploy Test Version

### Option 1: Via Cloudflare Dashboard (UI)

1. Go to https://dash.cloudflare.com
2. Workers & Pages → Create Worker
3. Name it: `mcad-inquiry-worker-test`
4. Click Deploy
5. Click **Edit Code**
6. Copy all code from `worker.test.js`
7. Paste into editor
8. Click **Save and Deploy**
9. Go to Settings → Variables and Secrets
10. Add only: `RECIPIENT_EMAIL` (no need for TURNSTILE_SECRET_KEY)

### Option 2: Via Command Line

```bash
cd workers/inquiry
wrangler secret put RECIPIENT_EMAIL -c wrangler.test.toml
wrangler deploy -c wrangler.test.toml
```

## Testing

### Local Testing (No CORS Issues!)

Once deployed, you can test from your local machine:

**1. Get your test worker URL:**
`https://mcad-inquiry-worker-test.YOUR_ACCOUNT.workers.dev`

**2. Update `scripts.js`:**
```javascript
// Line 194 - use test URL
const response = await fetch('https://mcad-inquiry-worker-test.YOUR_ACCOUNT.workers.dev', {
```

**3. Open your HTML file locally:**
- Open `index.html` in your browser (file:// or http://localhost)
- Fill out the form
- Submit - **No CORS errors!**
- Check your email

### Testing on Live Site

Same steps work on your live website too!

**Benefits of test version:**
- ✅ Works from localhost/127.0.0.1
- ✅ Works from file:// URLs
- ✅ Works from your live domain
- ✅ No Turnstile verification needed
- ✅ No CORS blocking

## Switching to Production

When ready for production:

1. Deploy the production version (`worker.js`)
2. Add both secrets: `TURNSTILE_SECRET_KEY` and `RECIPIENT_EMAIL`
3. Update `scripts.js` to production URL
4. Delete test worker

## Tips

- Emails from test version have `[TEST]` in subject line
- Check Cloudflare Workers logs if emails don't arrive
- Test version still requires form fields to be filled
- Turnstile widget will still show on your form, but verification is skipped on backend
