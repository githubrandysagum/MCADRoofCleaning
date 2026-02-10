# Test Page Instructions

## 📄 test-index.html

This is a test version of your website that connects to the test worker (no Turnstile verification required).

## 🎯 How to Use

### Step 1: Deploy Test Worker

First, deploy the test worker via Cloudflare Dashboard (as explained in `workers/inquiry/README-TEST.md`)

### Step 2: Get Worker URL

After deployment, copy your worker URL. It will look like:
```
https://mcad-inquiry-worker-test.YOUR_ACCOUNT.workers.dev
```

### Step 3: Update test-index.html

1. Open `test-index.html` in a text editor
2. Find this line (around line 47):
```javascript
window.TEST_API_URL = 'https://mcad-inquiry-worker-test.YOUR_ACCOUNT.workers.dev';
```
3. Replace `YOUR_ACCOUNT` with your actual Cloudflare account subdomain
4. Save the file

### Step 4: Open in Browser

Simply double-click `test-index.html` or open it in your browser:
- `file:///C:/Users/randy/.../test-index.html`
- Or use Live Server in VS Code
- Or `http://localhost:5500/test-index.html`

### Step 5: Test the Form

1. Fill out the inquiry form
2. The Turnstile widget will show but **verification is skipped**
3. Click "Submit Test Inquiry"
4. Check your email for `[TEST]` inquiry
5. ✅ No CORS errors!
6. ✅ Works from localhost!
7. ✅ Works without Turnstile!

## 🔍 Visual Indicators

The test page has:
- 🧪 Orange banner at top showing "TEST MODE"
- Shows which worker URL it's using
- Form title says "TEST FORM"
- Warning message before form
- Button says "Submit Test Inquiry"
- Emails marked with `[TEST]` prefix

## 🔄 What's Different from Production

### test-index.html
- ✅ Sets `window.TEST_MODE = true`
- ✅ Sets `window.TEST_API_URL` to test worker
- ✅ Visual test indicators
- ✅ `<meta robots="noindex, nofollow">` (won't be indexed by Google)

### scripts.js (Updated)
- ✅ Checks for `window.TEST_MODE`
- ✅ Uses `window.TEST_API_URL` when in test mode
- ✅ Falls back to production URL in normal mode
- ✅ Logs which URL it's using to console

### Original index.html
- ✅ Unchanged
- ✅ Still points to production API
- ✅ Still requires Turnstile

## ⚠️ Important

**Never deploy test-index.html to your live website!**

This is for **local testing only**. It's configured to skip security checks.

## 🚀 When Ready for Production

1. Test thoroughly with `test-index.html`
2. Deploy production `worker.js` (not `worker.test.js`)
3. Add both secrets (TURNSTILE_SECRET_KEY and RECIPIENT_EMAIL)
4. Configure custom domain to production worker
5. Your regular `index.html` will use the production worker automatically

---

Happy testing! 🎉
