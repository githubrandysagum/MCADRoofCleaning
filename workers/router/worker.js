/**
 * Main Router Worker
 * Routes requests to appropriate service workers based on path
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://mcadroofcleaning.co.uk',
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
        return await env.INQUIRY_WORKER.fetch(request);
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
