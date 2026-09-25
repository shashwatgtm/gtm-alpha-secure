// The site's own addresses. A browser may call the audit API only from these origins (CORS), so another
// website cannot make its visitors' browsers write audit records here (audit check 11a). Calls from servers,
// scripts and curl are not affected by CORS.
const SITE_ORIGINS = new Set(["https://gtmalpha.gtmhelix.com", "https://gtmalpha.netlify.app"]);

export function allowedOrigin(req) {
  const origin = req && req.headers && typeof req.headers.get === "function" ? req.headers.get("origin") : null;
  return origin && SITE_ORIGINS.has(origin) ? origin : null;
}
