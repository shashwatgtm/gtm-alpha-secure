# GTM Alpha Consultant MCP Server

A Model Context Protocol (MCP) server providing expert Go-To-Market (GTM) strategy consultation using the EPIC framework.

[![MCP Server](https://img.shields.io/badge/MCP-Server-blue)](https://modelcontextprotocol.io)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1143f7cd-ffc0-41f5-b8cd-7501dd78ba52/deploy-status)](https://app.netlify.com/projects/gtmalpha/deploys)

## Features

- **EPIC Framework Analysis** - Comprehensive GTM strategy using proprietary methodology
- **Real Backend Calculations** - Dynamic analysis based on actual business context
- **30-Day Persistence** - Consultation results cached for business consistency
- **Progress Tracking** - Compare scores across consultations over time
- **Multi-LLM Support** - Works with Claude, OpenAI GPT, Google Gemini, and more

## Live Endpoint

https://gtmalpha.netlify.app/.netlify/functions/mcp

## Installation

### Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gtm-alpha-consultant": {
      "command": "npx",
      "args": ["-y", "mcp-remote@next", "https://gtmalpha.netlify.app/.netlify/functions/mcp"]
    }
  }
}

MCP Inspector (Testing)
npx @modelcontextprotocol/inspector npx mcp-remote@next https://gtmalpha.netlify.app/.netlify/functions/mcp

The EPIC Framework
A dynamic operating system approach to go-to-market strategy by Shashwat Ghosh. Proven across 100+ B2B tech and ITES implementations.

E - Ecosystem & Account-Based Marketing (ABM)
Build and leverage partnerships with ITeS, BPO, Payment Gateways, ERP vendors
Targeted ABM strategies with refined account lists and buyer personas
ICP research to engage the right accounts effectively
Amplify reach through analyst firms, PR agencies, and trade associations
P - Product-Led Growth (PLG)
Frictionless user experience across all touchpoints
Drive customer acquisition through product-led strategies
Identify upsell/cross-sell opportunities
Implement strategies to reduce customer churn
I - Inbound & Outbound Demand Generation
Inbound: Website, SEO, social channels, performance marketing
Outbound: BDR/SDR team development, database enrichment, account research
Ensure a consistent flow of qualified leads
C - Community-Led Planning
Foster Word-of-Mouth (WoM) marketing
Develop robust reference programs and customer success stories
Engage with peer review sites
Establish customer advocacy initiatives
API Usage
Direct REST API

curl -X POST https://gtmalpha.netlify.app/.netlify/functions/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "consultation",
    "client_name": "Your Name",
    "company_name": "Your Company",
    "industry": "Technology",
    "business_stage": "venture-seed",
    "gtm_challenge": "Need better market positioning"
  }'
About
Created by Shashwat Ghosh, GTM Alpha Consultant & Fractional CMO.

Ranked #10 Product Marketing Creator in India | #52 Worldwide
24+ years Enterprise B2B experience
100+ GTM strategies implemented
B2B Marketing Professional of the Year - Fintech, 2021
Regional expertise: India, APAC, MEA, US, UK
License
MIT

Links
Live MCP Server
Main Website
GTM Expert Services
Book Consultation
