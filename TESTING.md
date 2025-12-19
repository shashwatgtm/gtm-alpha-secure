\# Testing Instructions - GTM Alpha MCP Server



\## Overview



GTM Alpha MCP Server provides 3 tools for Go-To-Market strategy consultation using the EPIC Framework.



\## Available Tools



| Tool | Purpose |

|------|---------|

| gtm\_consultation | Full GTM strategy consultation |

| epic\_audit | EPIC framework scoring |

| generate\_roadmap | Implementation roadmap |



---



\## Test Case 1: GTM Consultation



Tool: gtm\_consultation



Test Input:

{

&nbsp; "client\_name": "Test User",

&nbsp; "company\_name": "TechStartup Inc",

&nbsp; "company\_description": "B2B SaaS platform for HR automation",

&nbsp; "gtm\_challenge": "We are struggling to convert enterprise leads and need help with our sales motion",

&nbsp; "business\_stage": "series-a",

&nbsp; "industry": "HR Technology"

}



Expected Output:

\- consultation\_output: Text with EPIC analysis and recommendations

\- epic\_scores: Object with E, P, I, C numeric scores

\- primary\_focus: One of the EPIC components (E, P, I, or C)



Validation:

\- Response should mention Ecosystem as primary focus (due to enterprise/B2B keywords)

\- EPIC scores should show E greater than 0

\- Output should include Calendly link for follow-up



---



\## Test Case 2: EPIC Audit



Tool: epic\_audit



Test Input:

{

&nbsp; "challenge": "We need to improve our product-led growth and user onboarding experience",

&nbsp; "industry": "SaaS",

&nbsp; "business\_stage": "seed"

}



Expected Output:

\- epic\_scores: { E: number, P: number, I: number, C: number }

\- primary\_focus: P (Product-Led due to PLG keywords)

\- recommendation: Product-Led Growth Acceleration



Validation:

\- P score should be highest due to product-led and onboarding keywords

\- primary\_focus should be P



---



\## Test Case 3: Generate Roadmap



Tool: generate\_roadmap



Test Input:

{

&nbsp; "primary\_focus": "I",

&nbsp; "timeframe": "90-day"

}



Expected Output:

\- timeframe: 90-day

\- primary\_focus: Inbound and Outbound Demand Generation

\- action\_plan: Object with immediate, short\_term, medium\_term arrays

\- success\_metrics: Array of KPIs



Validation:

\- action\_plan should have 3 phases

\- Each phase should have actionable items

\- success\_metrics should include measurable targets



---



\## Test via CLI



Install globally:

npm install -g @shashwatgtmalpha/gtm-alpha-mcp-server



Run server:

gtm-alpha-mcp



\## Test via HTTP API



curl -X POST https://gtmalpha.netlify.app/.netlify/functions/express-mcp-server/consultation -H "Content-Type: application/json" -d "{\\"gtm\_challenge\\": \\"Need help with enterprise sales\\"}"



---



\## Tool Annotations



All tools are marked as:

\- readOnlyHint: true (only returns data)

\- openWorldHint: false (no external API calls)

\- destructiveHint: false (no data modification)



---



\## Support



For issues or questions:

\- GitHub: https://github.com/shashwatgtm/gtm-alpha-secure

\- Email: shashwat@hyperplays.in



