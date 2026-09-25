# GTM Alpha Privacy Policy

Last updated: September 24, 2026. The same policy is published at https://gtmalpha.gtmhelix.com/privacy.

Contact: Shashwat Ghosh, shashwat@gtmhelix.com

## What we collect

- **Consultation form (website):** your name, company name, company description, GTM challenge, industry, business stage, team size, monthly budget, company website and LinkedIn URL, and, if you choose to give them, your contract value band, deal cycle band, net revenue retention band, number of addressable accounts, main deal source, primary market and whether you offer self-serve sign-up. Saved in our Netlify Blobs database (store "pending-payments") when you submit the form. The company name is also sent to PayPal in the order description. The form does not ask for your email address.
- **EPIC audit API:** inputs sent to `/api/epic-audit` are saved with the result (store "epic-audits").
- **MCP server (`/mcp-sse`, and the npm package):** receives the tool name and inputs of each call and uses them only to build the reply. Our code does not store or log them. The npm package runs on your computer and sends nothing to us.
- **Automatically:** our pages include no analytics or tracking scripts and set no cookies. Netlify processes each request (including IP address) and keeps its own logs. Pages load their fonts and images from this site, and the generated report loads a PDF library from cdnjs.
- **Payments:** handled on PayPal's pages; we never see card or bank details.

## Retention

- Stored records (stores "pending-payments", "epic-audits", and older "gtm-consultations" and "consultations"): kept until you ask us to delete them. There is no automatic deletion.
- MCP tool inputs and results: not stored.
- Netlify request logs and PayPal payment records: kept by Netlify and PayPal under their own policies.

## Sharing

Netlify (hosting, database, logs), PayPal (payments; receives your company name), cdnjs (receives your IP address when the report's PDF library loads), and legal authorities when required by law. We do not sell your data, share it with competitors or use it to train AI models.

## Your rights

Email shashwat@gtmhelix.com with subject "Data Rights Request" to access, correct or delete your data. Include your company name and roughly when you used the site; records are stored by company name and time, and we find and delete them by hand within 30 days.

## Security

HTTPS for all traffic, payments on PayPal's pages, no user accounts or passwords held by us, rate limits on the forms, APIs and MCP server, and no public endpoint that reads stored records back.
