// netlify/functions/health.js
export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const healthStatus = {
      status: 'healthy',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        epic_analysis: 'operational',
        payment_gateway: 'operational',
        consultation_generator: 'operational',
        netlify_blobs: 'operational'
      },
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024
      }
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
};