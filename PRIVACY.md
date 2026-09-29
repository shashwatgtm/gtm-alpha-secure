# GTM Alpha Privacy Policy

Last updated: 30 September 2026. The same policy is published at https://gtmalpha.gtmhelix.com/privacy.

Contact: Shashwat Ghosh, shashwat@gtmhelix.com

## What we collect

- **Premium Audit form (website):** your name and role, company name, company description, GTM challenge, industry, business stage, team size, monthly budget, primary focus, company website and LinkedIn URL, and, if you choose to give them, your contract value band, deal cycle band, net revenue retention band, number of addressable accounts, main deal source, primary market and whether you offer self-serve sign-up. The form sends them to `/api/premium-audit`, which builds your report in that request and returns it to your browser. Our code does not store or log them. The form does not ask for your email address, and no payment is taken.
- **EPIC audit API:** new audits are not kept. Inputs sent to `/api/epic-audit` are used only to build the result; our code does not store them. Audits saved by earlier versions (store "epic-audits") are deleted on request within 30 days.
- **MCP server (`/mcp`, also `/mcp-sse`, and the npm package):** receives the tool name and inputs of each call and uses them only to build the reply. Our code does not store or log them. The npm package runs on your computer and sends nothing to us.
- **Automatically:** our pages include no analytics or tracking scripts and set no cookies. Netlify processes each request (including IP address) and keeps its own logs. Pages load their fonts, images and scripts from this site.

## Retention

- Premium Audit form answers and reports, EPIC audit API inputs and results, and MCP tool inputs and results: not stored. New audits are not kept.
- Stored records (store "epic-audits", and the older stores "pending-payments", "gtm-consultations" and "consultations", which nothing writes to now): kept until you ask us to delete them, and deleted on request within 30 days. There is no automatic deletion.
- Netlify request logs: kept by Netlify under its own policy.

## Sharing

Netlify (hosting, database, logs) and legal authorities when required by law. We do not sell your data, share it with competitors or use it to train AI models.

## Your rights

Email shashwat@gtmhelix.com with subject "Data Rights Request" to access, correct or delete your data. Include your company name and roughly when you used the site; each stored record carries the company name you gave and the time it was saved, and we find and delete records by hand within 30 days.

## Security

HTTPS for all traffic, security headers on every page, no user accounts or passwords held by us and no payments taken, rate limits (30 requests a minute per visitor across the website's API paths, 300 a minute on the MCP server), a hidden form field that refuses automated submissions, and no public endpoint that reads stored records back.

Size limits: a request to the free EPIC audit form or the EPIC audit API may hold at most 32,000 characters, with at most 4,000 characters for the company description and for the GTM challenge; a request to the GTM Alpha tools may hold at most 65,536 bytes, with at most 4,000 characters in each text input.
