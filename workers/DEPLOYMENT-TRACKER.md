# Production Deployment Progress Tracker

Use this checklist to track your deployment progress. Check off each item as you complete it.

---

## 📖 Phase 1: Preparation (15-20 min)

### Documentation Review
- [ ] Read [README.md](README.md) - Overview & quick start (5 min)
- [ ] Read [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md) - Full guide (15 min)
- [ ] Review [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) - Pre-flight (10 min)
- [ ] Bookmark [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for later

### Understand the Architecture
- [ ] Understand worker.production.js features
- [ ] Understand the difference from worker.test.js
- [ ] Know what environment variables are needed
- [ ] Know what went into n8n payload

---

## 🔐 Phase 2: Cloudflare Turnstile Setup (5 min)

### Create Turnstile Site
- [ ] Go to Cloudflare Dashboard → Turnstile
- [ ] Click "Add Site"
- [ ] Site name: `MCAD Roof Cleaning`
- [ ] Domain: `mcadroofcleaning.co.uk`
- [ ] Widget Mode: **Managed** (recommended) or Invisible
- [ ] Click "Create"

### Copy Credentials
- [ ] Copy **Site Key** → Save in notes
- [ ] Copy **Secret Key** → Save in notes (keep secure!)
- [ ] Add Site Key to your website's inquiry form

---

## 🗄️ Phase 3: Create KV Namespace (2 min)

### Via Cloudflare Dashboard
- [ ] Go to Workers & Pages → KV
- [ ] Click "Create a namespace"
- [ ] Name: `RATE_LIMIT_KV`
- [ ] Click "Add"
- [ ] **Copy the Namespace ID** → Save in notes

**Namespace ID:** `________________________________`

---

## 🚀 Phase 4: Deploy Inquiry Worker (5-10 min)

### Create Worker
- [ ] Go to Workers & Pages → Create Application
- [ ] Click "Create Worker"
- [ ] Name: `mcad-inquiry-worker`
- [ ] Click "Deploy" (deploys default code)

### Upload Production Code
- [ ] Click "Edit Code" or "Quick Edit"
- [ ] **DELETE** all default code
- [ ] Open `inquiry/worker.production.js` on your computer
- [ ] **COPY ALL CODE** (450 lines)
- [ ] **PASTE** into Cloudflare editor
- [ ] Click "Save and Deploy"
- [ ] Wait for confirmation message

---

## 🔧 Phase 5: Configure Environment Secrets (5 min)

### Navigate to Settings
- [ ] Workers & Pages → `mcad-inquiry-worker`
- [ ] Click "Settings" tab
- [ ] Click "Variables and Secrets" in sidebar

### Add Secrets (Click "Encrypt" for each!)
- [ ] Click "Add variable"
  - Name: `TURNSTILE_SECRET_KEY`
  - Value: *(paste your Turnstile secret key)*
  - ✅ **Encrypt** ← IMPORTANT!
  - Click "Save"

- [ ] Click "Add variable"
  - Name: `N8N_WEBHOOK_URL`
  - Value: *(paste your n8n webhook URL)*
  - ✅ **Encrypt**
  - Click "Save"

- [ ] Click "Add variable" (Optional but recommended)
  - Name: `N8N_API_KEY`
  - Value: *(generate random string or use existing)*
  - ✅ **Encrypt**
  - Click "Save"

**Your Secrets:**
```
✅ TURNSTILE_SECRET_KEY
✅ N8N_WEBHOOK_URL
✅ N8N_API_KEY (optional)
```

---

## 🔗 Phase 6: Bind KV Namespace (2 min)

### Add KV Binding
- [ ] Still in Settings → Click "Bindings" in sidebar
- [ ] Click "Add Binding"
- [ ] Select "KV Namespace"
- [ ] Variable name: `RATE_LIMIT_KV`
- [ ] KV namespace: Select `RATE_LIMIT_KV` from dropdown
- [ ] Click "Save"

**Binding Status:**
```
✅ RATE_LIMIT_KV → (Your KV Namespace)
```

---

## 🧪 Phase 7: Testing (10-15 min)

### Get Worker URL
- [ ] Go to Settings → Triggers
- [ ] Copy your worker URL: `https://mcad-inquiry-worker.YOURNAME.workers.dev`

**Worker URL:** `________________________________________`

### Test 1: Form Submission from Website
- [ ] Go to your live website
- [ ] Open inquiry form
- [ ] Fill in test data:
  - Name: `Test User`
  - Email: `your-real-email@example.com`
  - Phone: `+44 1234 567890`
  - Message: `Testing production worker deployment`
- [ ] Complete Turnstile challenge
- [ ] Submit form
- [ ] Check for success message
- [ ] **VERIFY EMAIL RECEIVED via n8n** ✅

### Test 2: Check Logs
- [ ] Workers & Pages → `mcad-inquiry-worker`
- [ ] Click "Logs" tab
- [ ] Click "Begin log stream"
- [ ] Submit another test form
- [ ] Watch for structured JSON logs
- [ ] Look for events:
  - `INQUIRY_REQUEST_START`
  - `TURNSTILE_VERIFIED`
  - `N8N_SEND_START`
  - `INQUIRY_SUCCESS`

### Test 3: Error Handling
- [ ] Try submitting with invalid email → Should get validation error
- [ ] Try submitting without name → Should get validation error
- [ ] Try submitting 6 times quickly → Should get rate limited (5/5min)

### Test 4: Via PowerShell (Optional)
- [ ] Open PowerShell
- [ ] Get fresh Turnstile token from your website
- [ ] Run test command (see [QUICK-REFERENCE.md](QUICK-REFERENCE.md))
- [ ] Verify success response

---

## 🔍 Phase 8: Monitoring Setup (5 min)

### Configure Log Stream
- [ ] Workers & Pages → `mcad-inquiry-worker` → Logs
- [ ] Familiarize yourself with log format
- [ ] Identify key events to watch:
  - `INQUIRY_SUCCESS` (normal)
  - `RATE_LIMIT_EXCEEDED` (abuse warning)
  - `N8N_REQUEST_FAILED` (alert needed)
  - `INTERNAL_ERROR` (critical)

### Set Up Alerts (Optional but Recommended)
- [ ] Create n8n workflow to monitor for critical errors
- [ ] Set up email notifications for `N8N_REQUEST_FAILED`
- [ ] Set up email notifications for `INTERNAL_ERROR`
- [ ] Consider Cloudflare Logpush to external service

---

## 🌐 Phase 9: Custom Domain (Optional, 5 min)

### Add Custom Domain
- [ ] Workers & Pages → `mcad-inquiry-worker`
- [ ] Settings → Triggers → Custom Domains
- [ ] Click "Add Custom Domain"
- [ ] Enter: `api.mcadroofcleaning.co.uk` (or your choice)
- [ ] Click "Add Domain"
- [ ] Wait for DNS to propagate (1-5 min)

**Custom Domain:** `________________________________________`

### Update Frontend
- [ ] Update your `scripts.js` to use custom domain (if added)
- [ ] Test from website again

---

## 📋 Phase 10: Security Review (10 min)

### Go Through Security Checklist
- [ ] Open [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md)
- [ ] Check all items under "Pre-Deployment Security Review"
- [ ] Verify CORS is restricted to your domain
- [ ] Verify all secrets are encrypted
- [ ] Verify Turnstile is properly configured
- [ ] Verify rate limiting is working

---

## 📊 Phase 11: Post-Deployment Monitoring (First 24 Hours)

### First Hour
- [ ] Monitor logs every 10 minutes
- [ ] Submit 2-3 test forms
- [ ] Verify all emails arrive via n8n
- [ ] Check for any errors in logs
- [ ] Verify Turnstile challenges appear correctly

### First 24 Hours
- [ ] Check logs every 4 hours
- [ ] Monitor for abuse (rate limit hits)
- [ ] Verify n8n success rate > 98%
- [ ] Document any issues encountered
- [ ] Make notes for improvements

---

## 🎯 Phase 12: Documentation & Handoff

### Document Your Configuration
- [ ] Save all credentials in password manager:
  - Turnstile Site Key
  - Turnstile Secret Key
  - n8n Webhook URL
  - n8n API Key (if used)
  - Worker URL
  - Custom Domain (if used)
  - KV Namespace ID

### Create Internal Documentation
- [ ] Document your deployment date
- [ ] Document who has access to Cloudflare
- [ ] Document who has access to n8n
- [ ] Create runbook for common issues
- [ ] Share [QUICK-REFERENCE.md](QUICK-REFERENCE.md) with team

---

## ✅ Deployment Complete!

### Final Verification
- [ ] ✅ Worker deployed with production code
- [ ] ✅ All secrets configured
- [ ] ✅ KV namespace bound
- [ ] ✅ Turnstile working
- [ ] ✅ Forms submitting successfully
- [ ] ✅ Emails arriving via n8n
- [ ] ✅ Logs showing structured JSON
- [ ] ✅ Rate limiting active
- [ ] ✅ Security checklist reviewed
- [ ] ✅ Monitoring in place

### Celebrate! 🎉
Your production-ready Cloudflare Workers are now live with:
- ✅ Enterprise-grade security
- ✅ Bot protection (Turnstile)
- ✅ Rate limiting (abuse prevention)
- ✅ Comprehensive validation
- ✅ Input sanitization
- ✅ Structured logging
- ✅ Error tracking
- ✅ Complete documentation

---

## 📈 Metrics to Track

### Daily (First Week)
- [ ] Number of submissions
- [ ] Success rate
- [ ] Error rate
- [ ] Rate limit hits
- [ ] n8n delivery rate

### Weekly (Ongoing)
- [ ] Average response time
- [ ] Turnstile failure rate
- [ ] Top error types
- [ ] Abuse patterns

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Review logs for errors
- [ ] Check success rates
- [ ] Verify n8n is running

### Monthly
- [ ] Review security checklist
- [ ] Update documentation if needed
- [ ] Test error scenarios

### Quarterly
- [ ] Rotate credentials (recommended)
- [ ] Full security audit
- [ ] Review and optimize rate limits

### Annually
- [ ] Comprehensive security review
- [ ] Update worker code if needed
- [ ] Review and update documentation

---

## 📝 Notes & Issues

Use this space to document any issues or notes during deployment:

```
Date: ____________
Issue: ________________________________________________________________
Resolution: ___________________________________________________________

Date: ____________
Issue: ________________________________________________________________
Resolution: ___________________________________________________________

Date: ____________
Issue: ________________________________________________________________
Resolution: ___________________________________________________________
```

---

## 🆘 Need Help?

### Resources
- [ ] [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Troubleshooting
- [ ] [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md) - Full guide
- [ ] [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) - Security validation

### Common Issues
1. **"Service temporarily unavailable"** → Check n8n webhook URL
2. **"Security verification failed"** → Check Turnstile secret key
3. **"Too many requests"** → Normal (rate limit working)
4. **No emails arriving** → Check n8n workflow is active

### Cloudflare Support
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com/workers/
- Community: https://community.cloudflare.com/

---

**Deployment Started:** ____________  
**Deployment Completed:** ____________  
**Deployed By:** ____________  
**Status:** ⏳ In Progress / ✅ Complete  

---

**Version:** 1.0.0  
**Last Updated:** February 11, 2026
