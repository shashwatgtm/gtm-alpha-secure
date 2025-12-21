// netlify/functions/check-config.js
// Simple diagnostic endpoint to verify configuration

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const config = {
    paypal_client_id_set: !!process.env.PAYPAL_CLIENT_ID,
    paypal_secret_set: !!process.env.PAYPAL_CLIENT_SECRET,
    url_set: !!process.env.URL,
    url_value: process.env.URL || 'NOT SET (using fallback)',
    node_env: process.env.NODE_ENV || 'NOT SET',
    paypal_mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX',
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify({
    status: 'ok',
    config: config,
    message: config.paypal_client_id_set && config.paypal_secret_set
      ? 'PayPal credentials are configured'
      : 'PayPal credentials are MISSING'
  }), {
    status: 200,
    headers
  });
};
