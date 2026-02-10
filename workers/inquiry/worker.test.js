/**
 * Inquiry Worker - TEST VERSION
 * ⚠️ WARNING: This version skips Turnstile verification for testing only!
 * Use worker.js for production deployment
 */

export default {
  async fetch(request, env, ctx) {
    // Get origin from request for CORS
    const origin = request.headers.get('Origin') || '*';
    
    // Test version: Allow CORS from anywhere (local testing, live site, etc.)
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin, // Allows localhost, 127.0.0.1, and your domain
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

      // Validate required fields (phone is optional)
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

      // ⚠️ TURNSTILE VERIFICATION SKIPPED FOR TESTING
      // In production, this would verify the token with Cloudflare
      console.log('TEST MODE: Skipping Turnstile verification');
      console.log('Turnstile Token received:', turnstileToken ? 'Present' : 'Missing');

      // Send email using MailChannels
      const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: env.RECIPIENT_EMAIL || 'info@mcadroofcleaning.co.uk' }],
            },
          ],
          from: {
            email: 'noreply@mcadroofcleaning.co.uk',
            name: 'MCAD Roof Cleaning Website (TEST)',
          },
          subject: `[TEST] New Inquiry from ${name}`,
          content: [
            {
              type: 'text/html',
              value: `
                <h2>⚠️ TEST SUBMISSION - New Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>This is a test submission. Turnstile verification was skipped.</em></p>
              `,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('MailChannels error:', errorText);
        throw new Error('Failed to send email');
      }

      return new Response(JSON.stringify({
        success: true,
        message: '✅ TEST: Your message has been sent successfully!'
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
