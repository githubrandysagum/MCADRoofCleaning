/**
 * Inquiry Worker
 * Handles inquiry form submissions with Turnstile verification and n8n integration
 */

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://mcadroofcleaning.co.uk',
      'https://www.mcadroofcleaning.co.uk',
    ];
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    try {
      const data = await request.json();
      const { name, email, message, turnstileToken } = data;

      // Validate required fields
      if (!name || !email || !message || !turnstileToken) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Name, email, message, and verification are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Verify Turnstile token
      const turnstileVerification = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );

      const turnstileResult = await turnstileVerification.json();

      if (!turnstileResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Verification failed. Please try again.'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Send to n8n webhook
      const n8nPayload = {
        name,
        email,
        message,
        submittedAt: new Date().toISOString(),
      };

      const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.N8N_API_KEY ? { 'X-API-Key': env.N8N_API_KEY } : {}),
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!n8nResponse.ok) {
        throw new Error('Failed to send to n8n webhook');
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Your message has been sent successfully!'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error processing inquiry form:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
