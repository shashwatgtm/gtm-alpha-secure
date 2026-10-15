// netlify/functions/api.js: the site's three API paths in one function, so they share one rate limit.
// Netlify's free plan allows two code-based rate-limit rules per site; the other one is on the MCP server (mcp-sse.js).
import epicAudit from "../lib/epic-audit.js";
import premiumAudit from "../lib/premium-audit.js";
import health from "../lib/health.js";
import { neutraliseAnswer, neutraliseJsonText } from "../lib/echo-safe.js";

// Run 34D: every string of a JSON reply passes through neutraliseAnswer (the parser based answer pass), so text that a reply
// repeats or joins cannot form live markup; when nothing changes the reply keeps its exact bytes.
function answerStrings(value) {
  if (typeof value === "string") return neutraliseAnswer(value);
  if (Array.isArray(value)) return value.map(answerStrings);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, answerStrings(v)]));
  return value;
}
async function answerReply(res) {
  if (!res.body || res.status === 204 || res.status === 304 || !(res.headers.get("content-type") || "").includes("application/json")) return res;
  const text = await res.text();
  let next = text;
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  if (json === undefined) next = neutraliseAnswer(text);
  else {
    const safe = answerStrings(json);
    // Run 36D (register 34D-4): the JSON text itself is checked too (a JSON "[" can open a link that a value closes), with HTML
    // entities so the JSON stays valid; a reply with no live markup keeps its exact bytes.
    next = neutraliseJsonText(JSON.stringify(safe) !== JSON.stringify(json) ? JSON.stringify(safe) : text, 0);
  }
  return new Response(next, { status: res.status, statusText: res.statusText, headers: res.headers });
}

const ROUTES = { "/api/epic-audit": epicAudit, "/api/premium-audit": premiumAudit, "/api/health": health };

export default async (req, context) => {
  const route = ROUTES[new URL(req.url).pathname];
  if (!route) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Strict-Transport-Security": "max-age=31536000" } });
  }
  return answerReply(await route(req, context));
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
