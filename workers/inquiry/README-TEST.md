# Enhanced Test Worker - Production Features Testing

## 🎯 Purpose

**Enhanced test version** with ALL production security features for testing:

### ✅ Included Production Features
- ✅ **Rate limiting** - 5 requests per 5 minutes per IP (if KV bound)
- ✅ **Input validation** - All 15+ validation rules
- ✅ **Input sanitization** - XSS prevention
- ✅ **Request size limits** - 10KB max
- ✅ **Security headers** - 6 protective headers
- ✅ **Structured JSON logging** - Same as production
- ✅ **Error tracking** - Request IDs (UUID)
- ✅ **Timeout protection** - 10 second limit
- ✅ **Comprehensive error handling** - All error codes
- ✅ **Phone field** - Included in n8n payload

### ⚠️ Testing Exclusions (for easy testing)
- ⚠️ **Turnstile verification** - Skipped (logged as skipped)
- ⚠️ **CORS restrictions** - Permissive (accepts any origin)

**Flow:**
```
Form → Cloudflare Worker (Test) → n8n Webhook → Gmail
         ↓ Tests all features
         ↓ except Turnstile & strict CORS
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

## � Optional: Set Up Rate Limiting (Recommended for Testing)

To test the rate limiting feature:

### Via Cloudflare Dashboard
1. **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name: `RATE_LIMIT_KV_TEST`
4. Click **Add**
5. **Copy the Namespace ID**
6. Go to **Workers & Pages** → **tes-mcad-inquiry-worker**
7. **Settings** → **Bindings**
8. Click **Add Binding** → **KV Namespace**
   - Variable name: `RATE_LIMIT_KV`
   - KV namespace: Select `RATE_LIMIT_KV_TEST`
   - Click **Save**

Now rate limiting will work! (5 requests per 5 minutes per IP)

---

## 🧪 Comprehensive Testing Guide

### ✅ Test 1: Basic Valid Submission

**Test:** Valid form submission

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    phone = "+44 1234 567890"
    message = "I need my roof cleaned. Can you help?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | Format-List
```

**Expected:** 
- ✅ Success response (200)
- ✅ Email received via n8n
- ✅ Logs show structured JSON events
- ✅ Request ID in response

---

### ✅ Test 2: Input Validation Rules

#### Test 2a: Missing Name
```powershell
$body = @{
    email = "test@example.com"
    message = "Test message"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```
**Expected:** 400 error - "Name is required"

#### Test 2b: Name Too Short
```powershell
$body = @{
    name = "A"
    email = "test@example.com"
    message = "Test message here"
} | ConvertTo-Json
```
**Expected:** 400 error - "Name must be at least 2 characters"

#### Test 2c: Invalid Email Format
```powershell
$body = @{
    name = "John Doe"
    email = "notanemail"
    message = "Test message here"
} | ConvertTo-Json
```
**Expected:** 400 error - "Invalid email format"

#### Test 2d: Message Too Short
```powershell
$body = @{
    name = "John Doe"
    email = "test@example.com"
    message = "Hi"
} | ConvertTo-Json
```
**Expected:** 400 error - "Message must be at least 10 characters"

#### Test 2e: Invalid Phone Format
```powershell
$body = @{
    name = "John Doe"
    email = "test@example.com"
    phone = "ABCDEFG"
    message = "Test message here"
} | ConvertTo-Json
```
**Expected:** 400 error - "Phone number contains invalid characters"

---

### ✅ Test 3: Input Sanitization (XSS Prevention)

**Test:** XSS attempt in message field

```powershell
$body = @{
    name = "John Doe"
    email = "test@example.com"
    message = "<script>alert('XSS')</script>This is a test message with malicious code"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json
```

