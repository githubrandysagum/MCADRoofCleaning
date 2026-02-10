# Quick Start Deployment Guide

## Overview

You now have a multi-worker setup with:
- **Router Worker** - Routes requests to different services
- **Inquiry Worker** - Handles inquiry form submissions
- Path-based routing: `api.mcadroofcleaning.co.uk/inquiry`

## Step-by-Step Deployment

### 1. Prerequisites

Make sure you have Wrangler installed:
```bash
npm install -g wrangler
```

Login to Cloudflare:
```bash
wrangler login
```

### 2. Set Up Secrets for Inquiry Worker

Navigate to the inquiry worker directory:
```bash
cd workers/inquiry
```

Create your `.dev.vars` file for local development:
```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your actual values.

For production, set the secrets:
```bash
wrangler secret put TURNSTILE_SECRET_KEY
# Enter your Turnstile secret key when prompted

wrangler secret put RECIPIENT_EMAIL
# Enter your email address when prompted
```

### 3. Deploy Workers (Important: Order Matters!)

**First, deploy the inquiry worker:**
```bash
cd workers/inquiry
wrangler deploy
```

**Then, deploy the router worker:**
```bash
cd ../router
wrangler deploy
```

### 4. Configure Custom Domain in Cloudflare

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages**
3. Find and click on **mcad-api-router**
4. Go to **Settings** → **Triggers**
5. Scroll to **Custom Domains**
6. Click **Add Custom Domain**
7. Enter: `api.mcadroofcleaning.co.uk`
8. Click **Add Custom Domain**

### 5. Test Your API

Test the root endpoint:
```bash
curl https://api.mcadroofcleaning.co.uk/
```

You should see:
```json
{
  "name": "MCAD Roof Cleaning API",
  "version": "1.0.0",
  "endpoints": {
    "inquiry": "/inquiry - Submit inquiry form"
  }
}
```

### 6. Update Your Frontend

You have two options:

**Option A: Use the example code**
- See `frontend-example.js` for a complete working implementation
- Copy the relevant parts into your `scripts.js`

**Option B: Update your existing form handler**
- Change your form's fetch URL to: `https://api.mcadroofcleaning.co.uk/inquiry`
- Make sure to send the required fields: name, email, message, turnstileToken

## Adding More Services Later

When you want to add booking or quote services:

1. Create new worker folder (e.g., `workers/booking/`)
2. Create `worker.js` and `wrangler.toml` files
3. Deploy the new worker: `wrangler deploy`
4. Update `workers/router/wrangler.toml` to add service binding
5. Update `workers/router/worker.js` to add the route
6. Redeploy router: `cd workers/router && wrangler deploy`

## Troubleshooting

**Router can't find inquiry worker:**
- Make sure you deployed the inquiry worker first
- Check that the service name in router's `wrangler.toml` matches the inquiry worker's name

**CORS errors:**
- Update the `Access-Control-Allow-Origin` in both workers to match your domain
- Currently set to: `https://mcadroofcleaning.co.uk`

**Email not sending:**
- Verify your RECIPIENT_EMAIL secret is set correctly
- Check Cloudflare Workers logs for errors

## Useful Commands

```bash
# View logs for a worker
wrangler tail mcad-api-router
wrangler tail mcad-inquiry-worker

# Test locally
cd workers/router
wrangler dev

# List your workers
wrangler deployments list

# Delete a worker (if needed)
wrangler delete <worker-name>
```

## Next Steps

- Test the inquiry form on your website
- Monitor the logs for any errors
- Add additional services (booking, quotes) when ready
- Consider adding rate limiting or additional security measures

---

Need help? Check the full documentation in `workers/README.md`
