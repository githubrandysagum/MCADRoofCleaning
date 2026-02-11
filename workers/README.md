# MCAD Roof Cleaning - Cloudflare Workers

## 📁 Project Structure

```
workers/
├── 📘 README.md                        ← You are here
├── 📗 PRODUCTION-DEPLOYMENT.md         ← Full deployment guide (30-40 min)
├── 📙 SECURITY-CHECKLIST.md            ← Security validation checklist
├── 📕 QUICK-REFERENCE.md               ← Quick commands & tips
├── 📔 PRODUCTION-VS-TEST.md            ← Comparison of versions
├── 🧪 TESTING-GUIDE.md                 ← Test all features before production
│
├── inquiry/                            ← Inquiry form worker
│   ├── ✅ worker.production.js         ← USE THIS FOR PRODUCTION
│   ├── 🧪 worker.test.js               ← Enhanced test (all features!)
│   ├── ⚠️ worker.js                    ← Old version (MailChannels)
│   ├── ✅ wrangler.production.toml     ← Production config
│   ├── 🧪 wrangler.test.toml           ← Test config
│   └── 📖 README-TEST.md               ← Detailed test guide
│
└── router/                             ← API router worker (optional)
    ├── ✅ worker.production.js         ← USE THIS FOR PRODUCTION
    ├── ⚠️ worker.js                    ← Old version
    └── ✅ wrangler.production.toml     ← Production config
```

---

## 🚀 Quick Start Guide

### For Production Deployment

1. **Read the deployment guide:**
   ```
   Open: PRODUCTION-DEPLOYMENT.md
   Time: 30-40 minutes to deploy
   ```

2. **Follow the security checklist:**
   ```
   Open: SECURITY-CHECKLIST.md
   Review all items before going live
   ```

3. **Deploy to Cloudflare Dashboard:**
   - Navigate to Workers & Pages
   - Create new worker: `mcad-inquiry-worker`
   - Copy code from `inquiry/worker.production.js`
   - Configure environment variables
   - Set up KV namespace for rate limiting
   - Test thoroughly

4. **Keep for reference:**
   ```
   QUICK-REFERENCE.md - Commands, testing, troubleshooting
   PRODUCTION-VS-TEST.md - Understanding the improvements
   ```

### For Testing & Development

1. **Use enhanced test version:**
   ```
   File: inquiry/worker.test.js (UPDATED with all production features!)
   Config: inquiry/wrangler.test.toml
   Guide: inquiry/README-TEST.md
   ```

2. **What you can test:**
   - ✅ All validation rules (15+)
   - ✅ Input sanitization (XSS prevention)
   - ✅ Rate limiting (5/5min per IP)
   - ✅ Request size limits (10KB)
   - ✅ Security headers
   - ✅ Structured logging
   - ✅ Error tracking
   - ✅ Timeout protection
   - ⚠️ Turnstile skipped (for easy testing)
   - ⚠️ CORS permissive (for easy testing)

3. **Test, verify, then deploy production**

**See:** [TESTING-GUIDE.md](TESTING-GUIDE.md) for comprehensive testing instructions

---

## ✨ What's New - Production Ready Features

### 🔐 Security (Critical Improvements)
- ✅ **Turnstile verification** - Bot protection
- ✅ **Rate limiting** - 5 requests per 5 minutes per IP
- ✅ **Input sanitization** - XSS prevention
- ✅ **Request size limits** - 10KB max (DoS prevention)
- ✅ **CORS restrictions** - Locked to your domain
- ✅ **Security headers** - 6 protective headers
- ✅ **IP tracking** - Abuse investigation

### ✅ Validation (15+ Rules)
- ✅ **Name** - 2-100 characters, required
- ✅ **Email** - RFC 5322 format, max 255 chars
- ✅ **Phone** - Optional, validated format
- ✅ **Message** - 10-5000 characters
- ✅ **Type checking** - All fields verified
- ✅ **Null byte removal** - Security
- ✅ **Whitespace normalization**

### 🛡️ Error Handling
- ✅ **Error codes** - All errors categorized
- ✅ **Request tracking** - UUID per request
- ✅ **Timeout protection** - 10 second limit
- ✅ **Graceful failures** - User-friendly messages
- ✅ **Detailed logging** - Server-side debugging
- ✅ **Network error handling** - n8n failures

