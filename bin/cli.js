#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// GTM Alpha Consultant Logic
const GTM_CONSULTANT = {
  expertiseContent: {
    corePhilosophy: `Ask any startup founder if you have a go-to-market (GTM) problem. It's entirely possible that the answer would be no because startup founders and CXOs think that GTM is a top-of-the-funnel (TOFU) problem, marketing problem, product use case problem, or sales team problem. And that's the problem.`,
    gtmAlphaMethodology: `Think of GTM as an evolving roadmap. Find a customer segment where a product is viable, a sale is repeatable, and an advantage is yours for the taking. If your experiment succeeds, plan to scale with all force, but keep the original variables intact. If your experiment fails, pivot till you get it right.`,
    mentalVelocityInsight: `From my experience with B2B buyers, I've found that optimizing for mental velocity - the speed of buyer hypothesis-to-resolution progression - is more critical than traditional funnel metrics.`,
    epicFramework: {
      E: { name: "Ecosystem & ABM-led Sales Motion", keywords: ["partners", "ecosystem", "abm", "enterprise", "integration", "channel", "alliances", "b2b"] },
      P: { name: "Product-Led Growth Acceleration", keywords: ["product-led", "plg", "user experience", "onboarding", "activation", "self-serve", "viral", "freemium"] },
      I: { name: "Inbound & Outbound Demand Generation", keywords: ["content", "demand", "marketing", "channels", "campaigns", "seo", "paid", "outbound", "inbound"] },
      C: { name: "Community-Led Advocacy & Engagement", keywords: ["community", "advocacy", "engagement", "loyalty", "referrals", "events", "network", "social"] }
    }
  },

  analyzeEPICScores(challenge, companyDescription, industry, businessStage) {
    const text = `${challenge} ${companyDescription} ${industry}`.toLowerCase();
    const scores = { E: 0, P: 0, I: 0, C: 0 };
    Object.keys(this.expertiseContent.epicFramework).forEach(component => {
      this.expertiseContent.epicFramework[component].keywords.forEach(keyword => {
        if (text.includes(keyword)) scores[component] += 1;
      });
    });
    if (businessStage?.includes('seed')) scores.P += 1;
    if (businessStage?.includes('series')) scores.E += 1;
    if (text.includes('enterprise') || text.includes('b2b')) scores.E += 1;
    if (text.includes('consumer') || text.includes('b2c')) scores.P += 1;
    const maxScore = Math.max(...Object.values(scores));
    return { scores, primaryFocus: Object.keys(scores).find(key => scores[key] === maxScore) || 'P' };
  },

  generateConsultation(input) {
    const { client_name = "Valued Client", company_name = "Your Company", company_description = "", gtm_challenge = "", business_stage = "growth", industry = "Technology" } = input;
    const epicAnalysis = this.analyzeEPICScores(gtm_challenge, company_description, industry, business_stage);
    const primaryComponent = this.expertiseContent.epicFramework[epicAnalysis.primaryFocus];
    return {
      consultation_output: `Thank you ${client_name} for the GTM Alpha consultation.\n\nPrimary Focus: ${primaryComponent.name}\nEPIC Scores: E:${epicAnalysis.scores.E}, P:${epicAnalysis.scores.P}, I:${epicAnalysis.scores.I}, C:${epicAnalysis.scores.C}\n\nCore Insight: ${this.expertiseContent.corePhilosophy}\n\nMethodology: ${this.expertiseContent.gtmAlphaMethodology}\n\nFor deeper consultation: https://calendly.com/shashwat-gtmhelix/45min`,
      epic_scores: epicAnalysis.scores,
      primary_focus: primaryComponent.name
    };
  }
};

// Create MCP Server
const server = new Server(
  { name: 'gtm-alpha-mcp-server', version: '1.0.3' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'gtm_consultation',
      description: 'Get GTM strategy consultation using Shashwat Ghosh EPIC framework',
      inputSchema: {
        type: 'object',
        properties: {
          client_name: { type: 'string', description: 'Your name' },
          company_name: { type: 'string', description: 'Company name' },
          company_description: { type: 'string', description: 'Brief company description' },
          gtm_challenge: { type: 'string', description: 'Your GTM challenge or question' },
          business_stage: { type: 'string', description: 'Stage: seed, series-a, growth, enterprise' },
          industry: { type: 'string', description: 'Your industry' }
        },
        required: ['gtm_challenge']
      }
    },
    {
      name: 'epic_audit',
      description: 'Get EPIC framework scores for your GTM strategy',
      inputSchema: {
        type: 'object',
        properties: {
          challenge: { type: 'string', description: 'Describe your GTM situation' },
          industry: { type: 'string', description: 'Your industry' },
          business_stage: { type: 'string', description: 'Business stage' }
        },
        required: ['challenge']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'gtm_consultation') {
    const result = GTM_CONSULTANT.generateConsultation(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
  
  if (name === 'epic_audit') {
    const result = GTM_CONSULTANT.analyzeEPICScores(args.challenge || '', '', args.industry || '', args.business_stage || '');
    const output = {
      epic_scores: result.scores,
      primary_focus: result.primaryFocus,
      recommendation: GTM_CONSULTANT.expertiseContent.epicFramework[result.primaryFocus].name
    };
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GTM Alpha MCP Server running on stdio');
}

main().catch(console.error);
