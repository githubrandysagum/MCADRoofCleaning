/**
 * Inquiry Worker - n8n Integration (Test Version)
 * Sends form data to n8n webhook for email processing via Gmail
 * ⚠️ Skips Turnstile verification for testing - add verification for production
 */

export default {
  async fetch(request, env, ctx) {
    // Get origin from request for CORS
    const origin = request.headers.get('Origin') || '*';
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin, // For testing; restrict in production
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
      const { name, email, phone, message, turnstileToken } = data;

      // Validate required fields
      if (!name || !email || !message) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Name, email, and message are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid email format'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // ⚠️ TEST MODE: Skipping Turnstile verification
      console.log('TEST MODE: Turnstile verification skipped');
      console.log('Turnstile Token received:', turnstileToken ? 'Present' : 'Missing');

      // Prepare payload for n8n
      const n8nPayload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
        submittedAt: new Date().toISOString(),
        source: 'mcadroofcleaning.co.uk',
        testMode: true, // Flag for n8n to know this is a test
        verified: !!turnstileToken
      };

      // Send to n8n webhook
      const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: Add authentication header
          ...(env.N8N_API_KEY && { 'X-API-Key': env.N8N_API_KEY })
        },
        body: JSON.stringify(n8nPayload)
      });

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error('n8n webhook error:', errorText);
        throw new Error('Failed to send to n8n');
      }

      // Log success
      console.log('✅ Inquiry sent to n8n:', { name, email });

      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you! Your inquiry has been sent successfully.'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error processing inquiry:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request. Please try again.'
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
