# GTM Alpha MCP Server

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-Listed-green)](https://registry.modelcontextprotocol.io)
[![npm version](https://img.shields.io/npm/v/@shashwatgtmalpha/gtm-alpha-mcp-server)](https://www.npmjs.com/package/@shashwatgtmalpha/gtm-alpha-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional Go-To-Market strategy consultation using Shashwat Ghosh's EPIC Framework

---

## Quick Start

### Option 1: Claude Desktop (Recommended)

Add to your Claude Desktop config file:

Windows: %APPDATA%\Claude\claude_desktop_config.json
Mac: ~/Library/Application Support/Claude/claude_desktop_config.json

{
  "mcpServers": {
    "gtm-alpha": {
      "command": "gtm-alpha-mcp"
    }
  }
}

Restart Claude Desktop after saving.

---

### Option 2: npx (No Installation Required)

npx @shashwatgtmalpha/gtm-alpha-mcp-server

---

### Option 3: Global Install

npm install -g @shashwatgtmalpha/gtm-alpha-mcp-server
gtm-alpha-mcp

---

### Option 4: HTTP Endpoint (REST API)

For direct API access without MCP:

https://gtmalpha.netlify.app/.netlify/functions/express-mcp-server

Endpoints:
- POST /consultation - Get GTM consultation
- POST /audit - Get EPIC framework audit
- POST /roadmap - Get implementation roadmap

---

## Integration with Other AI Platforms

### OpenAI Custom GPT

Use the OpenAPI schema in openai-gpt-actions.json to create a Custom GPT:

1. Go to ChatGPT - Create a GPT
2. Add Actions - Import from URL or paste schema
3. Base URL: https://gtmalpha.netlify.app/.netlify/functions

### Google Gemini

Use the function declarations in gemini-functions.json:

1. Import the function definitions into Google AI Studio
2. Configure the API endpoint: https://gtmalpha.netlify.app/.netlify/functions/express-mcp-server

---

## Available Tools

| Tool | Description |
|------|-------------|
| gtm_consultation | Professional GTM consultation with EPIC framework analysis |
| epic_audit | Get EPIC framework scores for your GTM strategy |
| generate_roadmap | 30-60-90 day implementation roadmap |

---

## EPIC Framework

The GTM Alpha methodology is built on the EPIC Framework:

| Component | Focus Area |
|-----------|------------|
| E - Ecosystem | Account-Based Marketing and Strategic Partnerships |
| P - Product-Led | Product-Led Growth and User Experience Optimization |
| I - Inbound/Outbound | Demand Generation and Content Marketing |
| C - Community | Community-Led Growth and Advocacy Programs |

---

## About Shashwat Ghosh

AI GTM Alpha Consultant and Fractional CMO

- Most Admired Marketing Leaders 2025 - CMO Asia
- Award Winner: B2B Marketer of the Year 2020 - CMO Asia (Fintech Category)
- Favicon Ranking: #10 India, #52 Worldwide - Product Marketing Creators on LinkedIn
- Favicon Ranking: #2 India, #28 Worldwide - Product Led Growth(PLG) Creators on LinkedIn
- Experience: 24+ years B2B with verified quantifiable achievements
- Education: NIT Rourkela, Ecole des Ponts ParisTech, XLRI Jamshedpur

### Proven Results

| Achievement | Company |
|-------------|---------|
| 4X Business Growth | Airtel Data Centers |
| 161% ARR Growth | Happay |
| 178% Deal Size Increase | Happay Enterprise |
| $4.2Mn Pipeline | Locus |
| 203% Regional Achievement | Locus SEA |

---

## Links

| Resource | URL |
|----------|-----|
| Website | https://gtmexpert.com |
| LinkedIn | https://www.linkedin.com/in/shashwatghosh-ai-b2b-gtm-fractionalcmo/ |
| Book Consultation | https://calendly.com/shashwat-gtmhelix/45min |
| npm Package | https://www.npmjs.com/package/@shashwatgtmalpha/gtm-alpha-mcp-server |
| GitHub | https://github.com/shashwatgtm |

---

## License

MIT License

---

Copyright 2025 Helix GTM Consulting | Shashwat Ghosh - Fractional CMO and AI GTM Expert

Contact: shashwat@hyperplays.in