# 🧪 Enhanced Test Worker - Testing All Production Features

## ✅ What Was Updated

Your test worker (`worker.test.js`) now includes **ALL production security features** except Turnstile and strict CORS. This lets you validate everything works before deploying to production!

---

## 🎯 What You Can Now Test

### ✅ Fully Testable Features (Same as Production)

1. **Rate Limiting** (5 requests per 5 minutes per IP)
   - Test: Submit 6 requests quickly
   - Expected: 6th request gets 429 error

2. **Input Validation** (15+ rules)
   - Test: Missing name, invalid email, short message, etc.
   - Expected: 400 errors with specific messages

3. **Input Sanitization** (XSS prevention)
   - Test: Submit with `<script>` tags
   - Expected: Sanitized before sending to n8n

4. **Request Size Limits** (10KB max)
   - Test: Submit 11KB message
   - Expected: 413 error

5. **Security Headers** (6 protective headers)
   - Test: Check response headers
   - Expected: X-Content-Type-Options, X-Frame-Options, etc.

6. **Structured JSON Logging**
   - Test: Check Cloudflare logs
   - Expected: JSON format with events

7. **Error Tracking** (Request IDs)
   - Test: Check error responses
   - Expected: UUID in every response

8. **Timeout Protection** (10 seconds)
   - Test: Make n8n slow (15s delay)
   - Expected: 503 timeout error

9. **Comprehensive Error Handling**
   - Test: Various error scenarios
   - Expected: Proper error codes

10. **Phone Field in Payload**
    - Test: Submit with/without phone
    - Expected: Included in n8n payload

---

## ⚠️ What's Skipped (For Easy Testing)

1. **Turnstile Verification**
   - Why skipped: Requires fresh tokens from website
   - Test worker: Logs "TURNSTILE_SKIPPED" event
   - Production: Will verify every request

2. **Strict CORS**
   - Why skipped: Easy testing from anywhere
   - Test worker: Accepts any origin
   - Production: Only `mcadroofcleaning.co.uk`

---

## 🚀 Quick Start Testing

### Step 1: Deploy Enhanced Test Worker

Update your existing test worker:
1. Go to Cloudflare Dashboard
2. Workers & Pages → `tes-mcad-inquiry-worker`
3. Click **Edit Code**
4. Replace all code with `workers/inquiry/worker.test.js`
5. Save and Deploy

### Step 2: (Optional) Add Rate Limiting

To test rate limiting:
1. Create KV namespace: `RATE_LIMIT_KV_TEST`
2. Bind it to your worker as `RATE_LIMIT_KV`
3. Now rate limiting works!

### Step 3: Run Tests

See detailed testing guide: [workers/inquiry/README-TEST.md](inquiry/README-TEST.md)

---

## 📊 Testing Comparison

| Feature | Old Test Worker | Enhanced Test Worker | Production Worker |
|---------|----------------|---------------------|-------------------|
| Basic validation | ✅ 3 rules | ✅ 15+ rules | ✅ 15+ rules |
| Email format | ✅ Simple regex | ✅ RFC 5322 | ✅ RFC 5322 |
| Rate limiting | ❌ None | ✅ 5/5min | ✅ 5/5min |
| Input sanitization | ❌ None | ✅ XSS prevention | ✅ XSS prevention |
| Request size limit | ❌ Unlimited | ✅ 10KB | ✅ 10KB |
| Security headers | ❌ None | ✅ 6 headers | ✅ 6 headers |
| Structured logging | ❌ Console.log | ✅ JSON | ✅ JSON |
| Error codes | ❌ None | ✅ All errors | ✅ All errors |
| Request tracking | ❌ None | ✅ UUID | ✅ UUID |
| Timeout protection | ❌ None | ✅ 10s | ✅ 10s |
| Phone field | ❌ Missing | ✅ Included | ✅ Included |
| **Turnstile** | ⚠️ Skipped | ⚠️ Skipped | ✅ Enforced |
| **CORS** | ⚠️ Permissive | ⚠️ Permissive | ✅ Restricted |

---

## 🧪 Recommended Test Sequence

### Phase 1: Basic Functionality (5 min)
```powershell
# Test valid submission
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+44 1234 567890"
    message = "This is a test message to verify basic functionality"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```
✅ Should succeed, email arrives

### Phase 2: Validation Testing (10 min)
- [ ] Test missing name
- [ ] Test invalid email
- [ ] Test short message (< 10 chars)
- [ ] Test long message (> 5000 chars)
- [ ] Test invalid phone format

### Phase 3: Security Testing (10 min)
- [ ] Test XSS attempt (script tags)
- [ ] Test oversized request (> 10KB)
- [ ] Test rate limiting (6 requests)
- [ ] Check security headers
- [ ] Test invalid JSON

