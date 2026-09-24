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
      consultation_output: "Thank you " + client_name + " for the GTM Alpha consultation.\n\nPrimary Focus: " + analysis.recommendation + "\nEPIC Scores: E:" + analysis.scores.E + ", P:" + analysis.scores.P + ", I:" + analysis.scores.I + ", C:" + analysis.scores.C,
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
    title: "GTM Consultation",
    description: "Get GTM strategy consultation using Shashwat Ghosh EPIC framework",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Company name" },
        gtm_challenge: { type: "string", description: "Your GTM challenge" },
        business_stage: { type: "string", description: "Stage: seed, series-a, growth, enterprise" },
        industry: { type: "string", description: "Your industry" }
      },
      required: ["gtm_challenge"]
    },
    annotations: { title: "GTM Consultation", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "epic_audit",
    title: "EPIC Audit",
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
    annotations: { title: "EPIC Audit", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "generate_roadmap",
    title: "GTM Roadmap",
    description: "Generate a GTM implementation roadmap",
    inputSchema: {
      type: "object",
      properties: {
        primary_focus: { type: "string", enum: ["E", "P", "I", "C"], description: "EPIC component" },
        timeframe: { type: "string", enum: ["30-day", "60-day", "90-day"], description: "Timeframe" }
      },
      required: ["primary_focus"]
    },
    annotations: { title: "GTM Roadmap", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
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

// ---------------------------------------------------------------------------
// MCP transport: Streamable HTTP, stateless, JSON responses (POST only).
// Transport layer only; the tool logic above is unchanged.
// ---------------------------------------------------------------------------

var SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function reply(status, body, extraHeaders) {
  var headers = Object.assign({ "Content-Type": "application/json" }, CORS_HEADERS, extraHeaders || {});
  return new Response(body === null ? null : JSON.stringify(body), { status: status, headers: headers });
}

function rpcError(id, code, message, status, extraHeaders) {
  return reply(status || 200, { jsonrpc: "2.0", id: id === undefined ? null : id, error: { code: code, message: message } }, extraHeaders);
}

function toolError(id, text) {
  return reply(200, { jsonrpc: "2.0", id: id, result: { content: [{ type: "text", text: text }], isError: true } });
}

function missingRequired(tool, args) {
  var required = (tool.inputSchema && tool.inputSchema.required) || [];
  return required.filter(function(key) { return args[key] === undefined || args[key] === null; });
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return rpcError(null, -32000, "Method not allowed. This MCP endpoint accepts POST requests only (Streamable HTTP, stateless). Setup: https://gtmalpha.netlify.app/integration", 405, { "Allow": "POST, OPTIONS" });
  }

  var body;
  try {
    body = await req.json();
  } catch (parseError) {
    return rpcError(null, -32700, "Parse error: the request body is not valid JSON.", 400);
  }

  if (Array.isArray(body)) {
    return rpcError(null, -32600, "Invalid request: batch requests are not supported. Send one JSON-RPC message per request.", 400);
  }
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return rpcError(body && body.id, -32600, "Invalid request: expected a JSON-RPC 2.0 message with a method.", 400);
  }

  var id = body.id;
  var method = body.method;
  var params = body.params || {};

  // Notifications (no id) need no reply body.
  if (id === undefined) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  try {
    if (method === "initialize") {
      var requested = params.protocolVersion;
      var version = SUPPORTED_PROTOCOL_VERSIONS.indexOf(requested) >= 0 ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
      return reply(200, {
        jsonrpc: "2.0",
        id: id,
        result: {
          protocolVersion: version,
          serverInfo: { name: "gtm-alpha-mcp-server", version: "1.1.0" },
          capabilities: { tools: {} }
        }
      });
    }

    if (method === "ping") {
      return reply(200, { jsonrpc: "2.0", id: id, result: {} });
    }

    if (method === "tools/list") {
      return reply(200, { jsonrpc: "2.0", id: id, result: { tools: TOOLS } });
    }

    if (method === "tools/call") {
      var toolName = params.name;
      var toolArgs = params.arguments || {};
      var tool = TOOLS.find(function(t) { return t.name === toolName; });
      if (!tool) {
        return toolError(id, "Unknown tool: " + toolName + ". Available tools: " + TOOLS.map(function(t) { return t.name; }).join(", ") + ".");
      }
      var missing = missingRequired(tool, toolArgs);
      if (missing.length > 0) {
        return toolError(id, "Missing required input for " + toolName + ": " + missing.join(", ") + ". Provide " + (missing.length === 1 ? "it" : "them") + " and call the tool again.");
      }
      var result = handleToolCall(toolName, toolArgs);
      return reply(200, {
        jsonrpc: "2.0",
        id: id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        }
      });
    }

    return rpcError(id, -32601, "Method not found: " + method);
  } catch (error) {
    console.error("mcp-sse error:", error && error.message);
    return rpcError(id, -32603, "Internal error while handling " + method + ". Please try again.", 500);
  }
}

