// netlify/functions/api.js: the site's API paths in one function, so they share one rate limit.
// Netlify's free plan allows two code-based rate-limit rules per site; the other one is on the MCP server (mcp-sse.js).
import epicAudit from "../lib/epic-audit.js";
import premiumAudit from "../lib/premium-audit.js";
import health from "../lib/health.js";
import { auditSeen, colleagueCheck } from "../lib/audit-seen.js";
import { jsonInert } from "../lib/escape-inputs.js";
import { countUse } from "../lib/usage-count.js";

const ROUTES = { "/api/epic-audit": epicAudit, "/api/premium-audit": premiumAudit, "/api/health": health,
  // 13 Nov 2026 (owner): the audit form asks whether a colleague ran an audit (never the earlier text without a work email check).
  "/api/audit-seen": (req) => auditSeen(req), "/api/colleague-check": (req) => colleagueCheck(req) };

export default async (req, context) => {
  const route = ROUTES[new URL(req.url).pathname];
  if (!route) {
    return new Response(jsonInert(JSON.stringify({ error: "Not found" })), { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Strict-Transport-Security": "max-age=31536000" } });
  }
  const tool = { "/api/epic-audit": "epic_audit", "/api/premium-audit": "premium_audit" }[new URL(req.url).pathname];
  if (tool) countUse("gtm-alpha", tool, req, "web", context);
  return route(req, context);
};

// Netlify reads this object without running the code, so the paths are written out (they match ROUTES).
export const config = {
  path: ["/api/epic-audit", "/api/premium-audit", "/api/health", "/api/audit-seen", "/api/colleague-check"],
  rateLimit: {
    windowSize: 60,
    windowLimit: 30,
    aggregateBy: ["ip", "domain"]
  }
};
