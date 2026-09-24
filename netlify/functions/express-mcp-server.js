import { scoreEpic } from '../lib/epic-advanced.js';
// netlify/functions/mcp.js
// GTM Alpha MCP Server Implementation for Netlify

const GTM_CONSULTANT = {
  expertiseContent: {
    corePhilosophy: `Ask any startup founder if you have a go-to-market (GTM) problem. It's entirely possible that the answer would be no because startup founders and CXOs think that GTM is a top-of-the-funnel (TOFU) problem, marketing problem, product use case problem, or sales team problem. And that's the problem.`,
    
    gtmAlphaMethodology: `Think of GTM as an evolving roadmap. Find a customer segment where a product is viable, a sale is repeatable, and an advantage is yours for the taking. If your experiment succeeds, plan to scale with all force, but keep the original variables intact. If your experiment fails, pivot till you get it right.`,
    
    mentalVelocityInsight: `From my experience with B2B buyers, I've found that optimizing for mental velocity - the speed of buyer hypothesis-to-resolution progression - is more critical than traditional funnel metrics. Focus on eliminating decision dead zones in your buyer journey.`,
    
    epicFramework: {
      E: {
        name: "Ecosystem & ABM-led Sales Motion",
        description: "Partner and data advantages, ecosystem approach, strategic alliances for competitive advantage",
        keywords: ["partners", "ecosystem", "abm", "enterprise", "integration", "channel", "alliances", "b2b"]
      },
      P: {
        name: "Product-Led Growth Acceleration", 
        description: "Engineering product as GTM engine, PLG + sales synergy, user experience optimization for conversion",
        keywords: ["product-led", "plg", "user experience", "onboarding", "activation", "self-serve", "viral", "freemium"]
      },
      I: {
        name: "Inbound & Outbound Demand Generation",
        description: "Balanced approach, high-alpha experiments, market-first content, thought leadership for category creation",
        keywords: ["content", "demand", "marketing", "channels", "campaigns", "seo", "paid", "outbound", "inbound"]
      },
      C: {
        name: "Community-Led Advocacy & Engagement",
        description: "Advocacy building, community engagement, trust development, referral programs and network effects",
        keywords: ["community", "advocacy", "engagement", "loyalty", "referrals", "events", "network", "social"]
      }
    }
  },

  // EPIC scoring: the documented advanced rubric shared with /mcp-sse (netlify/lib/epic-advanced.js), 1 to 10.
  analyzeEPICScores(challenge, companyDescription, industry, businessStage, extra) {
    const r = scoreEpic(Object.assign({}, extra || {}, { gtm_challenge: challenge, company_description: companyDescription, industry, business_stage: businessStage }));
    return Object.assign({ scores: r.scores, primaryFocus: r.primary.letter }, r);
  },

  generateConsultationReport(input) {
    const { 
      client_name = "Valued Client", 
      company_name = "Your Company", 
      company_description = "", 
      gtm_challenge = "", 
      business_stage = "growth", 
      industry = "Technology" 
    } = input;
    
    const epicAnalysis = this.analyzeEPICScores(gtm_challenge, company_description, industry, business_stage, input);
    const primaryEpicComponent = this.expertiseContent.epicFramework[epicAnalysis.primaryFocus];
    
    const insights = this.generateStrategicInsights(gtm_challenge, business_stage, epicAnalysis);
    
    const consultationOutput = `🎯 Thank you ${client_name} for taking the GTM Alpha consultation as per Shashwat Ghosh's EPIC framework.

✅ Your Enhanced Professional GTM Alpha Analysis has been Generated Successfully!

📋 Primary Focus Identified: ${primaryEpicComponent.name}
📊 EPIC Analysis (1 to 10): E:${epicAnalysis.scores.E}, P:${epicAnalysis.scores.P}, I:${epicAnalysis.scores.I}, C:${epicAnalysis.scores.C}

🧠 **Core Insight**: ${this.expertiseContent.corePhilosophy}

🎯 **Strategic Recommendation**: ${insights.strategic}

🚀 **Implementation Focus**: ${insights.implementation}

📈 **Expected Outcomes**: ${insights.outcomes}

💡 **GTM Alpha Philosophy**: ${this.expertiseContent.gtmAlphaMethodology}

🚀 Best wishes for successful GTM implementation!

Cheers,
Shashwat Ghosh
Founder and Fractional CMO`;

    return {
      consultation_output: consultationOutput,
      primary_epic_focus: primaryEpicComponent.name,
      epic_scores: epicAnalysis.scores,
      strategic_insights: insights,
      timestamp: new Date().toISOString()
    };
  },

  generateStrategicInsights(challenge, businessStage, epicAnalysis) {
    const primaryComponent = this.expertiseContent.epicFramework[epicAnalysis.primaryFocus];
    
    const insights = {
      strategic: `Your challenge requires treating GTM as a dynamic operating system where ${primaryComponent.name} becomes your primary lever for sustainable competitive advantage.`,
      
      implementation: `Focus on ${primaryComponent.description}. ${this.expertiseContent.mentalVelocityInsight}`,
      
      outcomes: `Implementation of our EPIC framework recommendations should result in improved mental velocity, reduced customer acquisition costs, and enhanced alignment across your GTM functions within 90 days.`
    };

    if (businessStage.includes('pmf')) {
      insights.strategic += ` Scale proven customer acquisition channels with strategic investment for sustainable growth.`;
    } else if (businessStage.includes('seed')) {
      insights.strategic += ` Focus on validating product-market fit while building repeatable GTM processes.`;
    } else if (businessStage.includes('series')) {
      insights.strategic += ` Optimize for scalability and systematic competitive advantage building.`;
    }

    return insights;
  },

  generateActionPlan(analysis, timeframe = "90-day") {
    const { primary_epic_focus, epic_scores } = analysis;
    
    const actionPlan = {
      immediate: [
        "Conduct mental velocity audit of current buyer journey",
        "Map decision dead zones in your GTM process", 
        "Align sales and marketing on EPIC framework priorities",
        `Assess current ${primary_epic_focus} capabilities and gaps`
      ],
      short_term: [
        `Implement ${primary_epic_focus} optimization initiatives`,
        "Establish success metrics for mental velocity tracking",
        "Create feedback loops for continuous GTM optimization",
        "Launch pilot experiments for highest-priority EPIC component"
      ],
      medium_term: [
        "Scale successful experiments across EPIC components",
        "Build systematic approach to GTM operating system",
        "Measure and optimize competitive advantage sustainability",
        "Implement advanced analytics and optimization systems"
      ]
    };

    return {
      timeframe,
      primary_focus: primary_epic_focus,
      action_plan: actionPlan,
      success_metrics: [
        "Mental velocity improvement (2-3x target)",
        "GTM efficiency increase (30%+ target)", 
        "Alignment score improvement (4+ target)",
        "Customer acquisition cost reduction (15-25%)",
        "Revenue growth acceleration"
      ]
    };
  }
};

