// netlify/lib/health.js (served by netlify/functions/api.js at GET /api/health): a plain liveness answer.
// It reports no environment, memory, uptime or configuration details (audit check 11b).
export default async (req) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Allow": "GET" } });
  }
  return new Response(JSON.stringify({ status: "ok", service: "GTM Alpha", version: "1.3.0", timestamp: new Date().toISOString() }), { status: 200, headers });
};
