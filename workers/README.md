# Cloudflare Workers - Multi-Worker Setup

This folder contains the Cloudflare Workers setup for MCAD Roof Cleaning API.

## Structure

```
workers/
├── router/          # Main router worker (maps to api.mcadroofcleaning.co.uk)
│   ├── worker.js
│   └── wrangler.toml
├── inquiry/         # Inquiry form handler (/inquiry)
│   ├── worker.js
│   ├── wrangler.toml
│   └── .dev.vars.example
└── README.md
```

## Setup Instructions

### 1. Install Wrangler (if not already installed)

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Up Environment Variables for Inquiry Worker

Create a `.dev.vars` file in the `inquiry/` folder:

```bash
cd workers/inquiry
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your actual values:
- `TURNSTILE_SECRET_KEY` - Your Cloudflare Turnstile secret key
- `RECIPIENT_EMAIL` - Email address to receive inquiry form submissions

For production, set secrets using:

```bash
cd workers/inquiry
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put RECIPIENT_EMAIL
```

### 4. Deploy Workers (Order Matters!)

**Deploy the inquiry worker first:**

```bash
cd workers/inquiry
wrangler deploy
```

**Then deploy the router worker:**

```bash
cd workers/router
wrangler deploy
```

### 5. Configure Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on `mcad-api-router`
3. Go to Settings → Triggers → Custom Domains
4. Add: `api.mcadroofcleaning.co.uk`

## Testing

### Test locally:

```bash
# Test inquiry worker
cd workers/inquiry
wrangler dev

# Test router worker  
cd workers/router
wrangler dev
```

### Test production:

```bash
# Test inquiry endpoint
curl -X POST https://api.mcadroofcleaning.co.uk/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message",
    "turnstileToken": "test-token"
  }'

# Test API root
curl https://api.mcadroofcleaning.co.uk/
```

## Adding New Workers

To add a new service (e.g., booking):

1. Create new folder: `workers/booking/`
2. Create `worker.js` and `wrangler.toml` (similar to contact worker)
3. Deploy the new worker: `wrangler deploy`
4. Update `workers/router/wrangler.toml` to add service binding:
   ```toml
   [[services]]
   binding = "BOOKING_WORKER"
   service = "mcad-booking-worker"
   ```
5. Update `workers/router/worker.js` to add routing:
   ```javascript
   if (path.startsWith('/booking')) {
     return await env.BOOKING_WORKER.fetch(request);
   }
   ```
6. Redeploy router: `cd workers/router && wrangler deploy`

## Update Frontend

Update your frontend code to use the new API endpoint:

```javascript
// In scripts.js
const response = await fetch('https://api.mcadroofcleaning.co.uk/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## Notes

- The router worker delegates requests to other workers based on path
- Each service worker is independent and can be deployed separately
- Service bindings allow workers to communicate efficiently
- Always deploy service workers before the router that uses them
