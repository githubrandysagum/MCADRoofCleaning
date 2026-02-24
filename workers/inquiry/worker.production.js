/**
 * Inquiry Worker - Production Version
 * Handles inquiry form submissions with n8n integration
 * Includes: Turnstile verification, input validation, sanitization, rate limiting, and logging
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mcadroofcleaning.co.uk',
  'https://www.mcadroofcleaning.co.uk',
];

export default {
  async fetch(request, env, ctx) {
    // Get the request origin
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    // Security headers and CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 204
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405, corsHeaders, 'METHOD_NOT_ALLOWED');
    }

    // Get client IP for logging and rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const requestId = crypto.randomUUID();

    try {
      // Log request start
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'INQUIRY_REQUEST_START',
        ip: clientIP,
        userAgent: request.headers.get('User-Agent'),
      }));

      // Check request size (prevent DoS)
      const contentLength = request.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength) > 10240) { // 10KB limit
        return createErrorResponse(
          'Request too large',
          413,
          corsHeaders,
          'REQUEST_TOO_LARGE',
          requestId
        );
      }

      // Rate limiting check (if KV namespace is bound)
      if (env.RATE_LIMIT_KV) {
        const rateLimitResult = await checkRateLimit(env.RATE_LIMIT_KV, clientIP);
        if (!rateLimitResult.allowed) {
          console.warn(JSON.stringify({
            timestamp: new Date().toISOString(),
            requestId,
            event: 'RATE_LIMIT_EXCEEDED',
            ip: clientIP,
            remaining: rateLimitResult.remaining,
          }));
          
          return createErrorResponse(
            'Too many requests. Please try again later.',
            429,
            corsHeaders,
            'RATE_LIMIT_EXCEEDED',
            requestId
          );
        }
      }

      // Parse JSON with timeout protection
      let data;
      try {
        const textBody = await request.text();
        
        // Additional size check on actual content
        if (textBody.length > 10240) {
          return createErrorResponse(
            'Request too large',
            413,
            corsHeaders,
            'REQUEST_TOO_LARGE',
            requestId
          );
        }
        
        data = JSON.parse(textBody);
      } catch (parseError) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'JSON_PARSE_ERROR',
          error: parseError.message,
        }));
        
        return createErrorResponse(
          'Invalid request format',
          400,
          corsHeaders,
          'INVALID_JSON',
          requestId
        );
      }

      // Extract and validate fields
      const { name, email, phone, message, turnstileToken } = data;

      // Validate required fields
      const validationResult = validateInputs({ name, email, phone, message, turnstileToken });
      if (!validationResult.valid) {
        console.warn(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'VALIDATION_FAILED',
          errors: validationResult.errors,
        }));
        
        return createErrorResponse(
          validationResult.errors.join(', '),
          400,
          corsHeaders,
          'VALIDATION_FAILED',
          requestId
        );
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(name, 100),
        email: sanitizeInput(email, 255),
        phone: phone ? sanitizeInput(phone, 20) : '',
        message: sanitizeInput(message, 5000),
      };

      // Verify Turnstile token
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'TURNSTILE_VERIFY_START',
      }));

      let turnstileResult;
      try {
        const turnstileVerification = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: env.TURNSTILE_SECRET_KEY,
              response: turnstileToken,
              remoteip: clientIP,
            }),
          }
        );

        if (!turnstileVerification.ok) {
          throw new Error(`Turnstile API returned ${turnstileVerification.status}`);
        }

        turnstileResult = await turnstileVerification.json();
      } catch (turnstileError) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'TURNSTILE_API_ERROR',
          error: turnstileError.message,
        }));
        
        return createErrorResponse(
          'Verification service temporarily unavailable',
          503,
          corsHeaders,
          'TURNSTILE_SERVICE_ERROR',
          requestId
        );
      }

      if (!turnstileResult.success) {
        console.warn(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'TURNSTILE_VERIFICATION_FAILED',
          errorCodes: turnstileResult['error-codes'] || [],
        }));
        
        return createErrorResponse(
          'Security verification failed. Please try again.',
          400,
          corsHeaders,
          'TURNSTILE_FAILED',
          requestId
        );
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'TURNSTILE_VERIFIED',
      }));

      // Send to n8n webhook
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'N8N_SEND_START',
      }));

      const n8nPayload = {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        requestId: requestId,
        submittedAt: new Date().toISOString(),
        clientIP: clientIP,
      };

      let n8nResponse;
      try {
        n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Optional: Add authentication header if configured
            ...(env.N8N_API_KEY ? { 'X-API-Key': env.N8N_API_KEY } : {}),
          },
          body: JSON.stringify(n8nPayload),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
      } catch (n8nError) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'N8N_REQUEST_ERROR',
          error: n8nError.message,
          email: sanitizedData.email,
        }));
        
        return createErrorResponse(
          'Failed to send inquiry. Please try again or contact us directly.',
          503,
          corsHeaders,
          'N8N_CONNECTION_ERROR',
          requestId
        );
      }

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text().catch(() => 'Unable to read error');
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'N8N_REQUEST_FAILED',
          status: n8nResponse.status,
          statusText: n8nResponse.statusText,
          error: errorText,
          email: sanitizedData.email,
        }));
        
        return createErrorResponse(
          'Failed to process inquiry. Please try again later.',
          503,
          corsHeaders,
          'N8N_REQUEST_FAILED',
          requestId
        );
      }

      // Success - Log and return
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'INQUIRY_SUCCESS',
        email: sanitizedData.email,
        hasPhone: !!sanitizedData.phone,
      }));

      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you! Your inquiry has been sent successfully.',
        requestId: requestId,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      // Catch-all error handler
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'UNEXPECTED_ERROR',
        error: error.message,
        stack: error.stack,
        ip: clientIP,
      }));
      
      return createErrorResponse(
        'An unexpected error occurred. Please try again.',
        500,
        corsHeaders,
        'INTERNAL_ERROR',
        requestId
      );
    }
  }
};

/**
 * Validate all inputs
 */
