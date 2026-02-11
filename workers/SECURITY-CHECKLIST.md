# Production Security Checklist

## Pre-Deployment Security Review

### ✅ Code Security

#### Input Validation
- [ ] All user inputs validated (name, email, phone, message)
- [ ] Email format validation (RFC 5322 compliant)
- [ ] Length limits enforced on all fields
- [ ] Type checking for all inputs
- [ ] Required fields validation

#### Input Sanitization
- [ ] All inputs trimmed and normalized
- [ ] Null bytes removed
- [ ] Maximum lengths enforced
- [ ] HTML/XSS content prevented
- [ ] Special characters handled safely

#### Rate Limiting
- [ ] KV namespace created and bound
- [ ] Rate limit per IP configured (5 req/5min)
- [ ] Rate limit window appropriate
- [ ] Failed rate limit operations handled gracefully
- [ ] Rate limit headers sent (optional)

#### Request Security
- [ ] Max request size enforced (10KB)
- [ ] Request timeout configured (10s)
- [ ] Method validation (POST only for forms)
- [ ] Content-Type validation
- [ ] JSON parsing with error handling

---

### ✅ Turnstile Configuration

#### Dashboard Settings
- [ ] Turnstile site created for production domain
- [ ] Domain set to: `mcadroofcleaning.co.uk`
- [ ] Widget mode: Managed (or Invisible)
- [ ] Security level: Recommended
- [ ] Site key copied to frontend
- [ ] Secret key set as worker environment variable

#### Code Implementation
- [ ] Token validated on every request
- [ ] Client IP sent with verification
- [ ] Verification errors handled gracefully
- [ ] Retry logic NOT implemented (prevent abuse)
- [ ] Error codes logged for debugging

---

### ✅ CORS Configuration

#### Production Settings
- [ ] `Access-Control-Allow-Origin` set to EXACT domain
- [ ] NO wildcards (*) used
- [ ] Origin header validation in place
- [ ] OPTIONS preflight handled correctly
- [ ] Allowed methods restricted (POST, OPTIONS only)
- [ ] Allowed headers minimal (Content-Type only)

#### Verification
- [ ] Test from production domain only
- [ ] Test from other domain rejected
- [ ] Browser developer console shows no CORS errors

---

### ✅ Environment Variables & Secrets

#### Required Secrets Set
- [ ] `TURNSTILE_SECRET_KEY` - Set in dashboard
- [ ] `N8N_WEBHOOK_URL` - Set in dashboard
- [ ] `N8N_API_KEY` - Set in dashboard (recommended)

#### Secret Management
- [ ] Secrets NOT in code repository
- [ ] `.dev.vars` in `.gitignore`
- [ ] Secrets rotation plan documented
- [ ] Access to secrets restricted
- [ ] Secrets tracked in password manager

#### KV Namespace Binding
- [ ] `RATE_LIMIT_KV` namespace created
- [ ] Binding configured in wrangler.toml
- [ ] KV namespace ID documented

---

### ✅ Error Handling

#### User-Facing Errors
- [ ] Generic error messages (no stack traces)
- [ ] Helpful validation messages
- [ ] Request ID returned for tracking
- [ ] Success messages clear and friendly

#### Internal Errors
- [ ] All errors logged with structured JSON
- [ ] Request ID included in all logs
- [ ] Stack traces logged (server-side only)
- [ ] Error codes for categorization
- [ ] Timestamp in ISO format

#### Edge Cases Handled
- [ ] JSON parse errors
- [ ] Network timeouts
- [ ] n8n webhook failures
- [ ] Turnstile API failures
- [ ] KV storage failures
- [ ] Large payload rejection
- [ ] Invalid content types

---

### ✅ Logging & Monitoring

#### Structured Logging
- [ ] All logs in JSON format
- [ ] Request ID in every log entry
- [ ] Timestamp in every log entry
- [ ] Event type categorization
- [ ] IP address logged (privacy compliant)
- [ ] User agent logged

#### Key Events Logged
- [ ] `INQUIRY_REQUEST_START` - Request received
- [ ] `TURNSTILE_VERIFIED` - Verification passed
- [ ] `N8N_SEND_START` - Sending to n8n
- [ ] `INQUIRY_SUCCESS` - Successful submission
- [ ] `RATE_LIMIT_EXCEEDED` - Rate limit hit
- [ ] `VALIDATION_FAILED` - Invalid input
- [ ] All error events with details

#### Monitoring Setup
- [ ] Real-time log stream tested
- [ ] Log retention configured
- [ ] Alert rules defined (optional)
- [ ] Dashboard for key metrics (optional)

---

### ✅ n8n Integration

#### Webhook Configuration
- [ ] Production webhook URL configured
- [ ] Webhook authentication enabled
- [ ] HTTPS only
- [ ] Timeout configured (10s)
- [ ] Error responses handled

#### Payload Security
- [ ] All data sanitized before sending
- [ ] Request ID included
- [ ] Timestamp included
- [ ] Client IP included (optional)
- [ ] Sensitive data encrypted (if needed)

