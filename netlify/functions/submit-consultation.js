// netlify/functions/submit-consultation.js
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const formData = await req.json();
    
    // Call the epic-scores function internally
    const epicResponse = await fetch('https://gtmalpha.netlify.app/api/epic-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const epicData = await epicResponse.json();
    
    // Store the consultation for future reference
    const store = getStore("consultations");
    const consultationId = epicData.consultation_id || `CONSULT-${Date.now()}`;
    
    await store.setJSON(consultationId, {
      ...formData,
      ...epicData,
      submitted_at: new Date().toISOString(),
      form_source: 'netlify_direct'
    });
    
    // Generate response HTML for the form
    const responseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GTM Analysis Complete</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 900px; margin: 50px auto; padding: 20px; }
          .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .consultation-id { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">
            <h2>✅ GTM Analysis Complete!</h2>
            <p>Your consultation ID: <span class="consultation-id">${consultationId}</span></p>
            <p>Save this ID to track your progress over time.</p>
          </div>
          ${epicData.recommendations || ''}
          <div style="margin-top: 30px;">
            <a href="/consultation" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Run Another Analysis
            </a>
            <a href="/pricing" style="background: #764ba2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              View Pricing
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return new Response(responseHtml, {
      status: 200,
      headers: { ...headers, 'Content-Type': 'text/html' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers
    });
  }
};

export const config = {
  path: "/api/submit-consultation"
};