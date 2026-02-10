/**
 * Simple Test Worker - Form Connection Test Only
 * ⚠️ This version doesn't send emails - just tests if form data reaches the worker
 */

export default {
  async fetch(request, env, ctx) {
    // Get origin from request for CORS
    const origin = request.headers.get('Origin') || '*';
    
    // Allow CORS from anywhere (local testing)
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
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

      // ✅ SUCCESS - Form data reached the worker!
      console.log('✅ Form submission received:', { name, email, message });
      
      return new Response(JSON.stringify({
        success: true,
        message: `✅ Test successful! Worker received your inquiry.`,
        receivedData: {
          name: name,
          email: email,
          message: message.substring(0, 50) + '...',
          hasTurnstileToken: !!turnstileToken
        },
        note: 'Email not sent - this is a connection test only'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error processing form:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request',
        details: error.message
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
