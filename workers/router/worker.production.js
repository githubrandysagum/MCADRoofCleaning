/**
 * Main Router Worker - Production Version
 * Routes requests to appropriate service workers based on path
 * Includes: Security headers, error handling, logging, and health checks
 */

export default {
  async fetch(request, env, ctx) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS and Security headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://mcadroofcleaning.co.uk',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Request-ID': requestId,
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    try {
      // Log incoming request
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'ROUTER_REQUEST',
        method: request.method,
        path: path,
        ip: clientIP,
        userAgent: request.headers.get('User-Agent'),
      }));

      // Validate request origin (additional security)
      const origin = request.headers.get('Origin');
      if (origin && origin !== 'https://mcadroofcleaning.co.uk') {
        console.warn(JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          event: 'INVALID_ORIGIN',
          origin,
          ip: clientIP,
        }));
        
        // Allow for now but log suspicious activity
        // In stricter mode, you could reject here
      }

      // Route to inquiry worker
      if (path === '/inquiry' || path === '/inquiry/') {
        if (!env.INQUIRY_WORKER) {
          console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            requestId,
            event: 'SERVICE_NOT_CONFIGURED',
            service: 'INQUIRY_WORKER',
          }));
          
          return createErrorResponse(
            'Service temporarily unavailable',
            503,
            corsHeaders,
            'SERVICE_NOT_CONFIGURED',
            requestId
          );
        }

        try {
          const response = await env.INQUIRY_WORKER.fetch(request);
          
          // Log response status
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            requestId,
            event: 'ROUTE_SUCCESS',
            service: 'inquiry',
            status: response.status,
            duration: Date.now() - startTime,
          }));
          
          return response;
        } catch (error) {
          console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            requestId,
            event: 'SERVICE_ERROR',
            service: 'inquiry',
            error: error.message,
          }));
          
          return createErrorResponse(
            'Service error occurred',
            500,
            corsHeaders,
            'SERVICE_ERROR',
            requestId
          );
        }
      }

      // Health check endpoint
      if (path === '/health' || path === '/health/') {
        const healthStatus = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            inquiry: !!env.INQUIRY_WORKER,
          },
          requestId,
        };

        return new Response(JSON.stringify(healthStatus, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Root endpoint - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'MCAD Roof Cleaning API',
          version: '1.0.0',
          status: 'operational',
          timestamp: new Date().toISOString(),
          endpoints: {
            inquiry: {
              path: '/inquiry',
              method: 'POST',
              description: 'Submit inquiry form',
            },
            health: {
              path: '/health',
              method: 'GET',
              description: 'Health check endpoint',
            },
          },
          requestId,
        }, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404 for unknown paths
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'PATH_NOT_FOUND',
        path,
        ip: clientIP,
      }));

      return createErrorResponse(
        'Endpoint not found',
        404,
        corsHeaders,
        'NOT_FOUND',
        requestId
      );

    } catch (error) {
      // Catch-all error handler
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event: 'ROUTER_ERROR',
        error: error.message,
        stack: error.stack,
        path,
        ip: clientIP,
      }));

      return createErrorResponse(
        'Internal server error',
        500,
        corsHeaders,
        'INTERNAL_ERROR',
        requestId
      );
    }
  }
};

/**
 * Create standardized error response
 */
function createErrorResponse(message, status, corsHeaders, errorCode, requestId) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    errorCode,
    requestId,
    timestamp: new Date().toISOString(),
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