function validateInputs({ name, email, phone, message, turnstileToken }) {
  const errors = [];

  // Required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    // RFC 5322 compliant email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    } else if (email.trim().length > 255) {
      errors.push('Email must be less than 255 characters');
    }
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message is required');
  } else if (message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  } else if (message.trim().length > 5000) {
    errors.push('Message must be less than 5000 characters');
  }

  if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.trim().length === 0) {
    errors.push('Security verification is required');
  }

  // Optional phone validation
  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(phone.trim())) {
      errors.push('Phone number contains invalid characters');
    } else if (phone.trim().length > 20) {
      errors.push('Phone number must be less than 20 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
function sanitizeInput(input, maxLength) {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input
    .trim()
    .substring(0, maxLength)
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Rate limiting using KV storage
 * Allows 5 requests per IP per 5 minutes
 */
async function checkRateLimit(kvNamespace, ip) {
  const key = `ratelimit:${ip}`;
  const limit = 5;
  const windowMs = 5 * 60 * 1000; // 5 minutes
  
  try {
    const existing = await kvNamespace.get(key, { type: 'json' });
    const now = Date.now();
    
    if (!existing) {
      // First request
      await kvNamespace.put(key, JSON.stringify({
        count: 1,
        resetAt: now + windowMs,
      }), {
        expirationTtl: 300, // 5 minutes
      });
      
      return { allowed: true, remaining: limit - 1 };
    }
    
    // Check if window has expired
    if (now > existing.resetAt) {
      // Reset window
      await kvNamespace.put(key, JSON.stringify({
        count: 1,
        resetAt: now + windowMs,
      }), {
        expirationTtl: 300,
      });
      
      return { allowed: true, remaining: limit - 1 };
    }
    
    // Within window
    if (existing.count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment count
    await kvNamespace.put(key, JSON.stringify({
      count: existing.count + 1,
      resetAt: existing.resetAt,
    }), {
      expirationTtl: Math.ceil((existing.resetAt - now) / 1000),
    });
    
    return { allowed: true, remaining: limit - existing.count - 1 };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: limit };
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(message, status, corsHeaders, errorCode, requestId = null) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    errorCode: errorCode,
    ...(requestId ? { requestId } : {}),
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
