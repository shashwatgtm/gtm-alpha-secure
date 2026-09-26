# GTM Alpha MCP Server v1.3.1

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-Listed-green)](https://registry.modelcontextprotocol.io)
[![npm version](https://img.shields.io/npm/v/@shashwatgtmalpha/gtm-alpha-mcp-server)](https://www.npmjs.com/package/@shashwatgtmalpha/gtm-alpha-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional Go-To-Market strategy consultation using Shashwat Ghosh's EPIC Framework

---

## Quick Start

The hosted server at https://gtmalpha.gtmhelix.com/mcp always runs the newest version and needs no install. The npm package below can lag behind it until a new version is published; compare its version with the one the hosted server reports.

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

### Option 4: REST API

For direct API access without MCP, send a JSON POST to https://gtmalpha.gtmhelix.com/api/epic-audit (documented in openapi.yaml and on https://gtmalpha.gtmhelix.com/api-docs). The inputs you send are stored with the result; see https://gtmalpha.gtmhelix.com/privacy.

---

## Integration with Other AI Platforms

### OpenAI Custom GPT

Use the OpenAPI schema in openai-gpt-actions.json to create a Custom GPT action for the EPIC audit endpoint:

1. Go to ChatGPT - Create a GPT
2. Add Actions - Import from URL or paste schema
3. Base URL: https://gtmalpha.gtmhelix.com/api (the audit inputs are stored; see https://gtmalpha.gtmhelix.com/privacy)

### Google Gemini

Use the function declarations in gemini-functions.json:

1. Import the function definitions into Google AI Studio
2. Send the calls to the MCP endpoint https://gtmalpha.gtmhelix.com/mcp as JSON-RPC 2.0 `tools/call` requests

---

## Tools and inputs

Generated on 26 September 2026 from the server's own tool list (`tools/list` of gtm-alpha-mcp-server 1.3.1, the same code as the hosted MCP address), so every tool name, title, description and input below is exactly what the server accepts. Every tool is read-only.

| # | Tool | Title | What it does |
|---|---|---|---|
| 1 | `gtm_consultation` | GTM Consultation | Get GTM strategy consultation using Shashwat Ghosh EPIC framework. Scores the four motions from 1 to 10 with the documented rubric and names the primary and secondary motion. Add the optional inputs (ACV, deal cycle, NRR, TAM, self-serve, deal source, geography) for a full score; without them the result is marked preliminary. |
| 2 | `epic_audit` | EPIC Audit | Get EPIC framework scores for your GTM strategy: Ecosystem and ABM, Product-Led Growth, Inbound and Outbound, Community-Led, each 1 to 10, with the lead motion, warnings and notes. Add the optional inputs for a full score; without them the result is marked preliminary. |
| 3 | `generate_roadmap` | GTM Roadmap | Return a GTM action plan for one EPIC motion (E Ecosystem and ABM, P Product-Led Growth, I Inbound and Outbound, C Community-Led) over 30, 60 or 90 days: immediate, short-term and medium-term steps. Builds text from the inputs only. |

### Inputs of each tool

#### 1. GTM Consultation (`gtm_consultation`)

| Input | Required | Type | Description |
|---|---|---|---|
| `gtm_challenge` | Yes | string | Your GTM challenge |
| `company_name` | No | string | Company name |
| `business_stage` | No | string | Stage: pre-seed, seed, series-a, series-b, series-c, bootstrapped (growth counts as Series B) |
| `industry` | No | string | Your industry |
| `acv_usd` | No | number (0 or more) | Optional. Average contract value per year in US dollars (for example 42000) |
| `deal_cycle_days` | No | number (0 or more) | Optional. Days from first touch to closed-won (for example 120) |
| `nrr_percent` | No | number | Optional. Net revenue retention in percent (for example 108) |
| `tam_accounts` | No | number (0 or more) | Optional. Number of addressable accounts (for example 2500) |
| `self_serve` | No | boolean | Optional. true if customers can sign up and get value without talking to sales |
| `deal_source` | No | one of: `referrals`, `outbound`, `partnerships`, `inbound`, `mixed` | Optional. Where the majority of deals come from |
| `geography` | No | one of: `india`, `us_eu`, `middle_east`, `apac`, `global` | Optional. Primary market |
| `current_channels` | No | string | Optional. What you do today (content, outbound, events, partnerships, PLG, community) |

#### 2. EPIC Audit (`epic_audit`)

| Input | Required | Type | Description |
|---|---|---|---|
| `challenge` | Yes | string | Describe your GTM situation |
| `industry` | No | string | Your industry |
| `business_stage` | No | string | Stage: pre-seed, seed, series-a, series-b, series-c, bootstrapped (growth counts as Series B) |
| `acv_usd` | No | number (0 or more) | Optional. Average contract value per year in US dollars (for example 42000) |
| `deal_cycle_days` | No | number (0 or more) | Optional. Days from first touch to closed-won (for example 120) |
| `nrr_percent` | No | number | Optional. Net revenue retention in percent (for example 108) |
| `tam_accounts` | No | number (0 or more) | Optional. Number of addressable accounts (for example 2500) |
| `self_serve` | No | boolean | Optional. true if customers can sign up and get value without talking to sales |
| `deal_source` | No | one of: `referrals`, `outbound`, `partnerships`, `inbound`, `mixed` | Optional. Where the majority of deals come from |
| `geography` | No | one of: `india`, `us_eu`, `middle_east`, `apac`, `global` | Optional. Primary market |
| `current_channels` | No | string | Optional. What you do today (content, outbound, events, partnerships, PLG, community) |

#### 3. GTM Roadmap (`generate_roadmap`)

| Input | Required | Type | Description |
|---|---|---|---|
| `primary_focus` | Yes | one of: `E`, `P`, `I`, `C` | EPIC motion to plan for: E, P, I or C |
| `timeframe` | No | one of: `30-day`, `60-day`, `90-day` | 30-day, 60-day or 90-day (default 90-day) |

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

Co-Founder and Fractional CMO, Helix GTM Consulting

- Most Admired Marketing Leaders 2025 - CMO Asia
- Award Winner: B2B Marketer of the Year 2020 - CMO Asia (Fintech Category)
- LinkedIn Top Product Marketing Voice, #10 India and #52 worldwide (Favikon verified)
- Experience: 24+ years in B2B and 10+ years of fractional experience
- Education: NIT Rourkela, Ecole des Ponts ParisTech, XLRI Jamshedpur

### Proven Results

- VP Marketing, Happay: 161% ARR growth. 2x exit: CRED ($180M), then MakeMyTrip.
- VP Performance Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025.

---

## Links

| Resource | URL |
|----------|-----|
| Website | https://gtmexpert.com |
| LinkedIn | https://www.linkedin.com/in/shashwatghosh-ai-b2b-gtm-fractionalcmo/ |
| npm Package | https://www.npmjs.com/package/@shashwatgtmalpha/gtm-alpha-mcp-server |
| GitHub | https://github.com/shashwatgtm |

---

## License

MIT License

---

Copyright 2025 Helix GTM Consulting | Shashwat Ghosh, Co-Founder and Fractional CMO

Contact: shashwat@gtmhelix.com