// Main Netlify function handler (ES6 export)
export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Handle GET requests - return MCP server info
  if (req.method === 'GET') {
    const htmlHeaders = { ...headers, 'Content-Type': 'text/html' };
    
    return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>GTM Alpha MCP Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .section { background: white; margin: 20px 0; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .tool { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 GTM Alpha MCP Server</h1>
        <p>Expert Go-To-Market strategy using Shashwat Ghosh's EPIC framework</p>
    </div>
    
    <div class="section">
        <h2>🎯 Available Tools</h2>
        <div class="tool">
            <strong>gtm_consultation</strong><br>
            GTM strategy consultation using the EPIC framework
        </div>
        <div class="tool">
            <strong>epic_audit</strong><br>
            EPIC framework scores for your GTM situation
        </div>
        <div class="tool">
            <strong>generate_roadmap</strong><br>
            A GTM implementation roadmap
        </div>
    </div>
    
    <div class="section">
        <h2>📚 API Endpoints</h2>
        <p>The MCP server is at <code>https://gtmalpha.netlify.app/mcp-sse</code> (Streamable HTTP, stateless, POST only, no sign-in). Setup: <a href="/integration">/integration</a>.</p>
    </div>
    
    <div class="section">
        <h2>🚀 Get Started</h2>
        <p>Ready to optimize your GTM strategy? This server provides:</p>
        <ul>
            <li>✅ Expert GTM analysis using proven EPIC framework</li>
            <li>✅ Mental velocity optimization for faster buyer decisions</li>
            <li>✅ Actionable implementation roadmaps</li>
            <li>✅ Real expertise from Shashwat Ghosh's documented methodology</li>
        </ul>
    </div>
</body>
</html>
    `, {
      status: 200,
      headers: htmlHeaders
    });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const url = new URL(req.url);
      const inputData = await req.json();
      
      // Handle different endpoints
      if (url.pathname.endsWith('/consultation')) {
        const result = GTM_CONSULTANT.generateConsultationReport(inputData);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers
        });
      }
      
      if (url.pathname.endsWith('/audit')) {
        const epicAudit = GTM_CONSULTANT.analyzeEPICScores(
          inputData.current_challenges?.join(' ') || '',
          inputData.company_context || '',
          inputData.industry || '',
          inputData.business_stage || 'growth',
          inputData
        );
        
        return new Response(JSON.stringify({
          status: 'success',
          epic_scores: epicAudit.scores,
          epic_scale: '1 to 10',
          epic_detail: epicAudit,
          primary_focus: epicAudit.primaryFocus,
          framework_component: GTM_CONSULTANT.expertiseContent.epicFramework[epicAudit.primaryFocus],
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers
        });
      }
      
      if (url.pathname.endsWith('/roadmap')) {
        const actionPlan = GTM_CONSULTANT.generateActionPlan(
          inputData.analysis || { primary_epic_focus: 'P', epic_scores: { E: 0, P: 0, I: 0, C: 0 } },
          inputData.timeframe || '90-day'
        );
        
        return new Response(JSON.stringify({
          status: 'success',
          ...actionPlan,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers
        });
      }
      
      // Default MCP endpoint
      return new Response(JSON.stringify({ 
        status: 'GTM Alpha MCP Server running',
        name: 'gtm-alpha-consultant',
        version: '1.0.0',
        available_endpoints: [
          '/api/mcp/consultation',
          '/api/mcp/audit',
          '/api/mcp/roadmap'
        ]
      }), {
        status: 200,
        headers
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers
  });
};

// Export configuration for Netlify
export const config = {
  path: "/api/mcp"
};