### 📊 Logging & Monitoring
- ✅ **Structured JSON logs**
- ✅ **Request ID tracking** (UUID)
- ✅ **Event categorization** (10+ event types)
- ✅ **Performance metrics** (duration tracking)
- ✅ **IP logging** (privacy-compliant)
- ✅ **Error stack traces** (server-side only)

### 🚀 Performance
- ✅ **Request timeouts** - 10s explicit
- ✅ **Payload size protection** - 10KB limit
- ✅ **Abort signals** - Proper cleanup
- ✅ **Fail-open rate limiting** - Reliability

---

## 🎯 Worker Versions Explained

### 📁 `inquiry/worker.production.js` ✅ PRODUCTION
**When to use:** Production deployment  
**Features:**
- Full Turnstile verification
- Rate limiting with KV
- Comprehensive validation
- Input sanitization
- Security headers
- Structured logging
- Error tracking
- n8n integration

**Status:** ✅ **READY FOR PRODUCTION**

### 📁 `inquiry/worker.test.js` 🧪 ENHANCED TESTING
**When to use:** Development & comprehensive testing  
**Features:**
- ✅ All production features testable!
- Rate limiting (5/5min)
- 15+ validation rules
- Input sanitization
- Security headers
- Structured logging
- Error tracking
- Request size limits
- Timeout protection
- Skips Turnstile (easy testing)
- Permissive CORS (easy testing)

**Status:** 🧪 **TEST ALL FEATURES - UPDATED!**

### 📁 `inquiry/worker.js` ⚠️ OLD VERSION
**Status:** ⚠️ **DEPRECATED - MailChannels version**

---

## 📊 Production Readiness Matrix

| Feature | Test Version (OLD) | Enhanced Test (NEW) | Production Version |
|---------|-------------------|---------------------|-------------------|
| Bot Protection | ❌ | ⚠️ Skipped | ✅ Turnstile |
| Rate Limiting | ❌ | ✅ 5/5min per IP | ✅ 5/5min per IP |
| Input Sanitization | ❌ | ✅ All fields | ✅ All fields |
| Validation Rules | 3 | ✅ 15+ | 15+ |
| Error Codes | ❌ | ✅ All errors | ✅ All errors |
| Request Tracking | ❌ | ✅ UUID | ✅ UUID |
| Security Headers | 0 | ✅ 6 headers | 6 headers |
| Structured Logs | ❌ | ✅ JSON | ✅ JSON |
| Request Size Limit | ❌ | ✅ 10KB | ✅ 10KB |
| Timeout Protection | ❌ | ✅ 10s | ✅ 10s |
| CORS | ⚠️ Permissive | ⚠️ Permissive | ✅ Restricted |
| **TESTABLE** | ❌ | ✅ **90%** | 100% |
| **PRODUCTION READY** | ❌ | ❌ | ✅ |

---

## 🔧 Required Configuration

### 1. Environment Variables (Cloudflare Dashboard)

**Inquiry Worker Secrets:**
```
TURNSTILE_SECRET_KEY  → Your Turnstile secret key
N8N_WEBHOOK_URL       → Your n8n webhook URL
N8N_API_KEY          → (Optional) API key for n8n auth
```

### 2. KV Namespace (For Rate Limiting)

```bash
# Create via CLI:
wrangler kv:namespace create "RATE_LIMIT_KV"

# Or create in Cloudflare Dashboard:
Workers & Pages → KV → Create namespace → "RATE_LIMIT_KV"
```

### 3. Turnstile Configuration

```
1. Go to Cloudflare Dashboard → Turnstile
2. Create new site: mcadroofcleaning.co.uk
3. Copy Site Key → Add to frontend
4. Copy Secret Key → Add to worker environment
```

---

## 📚 Documentation Index

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** (this file) | Overview & quick start | 5 min |
| **TESTING-GUIDE.md** | Test all features before production | 10 min |
| **PRODUCTION-DEPLOYMENT.md** | Complete deployment guide | 15 min |
| **SECURITY-CHECKLIST.md** | Pre-deployment validation | 10 min |
| **QUICK-REFERENCE.md** | Commands & troubleshooting | 5 min |
| **PRODUCTION-VS-TEST.md** | Version comparison | 10 min |
| **inquiry/README-TEST.md** | Detailed test version guide | 15 min |

