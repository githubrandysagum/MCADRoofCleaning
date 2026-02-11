# Production Deployment Guide

## Overview
This guide covers deploying the MCAD Roof Cleaning Workers to production with proper security, monitoring, and error handling.

---

## Pre-Deployment Checklist

### 1. Code Review
- ✅ Use `worker.production.js` files (NOT test versions)
- ✅ All validation and sanitization in place
- ✅ Error handling comprehensive
- ✅ Logging structured and informative
- ✅ Security headers configured
- ✅ Rate limiting implemented

### 2. Environment Variables Required

#### **Inquiry Worker** (`mcad-inquiry-worker`)
Required secrets to set in Cloudflare Dashboard:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | Cloudflare Dashboard → Turnstile → Your Site |
| `N8N_WEBHOOK_URL` | n8n webhook URL for email processing | n8n workflow → Webhook node → Production URL |
| `N8N_API_KEY` | (Optional) Shared secret for authentication | Generate random string (recommended) |

#### **Router Worker** (if using service bindings)
Bindings configured in `wrangler.toml`:
- `INQUIRY_WORKER` → points to inquiry worker

---

## Cloudflare Dashboard Configuration

### Step 1: Create KV Namespace for Rate Limiting

1. Go to **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name it: `RATE_LIMIT_KV`
4. Click **Add**
5. Note the namespace ID

### Step 2: Deploy Inquiry Worker

1. **Navigate to Workers & Pages** → **Create Application** → **Create Worker**
2. Name it: `mcad-inquiry-worker`
3. Click **Deploy**

4. **Upload Production Code:**
   - Click **Quick Edit** or **Edit Code**
   - Delete default code
   - Copy entire contents of `workers/inquiry/worker.production.js`
   - Paste into editor
   - Click **Save and Deploy**

5. **Configure Environment Variables:**
   - Go to **Settings** → **Variables and Secrets**
   - Add the following **Secrets** (encrypted):
     - `TURNSTILE_SECRET_KEY` → Your Turnstile secret key
     - `N8N_WEBHOOK_URL` → Your n8n webhook URL
     - `N8N_API_KEY` → Your generated API key (optional but recommended)
   - Click **Save**

6. **Bind KV Namespace:**
   - Still in **Settings** → **Bindings**
   - Click **Add Binding**
   - Select **KV Namespace**
   - Variable name: `RATE_LIMIT_KV`
   - KV namespace: Select `RATE_LIMIT_KV` (created in Step 1)
   - Click **Save**

7. **Configure Custom Domain (Optional):**
   - Go to **Settings** → **Triggers** → **Custom Domains**
   - Click **Add Custom Domain**
   - Enter: `api.mcadroofcleaning.co.uk` (or your preferred subdomain)
   - Click **Add Domain**

### Step 3: Deploy Router Worker (Optional)

If you want centralized routing:

1. **Create Worker:**
   - **Workers & Pages** → **Create Application** → **Create Worker**
   - Name: `mcad-api-router`
   - Click **Deploy**

2. **Upload Production Code:**
   - Copy contents of `workers/router/worker.production.js`
   - Paste and **Save and Deploy**

3. **Configure Service Binding:**
   - Go to **Settings** → **Bindings**
   - Click **Add Binding**
   - Select **Service Binding**
   - Variable name: `INQUIRY_WORKER`
   - Service: Select `mcad-inquiry-worker`
   - Click **Save**

4. **Configure Custom Domain:**
   - Add domain: `api.mcadroofcleaning.co.uk`

---

## Testing Production Deployment

### Test Inquiry Endpoint

```bash
# Using curl (PowerShell)
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+44 1234 567890"
    message = "This is a test inquiry from production"
    turnstileToken = "YOUR_VALID_TURNSTILE_TOKEN"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://mcad-inquiry-worker.YOUR_SUBDOMAIN.workers.dev/inquiry" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

### Expected Responses

**Success (200):**
```json
{
  "success": true,
  "message": "Thank you! Your inquiry has been sent successfully.",
  "requestId": "uuid-here"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Email is required",
  "errorCode": "VALIDATION_FAILED",
  "requestId": "uuid-here"
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "requestId": "uuid-here"
}
```

---

## Monitoring & Logging

### View Logs in Real-Time

1. Go to **Workers & Pages** → **mcad-inquiry-worker**
2. Click **Logs** → **Begin log stream**
3. Submit a test form
4. Watch structured JSON logs

### Log Event Types to Monitor

| Event | Severity | Action |
|-------|----------|--------|
| `INQUIRY_SUCCESS` | Info | Normal operation |
| `RATE_LIMIT_EXCEEDED` | Warning | Monitor for abuse |
| `TURNSTILE_FAILED` | Warning | May indicate bot activity |
| `VALIDATION_FAILED` | Warning | Check for malicious input |
| `N8N_REQUEST_FAILED` | Error | Check n8n webhook status |
| `INTERNAL_ERROR` | Critical | Immediate investigation |

### Set Up Alerts (Recommended)

1. **Logpush to External Service:**
   - Cloudflare Dashboard → **Analytics & Logs** → **Logpush**
   - Configure push to:
     - Datadog
     - Splunk
     - New Relic
     - S3 bucket

2. **Email Notifications:**
   - Use n8n workflow to send notifications on critical errors
   - Monitor `errorCode: "INTERNAL_ERROR"` or `"N8N_REQUEST_FAILED"`

---

## Security Best Practices

### 1. Turnstile Configuration
- ✅ Use **Managed** challenge mode for production
- ✅ Set domain restriction to `mcadroofcleaning.co.uk`
- ✅ Enable **Smart revalidation**

### 2. Rate Limiting
- Default: 5 requests per IP per 5 minutes
- Adjust in code if needed (update `limit` variable)
- Monitor logs for abuse patterns

### 3. n8n Webhook Security
- ✅ Use HTTPS only
- ✅ Set `N8N_API_KEY` and validate in n8n workflow
- ✅ IP whitelist Cloudflare IPs if possible

### 4. CORS Configuration
- Production: `https://mcadroofcleaning.co.uk` ONLY
- Never use `*` in production
- Validate Origin header

