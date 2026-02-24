/**
 * Main Router Worker
 * Routes requests to appropriate service workers based on path
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Get origin from request and validate against allowed origins
    const requestOrigin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://mcadroofcleaning.co.uk',
      'https://www.mcadroofcleaning.co.uk',
      'https://mcadroof.co.uk',
      'https://www.mcadroof.co.uk',
    ];
    
    // Use request origin if it's in our allowed list, otherwise use primary domain
    const corsOrigin = allowedOrigins.includes(requestOrigin) 
      ? requestOrigin 
      : 'https://www.mcadroofcleaning.co.uk';

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {
      // Route to inquiry worker
      if (path.startsWith('/inquiry')) {
        const response = await env.INQUIRY_WORKER.fetch(request);
        // Clone response and override CORS headers with router's headers
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }

      // Route to booking worker (add when ready)
      // if (path.startsWith('/booking')) {
      //   return await env.BOOKING_WORKER.fetch(request);
      // }

      // Route to quote worker (add when ready)
      // if (path.startsWith('/quote')) {
      //   return await env.QUOTE_WORKER.fetch(request);
      // }

      // Root endpoint - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'MCAD Roof Cleaning API',
          version: '1.0.0',
          endpoints: {
            inquiry: '/inquiry - Submit inquiry form',
            // booking: '/booking - Make a booking (coming soon)',
            // quote: '/quote - Request a quote (coming soon)',
          }
        }, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 404 for unknown paths
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
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
