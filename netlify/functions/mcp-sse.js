const GTM_CONSULTANT = {
  epicFramework: {
    E: { name: "Ecosystem and ABM-led Sales Motion", keywords: ["partners", "ecosystem", "abm", "enterprise", "integration", "channel", "alliances", "b2b"] },
    P: { name: "Product-Led Growth Acceleration", keywords: ["product-led", "plg", "user experience", "onboarding", "activation", "self-serve", "viral", "freemium"] },
    I: { name: "Inbound and Outbound Demand Generation", keywords: ["content", "demand", "marketing", "channels", "campaigns", "seo", "paid", "outbound", "inbound"] },
    C: { name: "Community-Led Advocacy and Engagement", keywords: ["community", "advocacy", "engagement", "loyalty", "referrals", "events", "network", "social"] }
  },

  analyzeEPIC(challenge, industry, stage) {
    const text = (challenge + " " + industry).toLowerCase();
    const scores = { E: 0, P: 0, I: 0, C: 0 };
    Object.keys(this.epicFramework).forEach(function(key) {
      this.epicFramework[key].keywords.forEach(function(kw) {
        if (text.includes(kw)) scores[key]++;
      }, this);
    }, this);
    if (stage && stage.includes("seed")) scores.P++;
    if (stage && stage.includes("series")) scores.E++;
    if (text.includes("enterprise") || text.includes("b2b")) scores.E++;
    var maxScore = Math.max(scores.E, scores.P, scores.I, scores.C);
    var primaryFocus = Object.keys(scores).find(function(k) { return scores[k] === maxScore; }) || "P";
    return { scores: scores, primaryFocus: primaryFocus, recommendation: this.epicFramework[primaryFocus].name };
  },

  generateConsultation(args) {
    var client_name = args.client_name || "Valued Client";
    var gtm_challenge = args.gtm_challenge || "";
    var business_stage = args.business_stage || "growth";
    var industry = args.industry || "Technology";
    var analysis = this.analyzeEPIC(gtm_challenge, industry, business_stage);
    return {
      consultation_output: "Thank you " + client_name + " for the GTM Alpha consultation.\n\nPrimary Focus: " + analysis.recommendation + "\nEPIC Scores: E:" + analysis.scores.E + ", P:" + analysis.scores.P + ", I:" + analysis.scores.I + ", C:" + analysis.scores.C + "\n\nFor deeper consultation: https://calendly.com/shashwat-gtmhelix/45min",
      epic_scores: analysis.scores,
      primary_focus: analysis.recommendation
    };
  },

  generateRoadmap(focus, timeframe) {
    var component = this.epicFramework[focus] || this.epicFramework.P;
    return {
      timeframe: timeframe || "90-day",
      primary_focus: component.name,
      action_plan: {
        immediate: ["Conduct GTM audit", "Map buyer journey", "Align teams on EPIC priorities"],
        short_term: ["Implement " + component.name + " initiatives", "Establish success metrics", "Create feedback loops"],
        medium_term: ["Scale successful experiments", "Build systematic GTM approach", "Optimize competitive advantage"]
      }
    };
  }
};

var TOOLS = [
  {
    name: "gtm_consultation",
    description: "Get GTM strategy consultation using Shashwat Ghosh EPIC framework",
    inputSchema: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Your name" },
        company_name: { type: "string", description: "Company name" },
        gtm_challenge: { type: "string", description: "Your GTM challenge" },
        business_stage: { type: "string", description: "Stage: seed, series-a, growth, enterprise" },
        industry: { type: "string", description: "Your industry" }
      },
      required: ["gtm_challenge"]
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "epic_audit",
    description: "Get EPIC framework scores for your GTM strategy",
    inputSchema: {
      type: "object",
      properties: {
        challenge: { type: "string", description: "Describe your GTM situation" },
        industry: { type: "string", description: "Your industry" },
        business_stage: { type: "string", description: "Business stage" }
      },
      required: ["challenge"]
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "generate_roadmap",
    description: "Generate a GTM implementation roadmap",
    inputSchema: {
      type: "object",
      properties: {
        primary_focus: { type: "string", enum: ["E", "P", "I", "C"], description: "EPIC component" },
        timeframe: { type: "string", enum: ["30-day", "60-day", "90-day"], description: "Timeframe" }
      },
      required: ["primary_focus"]
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  }
];

function handleToolCall(name, args) {
  if (name === "gtm_consultation") {
    return GTM_CONSULTANT.generateConsultation(args);
  } else if (name === "epic_audit") {
    return GTM_CONSULTANT.analyzeEPIC(args.challenge || "", args.industry || "", args.business_stage || "");
  } else if (name === "generate_roadmap") {
    return GTM_CONSULTANT.generateRoadmap(args.primary_focus || "P", args.timeframe || "90-day");
  } else {
    throw new Error("Unknown tool: " + name);
  }
}

export default async function handler(req, context) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: headers });
  }

  if (req.method === "GET") {
    var info = {
      name: "gtm-alpha-mcp-server",
      version: "1.0.5",
      description: "GTM Alpha Consultant - Professional GTM strategy using EPIC framework",
      tools: TOOLS.map(function(t) { return t.name; }),
      endpoint: "https://gtm-alpha.netlify.app/mcp-sse"
    };
    headers["Content-Type"] = "application/json";
    return new Response(JSON.stringify(info), { status: 200, headers: headers });
  }

  if (req.method === "POST") {
    try {
      var body = await req.json();
      var id = body.id;
      var method = body.method;
      var params = body.params || {};
      var response;

      if (method === "initialize") {
        response = {
          jsonrpc: "2.0",
          id: id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: { name: "gtm-alpha-mcp-server", version: "1.0.5" },
            capabilities: { tools: {} }
          }
        };
      } else if (method === "tools/list") {
        response = {
          jsonrpc: "2.0",
          id: id,
          result: { tools: TOOLS }
        };
      } else if (method === "tools/call") {
        var toolName = params.name;
        var toolArgs = params.arguments || {};
        var result = handleToolCall(toolName, toolArgs);
        response = {
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          }
        };
      } else {
        response = {
          jsonrpc: "2.0",
          id: id,
          error: { code: -32601, message: "Method not found: " + method }
        };
      }

      headers["Content-Type"] = "application/json";
      return new Response(JSON.stringify(response), { status: 200, headers: headers });

    } catch (error) {
      headers["Content-Type"] = "application/json";
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: error.message }
      }), { status: 500, headers: headers });
    }
  }

  headers["Content-Type"] = "application/json";
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: headers });
}
