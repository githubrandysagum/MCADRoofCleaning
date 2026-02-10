/**
 * Inquiry Worker
 * Handles inquiry form submissions with Turnstile verification and email sending
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://mcadroofcleaning.co.uk',
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
            name: 'MCAD Roof Cleaning Website',
          },
          subject: `New Inquiry from ${name}`,
          content: [
            {
              type: 'text/html',
              value: `
                <h2>New Inquiry Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
              `,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
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