### Phase 4: Logging & Monitoring (5 min)
- [ ] Watch live logs in Cloudflare
- [ ] Verify structured JSON format
- [ ] Check request IDs are unique
- [ ] Verify all events logged

---

## 📝 Sample Test Script

Save this as `test-worker.ps1`:

```powershell
# Test Worker Validation Script
$workerUrl = "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev"

Write-Host "`n🧪 Testing Enhanced Worker..." -ForegroundColor Cyan

# Test 1: Valid submission
Write-Host "`nTest 1: Valid submission" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test@example.com"
        message = "Testing all production features"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri $workerUrl -Method POST `
        -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "✅ PASS - Valid submission accepted" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - Valid submission rejected" -ForegroundColor Red
}

# Test 2: Missing name
Write-Host "`nTest 2: Missing name validation" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        message = "Testing validation"
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri $workerUrl -Method POST `
        -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "❌ FAIL - Should have rejected missing name" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASS - Missing name rejected (400)" -ForegroundColor Green
    }
}

# Test 3: Invalid email
Write-Host "`nTest 3: Invalid email validation" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test"
        email = "notanemail"
        message = "Testing validation"
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri $workerUrl -Method POST `
        -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "❌ FAIL - Should have rejected invalid email" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASS - Invalid email rejected (400)" -ForegroundColor Green
    }
}

# Test 4: Rate limiting (if KV bound)
Write-Host "`nTest 4: Rate limiting (6 requests)" -ForegroundColor Yellow
$rateLimited = $false
1..6 | ForEach-Object {
    try {
        $body = @{
            name = "Test $_"
            email = "test$_@example.com"
            message = "Rate limit test $_"
        } | ConvertTo-Json
        
        Invoke-WebRequest -Uri $workerUrl -Method POST `
            -Headers @{"Content-Type"="application/json"} -Body $body | Out-Null
        Write-Host "  Request $_`: Allowed" -ForegroundColor Gray
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "  Request $_`: Rate limited (429) ✅" -ForegroundColor Green
            $rateLimited = $true
        }
    }
    Start-Sleep -Milliseconds 200
}

if ($rateLimited) {
    Write-Host "✅ PASS - Rate limiting works!" -ForegroundColor Green
} else {
    Write-Host "⚠️  SKIP - Rate limiting not active (KV not bound?)" -ForegroundColor Yellow
}

Write-Host "`n✅ Testing Complete!" -ForegroundColor Cyan
Write-Host "Check Cloudflare logs for detailed JSON events" -ForegroundColor Gray
```

Run it:
```powershell
.\test-worker.ps1
```

---

## 📊 Expected Test Results

If everything is working correctly:

```
🧪 Testing Enhanced Worker...

Test 1: Valid submission
✅ PASS - Valid submission accepted

Test 2: Missing name validation
✅ PASS - Missing name rejected (400)

Test 3: Invalid email validation
✅ PASS - Invalid email rejected (400)

Test 4: Rate limiting (6 requests)
  Request 1: Allowed
  Request 2: Allowed
  Request 3: Allowed
  Request 4: Allowed
  Request 5: Allowed
  Request 6: Rate limited (429) ✅
✅ PASS - Rate limiting works!

✅ Testing Complete!
```

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. ✅ **Validation working** - All 15+ rules enforced
2. ✅ **Sanitization working** - XSS prevented
3. ✅ **Rate limiting working** - Abuse protection active
4. ✅ **Logging working** - All events in JSON
5. ✅ **n8n integration working** - Emails arriving
6. ✅ **Error handling working** - All codes present

**You're ready for production!**

Next step: Deploy production version from `worker.production.js`:
- Same code + Turnstile verification
- Same code + Strict CORS

See: [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md)

---

## 🔐 Security Confidence

By testing with the enhanced test worker, you can be confident that:

✅ **Input validation is bulletproof** - Tested all 15+ rules  
✅ **XSS attacks are prevented** - Sanitization verified  
✅ **Rate limiting works** - Abuse protection tested  
✅ **Logging is comprehensive** - All events tracked  
✅ **Error handling is robust** - All scenarios covered  
✅ **Performance is good** - Timeouts configured  

Only remaining production additions:
- Add Turnstile (bot protection)
- Lock CORS (domain restriction)

---

## 📚 Documentation

- **Full Testing Guide:** [inquiry/README-TEST.md](inquiry/README-TEST.md)
- **Production Deployment:** [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md)
- **Quick Reference:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

---

**Status:** ✅ Ready for Comprehensive Testing  
**Version:** 2.0.0 (Enhanced Test Worker)  
**Last Updated:** February 11, 2026

Test everything now, deploy to production with confidence! 🚀
