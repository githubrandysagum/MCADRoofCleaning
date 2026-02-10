# Simple Test Worker - No Email Sending

## 🎯 Purpose

This is the simplest test version - it just verifies that:
1. ✅ Form can submit to the worker
2. ✅ Worker receives the data
3. ✅ No CORS errors
4. ✅ Connection works

**NO email sending** - just tests the form → worker connection.

## 🚀 How to Deploy

### Via Cloudflare Dashboard:

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages** → **Create Application** → **Create Worker**
3. Name: `mcad-simple-test`
4. Click **Deploy**
5. Click **Edit Code**
6. **Delete all default code**
7. **Copy all code** from `worker.simple-test.js`
8. **Paste** into Cloudflare editor
9. Click **Save and Deploy**

**No secrets needed!** This version doesn't send emails.

## 📝 Update test-index.html

After deployment, update `test-index.html` line 47:

```javascript
window.TEST_API_URL = 'https://mcad-simple-test.YOUR_ACCOUNT.workers.dev';
```

Replace `YOUR_ACCOUNT` with your actual Cloudflare subdomain.

## 🧪 Testing

1. Open `test-index.html` in your browser
2. Fill out the form with any data
3. Click "Submit Test Inquiry"
4. You should see a success message like:

```
✅ Test successful! Worker received your inquiry.

Received data:
- Name: Your Name
- Email: your@email.com
- Message: Your message...
- Has Turnstile Token: true/false

Note: Email not sent - this is a connection test only
```

## ✅ What This Proves

If you see the success message:
- ✅ Form submits correctly
- ✅ Worker receives data
- ✅ CORS is configured properly
- ✅ JavaScript is working
- ✅ Ready to add email sending (n8n webhook or other service)

## 🔄 Next Steps

After confirming the connection works:

1. **Option A: Use n8n**
   - Update worker to send POST to your n8n webhook
   - n8n handles email sending

2. **Option B: Use email service**
   - Add Resend/SendGrid/other email service
   - Update worker to send emails

3. **Option C: Use MailChannels**
   - If your domain is on Cloudflare
   - Configure SPF records
   - Use `worker.test.js` version

## 📊 What You'll See

**Success response:**
```json
{
  "success": true,
  "message": "✅ Test successful! Worker received your inquiry.",
  "receivedData": {
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message...",
    "hasTurnstileToken": false
  },
  "note": "Email not sent - this is a connection test only"
}
```

**The success message shows:**
- ✅ Worker received your data
- ✅ Shows what data was received
- ✅ Confirms the connection works

Perfect for testing before setting up email/n8n!