**Expected:**
- ✅ Success (sanitization happens, doesn't reject)
- ✅ Check email - script tags should be removed/sanitized
- ✅ No malicious code execution

---

### ✅ Test 4: Request Size Limit (10KB)

**Test:** Oversized request

```powershell
# Create a message > 10KB
$largeMessage = "A" * 11000

$body = @{
    name = "John Doe"
    email = "test@example.com"
    message = $largeMessage
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Expected:** 413 error - "Request too large"

---

### ✅ Test 5: Rate Limiting (If KV Bound)

**Test:** Submit 6 requests quickly

```powershell
# Submit 6 times in a row
1..6 | ForEach-Object {
    $body = @{
        name = "Test User $_"
        email = "test$_@example.com"
        message = "Test message number $_"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body
        
        Write-Host "Request $_`: SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host "Request $_`: RATE LIMITED" -ForegroundColor Red
        Write-Host $_.Exception.Response.StatusCode
    }
    
    Start-Sleep -Milliseconds 500
}
```

**Expected:**
- ✅ First 5 requests: Success (200)
- ✅ 6th request: Rate limited (429)
- ✅ Error: "Too many requests. Please try again later."

---

### ✅ Test 6: Structured Logging

**Test:** Check logs in Cloudflare Dashboard

1. Go to **Workers & Pages** → **tes-mcad-inquiry-worker**
2. Click **Logs** → **Begin log stream**
3. Submit a test form
4. Watch for JSON log entries

**Expected log events:**
```json
{
  "timestamp": "2026-02-11T...",
  "requestId": "uuid-here",
  "event": "INQUIRY_REQUEST_START",
  "ip": "...",
  "testMode": true
}
{
  "event": "TURNSTILE_SKIPPED",
  "reason": "Test mode - would verify in production"
}
{
  "event": "N8N_SEND_START"
}
{
  "event": "INQUIRY_SUCCESS",
  "email": "test@example.com",
  "hasPhone": true
}
```

---

### ✅ Test 7: Error Codes

Test different error scenarios and verify error codes:

| Test | Expected Error Code | HTTP Status |
|------|-------------------|-------------|
| Wrong method (GET) | `METHOD_NOT_ALLOWED` | 405 |
| Request too large | `REQUEST_TOO_LARGE` | 413 |
| Invalid JSON | `INVALID_JSON` | 400 |
| Missing fields | `VALIDATION_FAILED` | 400 |
| Rate limited | `RATE_LIMIT_EXCEEDED` | 429 |
| n8n down | `N8N_CONNECTION_ERROR` | 503 |

---

### ✅ Test 8: Request ID Tracking

**Test:** Verify request IDs are unique

```powershell
# Submit 3 requests and collect request IDs
$requestIds = @()

1..3 | ForEach-Object {
    $body = @{
        name = "Test $_"
        email = "test$_@example.com"
        message = "Testing request ID tracking"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    $json = $response.Content | ConvertFrom-Json
    $requestIds += $json.requestId
    Write-Host "Request $_`: $($json.requestId)"
}

# Check all IDs are unique
if (($requestIds | Select-Object -Unique).Count -eq 3) {
    Write-Host "✅ All request IDs are unique!" -ForegroundColor Green
} else {
    Write-Host "❌ Duplicate request IDs found!" -ForegroundColor Red
}
```

**Expected:** ✅ All request IDs are unique UUIDs

---

### ✅ Test 9: Timeout Protection

**Test:** Simulate slow n8n response

This requires temporarily modifying your n8n workflow to add a delay:
1. Add a **Wait** node with 15 seconds
2. Submit a form
3. Worker should timeout after 10 seconds

**Expected:** 503 error - "Failed to send inquiry"

---

### ✅ Test 10: Security Headers

**Test:** Check response headers

```powershell
$response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{
        name = "Test"
        email = "test@example.com"
        message = "Testing headers"
    } | ConvertTo-Json)

Write-Host "`nSecurity Headers:" -ForegroundColor Yellow
$response.Headers['X-Content-Type-Options']
$response.Headers['X-Frame-Options']
$response.Headers['X-XSS-Protection']
$response.Headers['Referrer-Policy']
```

**Expected headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

### ✅ Test 11: Phone Field Optional

**Test:** Submit without phone

```powershell
$body = @{
    name = "John Doe"
    email = "test@example.com"
    message = "Testing without phone number"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Expected:** ✅ Success (phone is optional)

---

### ✅ Test 12: CORS Permissive (Test Mode)

**Test:** Request from any origin

```powershell
$response = Invoke-WebRequest -Uri "https://tes-mcad-inquiry-worker.YOURNAME.workers.dev" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "Origin"="http://localhost:3000"
    } `
    -Body (@{
        name = "Test"
        email = "test@example.com"
        message = "Testing CORS"
    } | ConvertTo-Json)

$response.Headers['Access-Control-Allow-Origin']
```

**Expected:** Returns your origin (permissive in test mode)

---

## 📊 Testing Checklist

Use this to track your testing progress:

### Input Validation
- [ ] Missing name rejected
- [ ] Name too short (< 2 chars) rejected
- [ ] Name too long (> 100 chars) rejected
- [ ] Missing email rejected
- [ ] Invalid email format rejected
- [ ] Email too long (> 255 chars) rejected
- [ ] Missing message rejected
- [ ] Message too short (< 10 chars) rejected
- [ ] Message too long (> 5000 chars) rejected
- [ ] Invalid phone format rejected
- [ ] Phone too long (> 20 chars) rejected
- [ ] Valid phone accepted
- [ ] No phone (optional) accepted

### Security Features
- [ ] XSS attempts sanitized
- [ ] Request > 10KB rejected
- [ ] Rate limiting works (6th request blocked)
- [ ] Security headers present
- [ ] Method other than POST rejected
- [ ] Invalid JSON rejected

### Logging & Tracking
- [ ] Structured JSON logs visible
- [ ] Request IDs are unique UUIDs
- [ ] All events logged correctly
- [ ] Error events logged with details
- [ ] IP addresses logged
- [ ] User agent logged

### Error Handling
- [ ] Error codes present in all errors
- [ ] Request IDs in error responses
- [ ] User-friendly error messages
- [ ] n8n timeout handled gracefully
- [ ] Network errors handled

### Integration
- [ ] n8n receives correct payload
- [ ] Email delivered successfully
- [ ] Phone field included when provided
- [ ] Request ID included in payload
- [ ] Timestamp included
- [ ] Test mode flag present

---

## 🎯 What This Tests vs Production

| Feature | Test Worker | Production Worker |
|---------|------------|-------------------|
| Rate limiting | ✅ Same | ✅ Same |
| Input validation | ✅ Same | ✅ Same |
| Input sanitization | ✅ Same | ✅ Same |
| Request size limit | ✅ Same | ✅ Same |
| Security headers | ✅ Same (except CORS) | ✅ All |
| Structured logging | ✅ Same | ✅ Same |
| Error tracking | ✅ Same | ✅ Same |
| Timeout protection | ✅ Same | ✅ Same |
| Error handling | ✅ Same | ✅ Same |
| Phone field | ✅ Same | ✅ Same |
| **Turnstile** | ⚠️ Skipped | ✅ Enforced |
| **CORS** | ⚠️ Permissive | ✅ Restricted |

---

## 🚀 Ready for Production?

Once all tests pass:
1. ✅ All validation rules working
2. ✅ Sanitization preventing XSS
3. ✅ Rate limiting functional
4. ✅ Logging showing all events
5. ✅ Error codes correct
6. ✅ n8n integration working
7. ✅ Email delivery confirmed

**Next step:** Deploy production version with:
- Full Turnstile verification
- Restricted CORS to your domain only
- Same everything else!

See: [../PRODUCTION-DEPLOYMENT.md](../PRODUCTION-DEPLOYMENT.md)

---

## 🔒 Security Notes

This test version:
- ⚠️ **CORS is permissive** - Test from anywhere
- ⚠️ **Turnstile is skipped** - No bot verification
- ✅ **All other security features active**
- ✅ **Production-equivalent validation**
- ✅ **Production-equivalent logging**
- ✅ **Safe for testing, NOT for production**

---

**Version:** 2.0.0 (Enhanced with Production Features)  
**Last Updated:** February 11, 2026  
**Status:** ✅ Ready for Comprehensive Testing

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
