// netlify/functions/api.js: the site's three API paths in one function, so they share one rate limit.
// Netlify's free plan allows two code-based rate-limit rules per site; the other one is on the MCP server (mcp-sse.js).
import epicAudit from "../lib/epic-audit.js";
import premiumAudit from "../lib/premium-audit.js";
import health from "../lib/health.js";

const ROUTES = { "/api/epic-audit": epicAudit, "/api/premium-audit": premiumAudit, "/api/health": health };

export default async (req, context) => {
  const route = ROUTES[new URL(req.url).pathname];
  if (!route) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }
  return route(req, context);
};

// Netlify reads this object without running the code, so the paths are written out (they match ROUTES).
export const config = {
  path: ["/api/epic-audit", "/api/premium-audit", "/api/health"],
  rateLimit: {
    windowSize: 60,
    windowLimit: 30,
    aggregateBy: ["ip", "domain"]
  }
};
