# Retired functions (switched off, not deployed)

Netlify deploys only `netlify/functions/`. The files in this folder are kept for reference and are not served.

| File | Was | Why it is switched off (25 September 2026) |
|---|---|---|
| digital-audit.js | /api/digital-audit | Owner decision 2: its "digital presence audit" never visited the website; every score came from a hash of the domain name. Switched off until it really checks websites. |
| express-mcp-server.js | /api/mcp (undocumented) | Printed "Valued Client" and invented success metrics; its documented sub-paths were unreachable. The live MCP server is /mcp (also /mcp-sse). |
| get-pricing.js | /api/pricing (already 404) | Returned prices and the digital presence audit while GTM Alpha is free during testing. |
| roadmap.js | /api/roadmap (undocumented) | Not used by any page or published API spec. |
| create-payment.js | /api/create-payment | Owner decision 3 (run 5): while GTM Alpha is free, the Premium Audit form shows the report directly with no PayPal step (netlify/lib/premium-audit.js). It stored every form in the "pending-payments" store; the new form stores nothing. Keep for a paid launch. |
| payment-success.js | /api/payment-success | Built the report after a PayPal capture. Replaced by /api/premium-audit (decision 3). Keep for a paid launch. |
| check-config.js | /api/check-config | Told anyone whether PayPal keys were set and which PayPal mode was on (audit check 11b). |
| submit-consultation.js | /api/submit-consultation (already off) | Moved here from netlify/lib on 25 September 2026; no page calls it. |
| epic-scores.js | /api/epic-scores (already off) | Moved here from netlify/lib on 25 September 2026; the live scoring is netlify/lib/epic-advanced.js. |
