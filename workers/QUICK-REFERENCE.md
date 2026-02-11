# Production Workers - Quick Reference

## 🚀 Deployment Commands

### Deploy Inquiry Worker
```bash
cd workers/inquiry
wrangler deploy -c wrangler.production.toml
```

### Deploy Router Worker
```bash
cd workers/router
wrangler deploy -c wrangler.production.toml
```

---

## 🔐 Required Environment Variables

### Inquiry Worker
```bash
# Set via Cloudflare Dashboard or CLI:
wrangler secret put TURNSTILE_SECRET_KEY -c wrangler.production.toml
wrangler secret put N8N_WEBHOOK_URL -c wrangler.production.toml
wrangler secret put N8N_API_KEY -c wrangler.production.toml
```

### KV Namespace
```bash
# Create KV namespace
wrangler kv:namespace create "RATE_LIMIT_KV"

# Update wrangler.production.toml with the returned ID
```

---

## 📊 Key Features

### ✅ Security
- Turnstile bot protection
- Input validation (10+ rules)
- Input sanitization (XSS prevention)
- CORS restrictions
- Security headers
- Rate limiting (5 req/5min per IP)

### ✅ Error Handling
- Comprehensive error catching
- User-friendly error messages
- Detailed server-side logging
- Request ID tracking
- Error code categorization

### ✅ Logging
- Structured JSON logs
- Request tracking (UUID)
- Event categorization
- Performance metrics
- IP logging

### ✅ Validation Rules
- **Name:** 2-100 chars, required
- **Email:** Valid format (RFC 5322), max 255 chars
- **Phone:** Optional, 0-20 chars, digits/spaces/+/-/() only
- **Message:** 10-5000 chars, required
- **Turnstile:** Required token

---

## 🔍 Monitoring

### Watch Logs in Real-Time
```bash
wrangler tail mcad-inquiry-worker
```

### Key Events to Monitor
| Event | Meaning |
|-------|---------|
| `INQUIRY_SUCCESS` | Successful submission ✅ |
| `RATE_LIMIT_EXCEEDED` | Too many requests ⚠️ |
| `TURNSTILE_FAILED` | Bot detected ⚠️ |
| `N8N_REQUEST_FAILED` | n8n webhook error ❌ |
| `INTERNAL_ERROR` | Server error 🚨 |

---

## 🧪 Testing

### Test from Command Line
```powershell
# Get fresh Turnstile token from your website first
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+44 1234 567890"
    message = "Test inquiry message"
    turnstileToken = "REPLACE_WITH_REAL_TOKEN"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://mcad-inquiry-worker.YOURSUBDOMAIN.workers.dev/inquiry" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | Format-List
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Thank you! Your inquiry has been sent successfully.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## ⚡ Performance Metrics

### Target Metrics
- **Success Rate:** > 95%
- **Response Time:** < 2s
- **Rate Limit Hit Rate:** < 1%
- **Turnstile Failure:** < 5%
- **n8n Success:** > 98%

### Current Limits
- **Max Request Size:** 10KB
- **Request Timeout:** 10s
- **Rate Limit:** 5 per 5min per IP
- **Field Limits:** See validation rules above

---

## 🐛 Troubleshooting

### "Service temporarily unavailable" (503)
**Cause:** n8n webhook issue  
**Fix:** Check n8n webhook URL and workflow status

### "Security verification failed" (400)
**Cause:** Invalid Turnstile token  
**Fix:** Ensure frontend gets fresh tokens for each submission

### "Too many requests" (429)
**Cause:** Rate limit exceeded  
**Fix:** Normal behavior, wait 5 minutes or adjust rate limit

### "Validation failed" (400)
**Cause:** Invalid input  
**Fix:** Check error message for specific field issue

---

## 📁 File Structure

```
workers/
├── PRODUCTION-DEPLOYMENT.md     # Full deployment guide
├── SECURITY-CHECKLIST.md        # Security checklist
├── QUICK-REFERENCE.md           # This file
├── inquiry/
│   ├── worker.production.js     # ✅ PRODUCTION code
│   ├── worker.test.js           # ❌ Test only
│   ├── worker.js                # ❌ Old version
│   ├── wrangler.production.toml # ✅ Production config
│   └── wrangler.test.toml       # ❌ Test config
└── router/
    ├── worker.production.js     # ✅ PRODUCTION code
    ├── worker.js                # ❌ Old version
    └── wrangler.production.toml # ✅ Production config
```

**⚠️ ALWAYS USE `.production.js` FILES FOR PRODUCTION DEPLOYMENT!**

---

## 🔄 Update Workflow

1. Test changes in `worker.test.js` first
2. Apply changes to `worker.production.js`
3. Review security checklist
4. Deploy with production config
5. Monitor logs for 15 minutes
6. Test from live website

---

## 📞 API Endpoints

### Inquiry Form Submission
**POST** `/inquiry`

#### Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 1234 567890",
  "message": "I need my roof cleaned",
  "turnstileToken": "0.abc123..."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Thank you! Your inquiry has been sent successfully.",
  "requestId": "uuid"
}
```

#### Error Response (400/429/500/503)
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "requestId": "uuid"
}
```

### Health Check (Router only)
**GET** `/health`

#### Response (200)
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T12:00:00.000Z",
  "services": {
    "inquiry": true
  },
  "requestId": "uuid"
}
```

---

## 🎯 Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `METHOD_NOT_ALLOWED` | 405 | Only POST allowed |
| `REQUEST_TOO_LARGE` | 413 | Request > 10KB |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_JSON` | 400 | Malformed JSON |
| `VALIDATION_FAILED` | 400 | Invalid input |
| `TURNSTILE_FAILED` | 400 | Verification failed |
| `TURNSTILE_SERVICE_ERROR` | 503 | Turnstile API down |
| `N8N_CONNECTION_ERROR` | 503 | Can't reach n8n |
| `N8N_REQUEST_FAILED` | 503 | n8n returned error |
| `INTERNAL_ERROR` | 500 | Unexpected error |
| `SERVICE_NOT_CONFIGURED` | 503 | Binding missing |

---

## 🔒 Security Headers

All responses include:
```
Access-Control-Allow-Origin: https://mcadroofcleaning.co.uk
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-Request-ID: <uuid>
```

---

## 📚 Documentation Links

- [Full Deployment Guide](PRODUCTION-DEPLOYMENT.md)
- [Security Checklist](SECURITY-CHECKLIST.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Turnstile Docs](https://developers.cloudflare.com/turnstile/)

---

**Last Updated:** February 11, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