### 5. Input Sanitization
- All inputs trimmed and length-limited
- XSS prevention built-in
- SQL injection not applicable (no database)

---

## Performance Optimization

### Current Limits
- Max request size: 10KB
- Request timeout: 10 seconds to n8n
- Rate limit: 5 requests per 5 minutes per IP

### Recommended Settings
- **CPU Time Limit:** Default (10ms - 50ms) is sufficient
- **KV Storage:** Free tier handles rate limiting easily
- **Execution Time:** Should complete in < 2 seconds typically

---

## Troubleshooting

### Issue: "Service temporarily unavailable"
**Possible Causes:**
- n8n webhook URL not set or incorrect
- n8n webhook is down
- Network timeout

**Resolution:**
1. Verify `N8N_WEBHOOK_URL` in worker settings
2. Test n8n webhook directly
3. Check n8n workflow is active

### Issue: "Security verification failed"
**Possible Causes:**
- Invalid Turnstile token
- Turnstile secret key mismatch
- Token already used (replay attack)

**Resolution:**
1. Verify `TURNSTILE_SECRET_KEY` matches site configuration
2. Ensure frontend is getting fresh tokens
3. Check Turnstile site domain matches

### Issue: Rate limiting too strict
**Resolution:**
1. Edit `worker.production.js`
2. Update rate limit values:
   ```javascript
   const limit = 10; // Increase from 5
   const windowMs = 5 * 60 * 1000; // Keep 5 minutes
   ```
3. Redeploy worker

### Issue: Large messages rejected
**Resolution:**
1. Increase `maxLength` for message field:
   ```javascript
   message: sanitizeInput(message, 10000), // Increase from 5000
   ```
2. Update validation check
3. Redeploy

---

## Rollback Plan

If production deployment has issues:

1. **Quick Fix:** Edit worker code directly in dashboard
2. **Revert to Test Version:** 
   - Copy `worker.test.js` to production
   - Add back Turnstile verification
   - Redeploy
3. **Use Previous Version:**
   - Workers dashboard → **Deployments**
   - Click **Rollback** on previous working version

---

## Performance Metrics to Track

### Key Metrics
- **Request Success Rate:** Should be > 95%
- **Average Response Time:** Should be < 2 seconds
- **Rate Limit Hit Rate:** Should be < 1%
- **Turnstile Failure Rate:** Should be < 5%
- **n8n Success Rate:** Should be > 98%

### Monitoring Queries
Filter logs by:
- `event: "INQUIRY_SUCCESS"` → Count successful submissions
- `event: "N8N_REQUEST_FAILED"` → Alert on n8n issues
- `event: "RATE_LIMIT_EXCEEDED"` → Monitor abuse

---

## Update Checklist

When updating worker code:

1. ✅ Test changes locally with test worker first
2. ✅ Review all validation logic
3. ✅ Check error handling
4. ✅ Verify logging output
5. ✅ Test with real Turnstile tokens
6. ✅ Deploy to production
7. ✅ Monitor logs for 15 minutes
8. ✅ Test from live website
9. ✅ Verify email delivery via n8n

---

## Support & Resources

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Turnstile Docs:** https://developers.cloudflare.com/turnstile/
- **n8n Docs:** https://docs.n8n.io/
- **MailChannels (Alternative):** https://support.mailchannels.com/

---

## Production Deployment Timeline

1. **Create KV Namespace** (2 min)
2. **Deploy Inquiry Worker** (5 min)
3. **Configure Secrets** (3 min)
4. **Bind KV Namespace** (2 min)
5. **Test Deployment** (5 min)
6. **Deploy Router (Optional)** (5 min)
7. **Configure Custom Domain** (5 min)
8. **Final Testing** (10 min)

**Total Time:** ~30-40 minutes

---

## Ready for Production? ✅

Your worker now includes:
- ✅ **Turnstile verification** - Bot protection
- ✅ **Input validation** - 10+ validation rules
- ✅ **Input sanitization** - XSS prevention
- ✅ **Rate limiting** - 5 req/5min per IP
- ✅ **Request size limits** - 10KB max
- ✅ **Timeout protection** - 10s timeout
- ✅ **Structured logging** - JSON logs with requestId
- ✅ **Error tracking** - Error codes for debugging
- ✅ **Security headers** - XSS, Frame, MIME protection
- ✅ **CORS restrictions** - Domain locked
- ✅ **Comprehensive error handling** - All edge cases covered

**You're ready to deploy! 🚀**