#### n8n Workflow
- [ ] Workflow tested with production worker
- [ ] Email sending configured
- [ ] Error handling in workflow
- [ ] Workflow activated
- [ ] Backup notification method (optional)

---

### ✅ Security Headers

#### All Headers Set
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `X-Request-ID: <uuid>` (tracking)
- [ ] `Content-Type: application/json`

#### Verification
- [ ] All headers present in responses
- [ ] Security headers test passed (securityheaders.com)

---

### ✅ Performance & Limits

#### Resource Limits
- [ ] Request size: 10KB max
- [ ] Field lengths: Appropriate for use case
- [ ] Timeout: 10s for external calls
- [ ] Rate limit: 5 req/5min per IP
- [ ] CPU time: Within worker limits

#### Performance Testing
- [ ] Response time < 2s typical
- [ ] Handles concurrent requests
- [ ] n8n responds in reasonable time
- [ ] No memory leaks observed

---

### ✅ Deployment Configuration

#### Worker Settings
- [ ] Worker name: `mcad-inquiry-worker`
- [ ] Production code deployed (NOT test version)
- [ ] Custom domain configured (optional)
- [ ] Routes configured correctly
- [ ] Environment set to production

#### Router Configuration (if used)
- [ ] Service bindings configured
- [ ] Routing logic tested
- [ ] Health check endpoint working
- [ ] 404 handling correct

---

### ✅ Testing

#### Functional Testing
- [ ] Valid submission works end-to-end
- [ ] Email received via n8n
- [ ] Required field validation works
- [ ] Optional phone field works
- [ ] Email format validation works
- [ ] Message length validation works

#### Security Testing
- [ ] XSS attempts blocked
- [ ] SQL injection not applicable
- [ ] Oversized requests rejected
- [ ] Invalid JSON rejected
- [ ] CORS from wrong domain blocked
- [ ] Rate limiting working
- [ ] Replay attacks prevented (Turnstile)

#### Error Testing
- [ ] Invalid email format rejected
- [ ] Missing required fields rejected
- [ ] Invalid Turnstile token rejected
- [ ] n8n down handled gracefully
- [ ] Timeout errors handled

---

### ✅ Documentation

#### Code Documentation
- [ ] Comments for complex logic
- [ ] Function descriptions clear
- [ ] Error codes documented
- [ ] Rate limit values documented

#### Operational Documentation
- [ ] Deployment guide created
- [ ] Troubleshooting guide created
- [ ] Monitoring guide created
- [ ] Update procedures documented
- [ ] Rollback plan documented

---

### ✅ Compliance & Privacy

#### Data Handling
- [ ] No sensitive data logged in plain text
- [ ] IP addresses handled per privacy policy
- [ ] Data retention policy considered
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Email opt-in confirmed (if applicable)

#### Legal
- [ ] Privacy policy includes form data
- [ ] Terms of service cover submissions
- [ ] Data processing agreement with n8n (if needed)

---

### ✅ Backup & Recovery

#### Rollback Plan
- [ ] Previous worker version documented
- [ ] Rollback procedure tested
- [ ] Alternative email method available
- [ ] Emergency contact method working

#### Monitoring & Alerts
- [ ] Success rate monitored
- [ ] Error rate monitored
- [ ] Email delivery monitored
- [ ] Alert thresholds set (optional)

---

## Final Pre-Launch Checklist

### 1 Hour Before Launch
- [ ] All environment variables verified
- [ ] Test submission from staging works
- [ ] n8n workflow active and tested
- [ ] Logs streaming and readable
- [ ] Rollback plan ready

### At Launch
- [ ] Deploy production worker code
- [ ] Test submission from live site
- [ ] Verify email received
- [ ] Check logs for errors
- [ ] Monitor for 15 minutes

### Post-Launch (First 24 Hours)
- [ ] Monitor logs every 2-4 hours
- [ ] Check email delivery rate
- [ ] Verify no error spikes
- [ ] Review rate limiting hits
- [ ] Test from different devices/IPs

### Post-Launch (First Week)
- [ ] Daily log review
- [ ] Weekly metrics review
- [ ] User feedback collection
- [ ] Performance optimization

---

## Security Incident Response

### If Abuse Detected
1. Check rate limiting effectiveness
2. Review logs for patterns
3. Consider IP blocking (Cloudflare firewall)
4. Tighten rate limits if needed
5. Document incident

### If Error Spike Detected
1. Check n8n webhook status
2. Verify environment variables
3. Review recent code changes
4. Consider rollback
5. Monitor logs continuously

### If Data Breach Suspected
1. Immediately disable worker
2. Review all logs
3. Notify stakeholders
4. Investigate scope
5. Implement fixes
6. Document and report

---

## Sign-Off

**Reviewed by:** _________________  
**Date:** _________________  
**Ready for Production:** [ ] YES [ ] NO  

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## Maintenance Schedule

- **Weekly:** Review logs and metrics
- **Monthly:** Security review
- **Quarterly:** Credential rotation
- **Annually:** Full security audit

**Last Updated:** February 11, 2026
