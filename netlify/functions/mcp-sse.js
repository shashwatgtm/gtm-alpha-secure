import { scoreEpic } from "../lib/epic-advanced.js";

const GTM_CONSULTANT = {
  epicFramework: {
    E: { name: "Ecosystem and ABM-led Sales Motion", keywords: ["partners", "ecosystem", "abm", "enterprise", "integration", "channel", "alliances", "b2b"] },
    P: { name: "Product-Led Growth Acceleration", keywords: ["product-led", "plg", "user experience", "onboarding", "activation", "self-serve", "viral", "freemium"] },
    I: { name: "Inbound and Outbound Demand Generation", keywords: ["content", "demand", "marketing", "channels", "campaigns", "seo", "paid", "outbound", "inbound"] },
    C: { name: "Community-Led Advocacy and Engagement", keywords: ["community", "advocacy", "engagement", "loyalty", "referrals", "events", "network", "social"] }
  },

  // EPIC scoring: the documented advanced rubric (netlify/lib/epic-advanced.js), 1 to 10 per motion.
  analyzeEPIC(args) {
    var r = scoreEpic(args);
    var out = Object.assign({ scores: r.scores, primaryFocus: r.primary.letter, recommendation: r.primary.motion }, r);
    if (out.preliminary_note === null) delete out.preliminary_note;
    return out;
  },

  generateConsultation(args) {
    // The user's own name (older clients send client_name) or company, else "not supplied": never an invented name.
    var who = [args.client_name, args.company_name].map(function(v) { return typeof v === "string" ? v.trim() : ""; }).filter(Boolean)[0] || "not supplied";
    var input = Object.assign({}, args, {
      gtm_challenge: args.gtm_challenge || "",
      business_stage: args.business_stage,
      industry: args.industry || ""
    });
    var analysis = this.analyzeEPIC(input);
    var lines = [
      "GTM Alpha consultation for: " + who,
      "Challenge: " + (args.gtm_challenge ? String(args.gtm_challenge) : "not supplied"),
      "",
      "Primary Focus: " + analysis.primary.motion,
      "Secondary Focus: " + analysis.secondary.motion,
      "EPIC Scores (1 to 10): E:" + analysis.scores.E + ", P:" + analysis.scores.P + ", I:" + analysis.scores.I + ", C:" + analysis.scores.C
    ];
    analysis.warnings.forEach(function(w) { lines.push("Warning: " + w); });
    analysis.notes.forEach(function(n) { lines.push("Note: " + n); });
    if (analysis.preliminary_note) lines.push(analysis.preliminary_note);
    return {
      consultation_output: lines.join("\n"),
      epic_scores: analysis.scores,
      primary_focus: analysis.primary.motion,
      secondary_focus: analysis.secondary.motion,
      epic_detail: analysis
    };
  },

  generateRoadmap(focus, timeframe) {
    var component = this.epicFramework[focus] || this.epicFramework.P;
    return {
      // A timeframe the user did not choose is shown as the default, not as their choice.
      timeframe: timeframe || "90-day (default, not supplied; Example figure: replace with your own)",
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
    description: "Get GTM strategy consultation using Shashwat Ghosh EPIC framework. Scores the four motions from 1 to 10 with the documented rubric and names the primary and secondary motion. Add the optional inputs (ACV, deal cycle, NRR, TAM, self-serve, deal source, geography) for a full score; without them the result is marked preliminary.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Company name" },
        gtm_challenge: { type: "string", description: "Your GTM challenge" },
        business_stage: { type: "string", description: "Stage: pre-seed, seed, series-a, series-b, series-c, bootstrapped (growth counts as Series B)" },
        industry: { type: "string", description: "Your industry" },
        acv_usd: { type: "number", minimum: 0, description: "Optional. Average contract value per year in US dollars (for example 42000)" },
        deal_cycle_days: { type: "number", minimum: 0, description: "Optional. Days from first touch to closed-won (for example 120)" },
        nrr_percent: { type: "number", description: "Optional. Net revenue retention in percent (for example 108)" },
        tam_accounts: { type: "number", minimum: 0, description: "Optional. Number of addressable accounts (for example 2500)" },
        self_serve: { type: "boolean", description: "Optional. true if customers can sign up and get value without talking to sales" },
        deal_source: { type: "string", enum: ["referrals", "outbound", "partnerships", "inbound", "mixed"], description: "Optional. Where the majority of deals come from" },
        geography: { type: "string", enum: ["india", "us_eu", "middle_east", "apac", "global"], description: "Optional. Primary market" },
        current_channels: { type: "string", description: "Optional. What you do today (content, outbound, events, partnerships, PLG, community)" }
      },
      required: ["gtm_challenge"]
    },
    annotations: { title: "GTM Consultation", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "epic_audit",
    title: "EPIC Audit",
    description: "Get EPIC framework scores for your GTM strategy: Ecosystem and ABM, Product-Led Growth, Inbound and Outbound, Community-Led, each 1 to 10, with the lead motion, warnings and notes. Add the optional inputs for a full score; without them the result is marked preliminary.",
    inputSchema: {
      type: "object",
      properties: {
        challenge: { type: "string", description: "Describe your GTM situation" },
        industry: { type: "string", description: "Your industry" },
        business_stage: { type: "string", description: "Stage: pre-seed, seed, series-a, series-b, series-c, bootstrapped (growth counts as Series B)" },
        acv_usd: { type: "number", minimum: 0, description: "Optional. Average contract value per year in US dollars (for example 42000)" },
        deal_cycle_days: { type: "number", minimum: 0, description: "Optional. Days from first touch to closed-won (for example 120)" },
        nrr_percent: { type: "number", description: "Optional. Net revenue retention in percent (for example 108)" },
        tam_accounts: { type: "number", minimum: 0, description: "Optional. Number of addressable accounts (for example 2500)" },
        self_serve: { type: "boolean", description: "Optional. true if customers can sign up and get value without talking to sales" },
        deal_source: { type: "string", enum: ["referrals", "outbound", "partnerships", "inbound", "mixed"], description: "Optional. Where the majority of deals come from" },
        geography: { type: "string", enum: ["india", "us_eu", "middle_east", "apac", "global"], description: "Optional. Primary market" },
        current_channels: { type: "string", description: "Optional. What you do today (content, outbound, events, partnerships, PLG, community)" }
      },
      required: ["challenge"]
    },
    annotations: { title: "EPIC Audit", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "generate_roadmap",
    title: "GTM Roadmap",
    description: "Return a GTM action plan for one EPIC motion (E Ecosystem and ABM, P Product-Led Growth, I Inbound and Outbound, C Community-Led) over 30, 60 or 90 days: immediate, short-term and medium-term steps. Builds text from the inputs only.",
    inputSchema: {
      type: "object",
      properties: {
        primary_focus: { type: "string", enum: ["E", "P", "I", "C"], description: "EPIC motion to plan for: E, P, I or C" },
        timeframe: { type: "string", enum: ["30-day", "60-day", "90-day"], description: "30-day, 60-day or 90-day (default 90-day)" }
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
    return GTM_CONSULTANT.analyzeEPIC(Object.assign({}, args, { gtm_challenge: args.challenge || "" }));
  } else if (name === "generate_roadmap") {
    return GTM_CONSULTANT.generateRoadmap(args.primary_focus || "P", args.timeframe);
  } else {
    throw new Error("Unknown tool: " + name);
  }
}

// ---------------------------------------------------------------------------
// MCP transport: Streamable HTTP, stateless, JSON responses (POST only).
// Transport layer only. EPIC scoring comes from netlify/lib/epic-advanced.js.
// ---------------------------------------------------------------------------

var SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function reply(status, body, extraHeaders) {
  // Answers are never cached, as on the other connectors.
  var headers = Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store" }, CORS_HEADERS, extraHeaders || {});
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

// Decision N2 (run 6): amounts, counts and durations cannot be negative; the schema says which (minimum).
function belowMinimum(tool, args) {
  var props = (tool.inputSchema && tool.inputSchema.properties) || {};
  return Object.keys(props).filter(function(key) {
    var min = props[key].minimum;
    var v = typeof args[key] === "string" && args[key].trim() !== "" ? Number(args[key]) : args[key];
    return typeof min === "number" && typeof v === "number" && isFinite(v) && v < min;
  }).map(function(key) { return key + " must be " + props[key].minimum + " or more"; });
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return rpcError(null, -32000, "Method not allowed. This MCP endpoint accepts POST requests only (Streamable HTTP, stateless). Setup: https://gtmalpha.gtmhelix.com/integration", 405, { "Allow": "POST, OPTIONS" });
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
          serverInfo: { name: "gtm-alpha-mcp-server", version: "1.3.0" },
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
      var below = belowMinimum(tool, toolArgs);
      if (below.length > 0) {
        return toolError(id, "Invalid input for " + toolName + ": " + below.join("; ") + ".");
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

// Served at /mcp and at the older address /mcp-sse. Rate limit: 300 requests a minute per visitor, as on the other
// connectors, so one script cannot use up the account's shared monthly function invocations.
export const config = {
  path: ["/mcp", "/mcp-sse"],
  rateLimit: {
    windowSize: 60,
    windowLimit: 300,
    aggregateBy: ["ip", "domain"]
  }
};