---

## 🧪 Testing Your Deployment

### Test Production Worker

```powershell
# Get a fresh Turnstile token from your website, then:

$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+44 1234 567890"
    message = "Testing production inquiry worker"
    turnstileToken = "YOUR_REAL_TURNSTILE_TOKEN_HERE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://YOUR-WORKER.workers.dev/inquiry" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
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

## 📈 Monitoring

### View Real-Time Logs

**Cloudflare Dashboard:**  
Workers & Pages → mcad-inquiry-worker → Logs → Begin log stream

**CLI:**
```bash
wrangler tail mcad-inquiry-worker
```

### Key Events to Watch

| Event | Severity | Meaning |
|-------|----------|---------|
| `INQUIRY_SUCCESS` | ✅ Info | Successful submission |
| `RATE_LIMIT_EXCEEDED` | ⚠️ Warning | Too many requests from IP |
| `TURNSTILE_FAILED` | ⚠️ Warning | Bot detected |
| `N8N_REQUEST_FAILED` | ❌ Error | n8n webhook issue |
| `INTERNAL_ERROR` | 🚨 Critical | Server error |

---

## 🐛 Common Issues & Solutions

### "Service temporarily unavailable"
**Cause:** n8n webhook not reachable  
**Fix:** Check `N8N_WEBHOOK_URL` and n8n workflow status

### "Security verification failed"
**Cause:** Invalid Turnstile token  
**Fix:** Ensure frontend gets fresh tokens for each submission

### "Too many requests"
**Cause:** Rate limit exceeded (normal protection)  
**Fix:** Wait 5 minutes or adjust rate limit in code

### "Validation failed"
**Cause:** Invalid form input  
**Fix:** Check specific error message in response

---

## 🔄 Update Workflow

1. **Test changes** in `worker.test.js` first
2. **Apply approved changes** to `worker.production.js`
3. **Review security checklist**
4. **Deploy** via dashboard
5. **Monitor logs** for 15 minutes
6. **Test from live website**
7. **Verify email delivery**

---

## 🎯 Deployment Timeline

| Step | Time | Status |
|------|------|--------|
| Read deployment guide | 15 min | ⏳ |
| Create KV namespace | 2 min | ⏳ |
| Deploy inquiry worker | 5 min | ⏳ |
| Configure secrets | 3 min | ⏳ |
| Bind KV namespace | 2 min | ⏳ |
| Test deployment | 5 min | ⏳ |
| Review security checklist | 10 min | ⏳ |
| Final testing | 10 min | ⏳ |
| **Total** | **~50 min** | **Ready to start!** |

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Read `PRODUCTION-DEPLOYMENT.md`
- [ ] Review `SECURITY-CHECKLIST.md`
- [ ] KV namespace created and bound
- [ ] All secrets configured in dashboard
- [ ] Turnstile configured for your domain
- [ ] n8n webhook tested and working
- [ ] Production code deployed (NOT test version)
- [ ] CORS restricted to your domain
- [ ] Tested with real Turnstile tokens
- [ ] Email delivery verified via n8n
- [ ] Logs monitored for at least 15 minutes
- [ ] Error responses tested
- [ ] Rate limiting tested
- [ ] Documentation reviewed

---

## 📞 Support Resources

- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **Turnstile:** https://developers.cloudflare.com/turnstile/
- **KV Storage:** https://developers.cloudflare.com/kv/
- **n8n:** https://docs.n8n.io/

---

## 🎉 You're Ready!

Your production-ready workers include:

✅ Enterprise-grade security  
✅ Comprehensive validation  
✅ Advanced error handling  
✅ Structured logging  
✅ Rate limiting  
✅ Request tracking  
✅ Complete documentation  

**Next Step:** Open [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md) and start deploying!

---

**Version:** 1.0.0  
**Last Updated:** February 11, 2026  
**Status:** ✅ Production Ready  
**Deployment Time:** ~50 minutes  
**Difficulty:** Beginner-friendly (step-by-step guide)
