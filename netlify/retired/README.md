# Retired functions (switched off, not deployed)

Netlify deploys only `netlify/functions/`. The files in this folder are kept for reference and are not served.

| File | Was | Why it is switched off (25 September 2026) |
|---|---|---|
| digital-audit.js | /api/digital-audit | Owner decision 2: its "digital presence audit" never visited the website; every score came from a hash of the domain name. Switched off until it really checks websites. |
| express-mcp-server.js | /api/mcp (undocumented) | Printed "Valued Client" and invented success metrics; its documented sub-paths were unreachable. The live MCP server is /mcp-sse. |
| get-pricing.js | /api/pricing (already 404) | Returned prices and the digital presence audit while GTM Alpha is free during testing. |
| roadmap.js | /api/roadmap (undocumented) | Not used by any page or published API spec. |
