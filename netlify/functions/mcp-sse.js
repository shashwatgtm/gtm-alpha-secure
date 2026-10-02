import { scoreEpic, MOTIONS, ROADMAP_STEPS } from "../lib/epic-advanced.js";
import { detectVertical, detectModel, MODEL_NAME, BUSINESS_MODELS } from "../lib/verticals.js";

// Run 19 (D80, problems 3, 4 and 8): the plan steps that only fit a product people can try on their own (a software
// subscription or hardware plus software). For any other business model they are left out and the answer says so.
const SELF_SERVE_ONLY = /self-service|self-serve|trial|freemium|viral|in-app|product-qualified|PQL|usage-based engagement|pricing page|conversion funnel/i;
function stepsFor(letter, model) {
  const keep = (list) => (model && model !== "saas" && model !== "hardware_software" ? list.filter((t) => !SELF_SERVE_ONLY.test(t)) : list.slice());
  return { days_30: keep(ROADMAP_STEPS[letter].days_30), days_60: keep(ROADMAP_STEPS[letter].days_60), first_quarter: keep(ROADMAP_STEPS[letter].first_quarter) };
}
function sectorNotes(v) {
  if (!v) return null;
  return { sector: v.name, who_decides: v.committee, what_it_measures: v.metrics, usual_objections: v.objections.map((o) => o.objection), proof_that_lands: v.proofShape, sales_motion: v.salesMotion };
}

const GTM_CONSULTANT = {
  epicFramework: {
    E: { name: MOTIONS.E, keywords: ["partners", "ecosystem", "abm", "enterprise", "integration", "channel", "alliances", "b2b"] },
    P: { name: MOTIONS.P, keywords: ["product-led", "plg", "user experience", "onboarding", "activation", "self-serve", "viral", "freemium"] },
    I: { name: MOTIONS.I, keywords: ["content", "demand", "marketing", "channels", "campaigns", "seo", "paid", "outbound", "inbound"] },
    C: { name: MOTIONS.C, keywords: ["community", "advocacy", "engagement", "loyalty", "referrals", "events", "network", "social"] }
  },

  // EPIC scoring: the documented advanced rubric (netlify/lib/epic-advanced.js), 1 to 10 per motion.
  analyzeEPIC(args) {
    var r = scoreEpic(args);
    var out = Object.assign({ scores: r.scores, primaryFocus: r.primary.letter, recommendation: r.primary.motion }, r);
    if (out.preliminary_note === null) delete out.preliminary_note;
    return out;
  },

  generateConsultation(args) {
    // Run 12 R12-20: the heading is "GTM Alpha Free EPIC audit"; "Company: <name>" follows only when a company name is given
    // (older clients may send client_name, shown as "Name: <name>" when no company name is given). Never an invented name.
    var clean = function(v) { return typeof v === "string" ? v.trim() : ""; };
    var company = clean(args.company_name), person = clean(args.client_name);
    var input = Object.assign({}, args, {
      gtm_challenge: args.gtm_challenge || "",
      business_stage: args.business_stage,
      industry: args.industry || ""
    });
    var analysis = this.analyzeEPIC(input);
    var lines = ["GTM Alpha Free EPIC audit"].concat(company ? ["Company: " + company] : person ? ["Name: " + person] : []).concat([
      "Challenge: " + (args.gtm_challenge ? String(args.gtm_challenge) : "not supplied"),
      "",
      "Primary Focus: " + analysis.primary.motion,
      "Secondary Focus: " + analysis.secondary.motion,
      "EPIC Scores (1 to 10): E:" + analysis.scores.E + ", P:" + analysis.scores.P + ", I:" + analysis.scores.I + ", C:" + analysis.scores.C
    ]);
    analysis.warnings.forEach(function(w) { lines.push("Warning: " + w); });
    analysis.notes.forEach(function(n) { lines.push("Note: " + n); });
    if (analysis.preliminary_note) lines.push(analysis.preliminary_note);
    // Run 19 (D80): the first steps for the lead motion (the report's own plan steps) and the sector's buying committee,
    // read from what the user typed; nothing is invented about the company.
    var v = detectVertical(args.industry, args.gtm_challenge, args.current_channels, args.company_description);
    var m = detectModel(args.business_model, args.industry, args.gtm_challenge, args.current_channels);
    var steps = stepsFor(analysis.primary.letter, m.model);
    var first = steps.days_30.length ? steps.days_30 : steps.days_60;
    lines.push("", "First 30 days for " + analysis.primary.motion + ":");
    first.forEach(function(t) { lines.push("- " + t); });
    if (v) lines.push("", "Sector (read from your inputs): " + v.name + ". Who usually decides: " + v.committee);
    return {
      consultation_output: lines.join("\n"),
      epic_scores: analysis.scores,
      primary_focus: analysis.primary.motion,
      secondary_focus: analysis.secondary.motion,
      first_30_days: first,
      sector_notes: sectorNotes(v),
      business_model: m.model ? MODEL_NAME[m.model] + (m.how === "input" ? "" : m.how === "sector" ? " (the usual model in this sector, assumed; set business_model to change it)" : " (read from your inputs)") : "not clear from your inputs; set business_model",
      epic_detail: analysis
    };
  },

  generateRoadmap(focus, timeframe, businessModel) {
    var letter = this.epicFramework[focus] ? focus : "P";
    var component = this.epicFramework[letter];
    var model = BUSINESS_MODELS.indexOf(businessModel) >= 0 ? businessModel : null;
    // Run 12 R12-20: the per-motion steps of the browser report (epic-advanced.js ROADMAP_STEPS, words unchanged), mapped to
    // the timeframe: immediate = the report's first 30 days, short-term = days 31 to 60, medium-term = days 61 to 90.
    // Counts such as "top 50" are examples, labelled the way this tool labels its other example figures.
    var label = function(list) { return list.map(function(t) { return /\btop \d+\b/.test(t) ? t + " (Example figure: replace with your own)" : t; }); };
    var kept = stepsFor(letter, model);
    var steps = { days_30: label(kept.days_30), days_60: label(kept.days_60), first_quarter: label(kept.first_quarter) };
    var dropped = ROADMAP_STEPS[letter].days_30.length + ROADMAP_STEPS[letter].days_60.length + ROADMAP_STEPS[letter].first_quarter.length - (kept.days_30.length + kept.days_60.length + kept.first_quarter.length);
    // The chosen timeframe sets the day range of each phase (thirds of 30, 60 or 90 days).
    var days = { "30-day": 30, "60-day": 60, "90-day": 90 }[timeframe] || 90;
    var third = days / 3;
    return {
      // A timeframe the user did not choose is shown as the default, not as their choice.
      timeframe: timeframe || "90-day (default, not supplied; Example figure: replace with your own)",
      primary_focus: component.name,
      schedule: {
        immediate: "Days 1 to " + third,
        short_term: "Days " + (third + 1) + " to " + (2 * third),
        medium_term: "Days " + (2 * third + 1) + " to " + days
      },
      action_plan: {
        immediate: steps.days_30.slice(),
        short_term: steps.days_60.slice(),
        medium_term: steps.first_quarter.slice()
      },
      business_model: model ? MODEL_NAME[model] : "not given (the steps assume a software subscription; set business_model to change it)",
      note: dropped ? dropped + " step" + (dropped === 1 ? "" : "s") + " that need a product people can try on their own (a trial, self-service sign-up or in-app prompts) were left out, because the business model is " + MODEL_NAME[model] + "." : undefined
    };
  }
};

var TOOLS = [
  {
    name: "gtm_consultation",
    title: "Free EPIC audit (in your browser and in Claude)",
    description: "Scores the four motions from 1 to 10 with the documented rubric, names the primary and secondary motion, and lists the first 30 days of steps for the primary motion, with sector notes when your inputs name the sector. Add the optional inputs (ACV, deal cycle, NRR, TAM, self-serve, deal source, geography) for a full score; without them the result is marked preliminary.",
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
        current_channels: { type: "string", description: "Optional. What you do today (content, outbound, events, partnerships, PLG, community)" },
        business_model: { type: "string", enum: ["saas", "services", "connectivity", "transactions", "marketplace", "hardware_software", "investment"], description: "Optional. How you charge: software subscription, services, connectivity, per transaction, marketplace, hardware plus software, or investment management. Read from your other inputs when left out" }
      },
      required: ["gtm_challenge"]
    },
    annotations: { title: "Free EPIC audit (in your browser and in Claude)", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "epic_audit",
    title: "EPIC scores (in Claude)",
    description: "Get EPIC framework scores for your GTM strategy: Ecosystem and ABM, Product-Led Growth, Inbound and Outbound, Community-Led, each 1 to 10, with the lead motion, warnings and notes, and the sector's buying committee and usual objections when your inputs name the sector. Add the optional inputs for a full score; without them the result is marked preliminary.",
    inputSchema: {
      type: "object",
      properties: {
        challenge: { type: "string", description: "Describe your GTM situation" },
        company_name: { type: "string", description: "Optional. Your company or product name, repeated in the answer" },
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
    annotations: { title: "EPIC scores (in Claude)", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "generate_roadmap",
    title: "GTM Roadmap (in Claude)",
    description: "Return a GTM action plan for one EPIC motion (E Ecosystem and ABM, P Product-Led Growth, I Inbound and Outbound, C Community-Led) over 30, 60 or 90 days: immediate, short-term and medium-term steps, without the self-serve steps when your business model is not a software subscription. Builds text from the inputs only.",
    inputSchema: {
      type: "object",
      properties: {
        primary_focus: { type: "string", enum: ["E", "P", "I", "C"], description: "EPIC motion to plan for: E, P, I or C" },
        timeframe: { type: "string", enum: ["30-day", "60-day", "90-day"], description: "30-day, 60-day or 90-day (default 90-day)" },
        business_model: { type: "string", enum: ["saas", "services", "connectivity", "transactions", "marketplace", "hardware_software", "investment"], description: "Optional. How you charge: software subscription, services, connectivity, per transaction, marketplace, hardware plus software, or investment management. Steps that need a product people can try on their own are left out for a business that is not a software subscription" }
      },
      required: ["primary_focus"]
    },
    annotations: { title: "GTM Roadmap (in Claude)", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  }
];

function handleToolCall(name, args) {
  if (name === "gtm_consultation") {
    return GTM_CONSULTANT.generateConsultation(args);
  } else if (name === "epic_audit") {
    // Run 19 (D80, problem 8): the scores are unchanged; the company name given is echoed and, when the inputs name a
    // sector clearly, its buying committee and usual objections follow the scores (nothing is invented about the company).
    var audit = GTM_CONSULTANT.analyzeEPIC(Object.assign({}, args, { gtm_challenge: args.challenge || "" }));
    var named = typeof args.company_name === "string" ? args.company_name.trim() : "";
    var sv = detectVertical(args.industry, args.challenge, args.current_channels);
    return Object.assign(named ? { company: named } : {}, audit, sv ? { sector_notes: sectorNotes(sv) } : {});
  } else if (name === "generate_roadmap") {
    return GTM_CONSULTANT.generateRoadmap(args.primary_focus || "P", args.timeframe, args.business_model);
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
  var headers = Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Strict-Transport-Security": "max-age=31536000" }, CORS_HEADERS, extraHeaders || {});
  return new Response(body === null ? null : JSON.stringify(body), { status: status, headers: headers });
}

function rpcError(id, code, message, status, extraHeaders) {
  return reply(status || 200, { jsonrpc: "2.0", id: id === undefined ? null : id, error: { code: code, message: message } }, extraHeaders);
}

function toolError(id, text) {
  return reply(200, { jsonrpc: "2.0", id: id, result: { content: [{ type: "text", text: text }], isError: true } });
}

// Run 10 R10-09: size caps. The whole request may be at most 64 KB, and each text input at most 4,000 characters (a GTM
// challenge is a paragraph, not a document). The caps sit here, in the checks, so the tool definitions in tools/list are
// unchanged; a request inside them runs exactly as before.
var MAX_BODY = 65536;
var MAX_TEXT = 4000;

function tooLong(args) {
  return Object.keys(args).filter(function(key) { return typeof args[key] === "string" && args[key].length > MAX_TEXT; })
    .map(function(key) { return key + " is longer than " + MAX_TEXT + " characters"; });
}

function missingRequired(tool, args) {
  var required = (tool.inputSchema && tool.inputSchema.required) || [];
  var props = (tool.inputSchema && tool.inputSchema.properties) || {};
  // Run 16 R16-10 (rule B52): a required text (a string with no fixed list of choices) that is empty or only whitespace counts as missing.
  return required.filter(function(key) {
    var p = props[key] || {};
    return args[key] === undefined || args[key] === null ||
      (typeof args[key] === "string" && args[key].trim() === "" && p.type === "string" && !Array.isArray(p.enum));
  });
}

// Decision N2 (run 6): amounts, counts and durations cannot be negative; the schema says which (minimum).
// Run 6 N2 and run 7 (T2, T6): a number sent as text is read with commas allowed or refused; minimum holds; a choice
// must be one of the listed values. Numbers read from text replace the text in args before the tool runs.
function belowMinimum(tool, args) {
  var props = (tool.inputSchema && tool.inputSchema.properties) || {};
  var problems = [];
  Object.keys(props).forEach(function(key) {
    var p = props[key], v = args[key];
    if (v === undefined || v === null) return;
    if (Array.isArray(p.enum) && typeof v === "string" && p.enum.indexOf(v) === -1) { problems.push(key + " must be one of: " + p.enum.join(", ")); return; }
    // Run 12 R12-12 a (A5-4 d): a value of the wrong type is refused with the type it must be, as on the connectors.
    if (p.type === "string" && typeof v !== "string") { problems.push(key + " must be text"); return; }
    if (p.type === "boolean" && typeof v !== "boolean") { problems.push(key + " must be true or false"); return; }
    if (p.type !== "number" && p.type !== "integer") return;
    if (typeof v === "string") {
      var n = v.trim() === "" ? NaN : Number(v.replace(/,/g, "").trim());
      if (!isFinite(n)) { problems.push(key + " must be a number, written with digits only (for example 42000)"); return; }
      args[key] = n; v = n;
    }
    if (typeof v !== "number" || !isFinite(v)) { problems.push(key + " must be a number"); return; }
    if (typeof p.minimum === "number" && v < p.minimum) problems.push(key + " must be " + p.minimum + " or more");
  });
  return problems;
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return rpcError(null, -32000, "Method not allowed. This MCP endpoint accepts POST requests only (Streamable HTTP, stateless). Setup: https://gtmalpha.gtmhelix.com/integration", 405, { "Allow": "POST, OPTIONS" });
  }

  // Run 12 R12-12 a (A5-4 c): a declared body size over the limit is refused before the body is read.
  var declared = Number(req.headers.get("content-length"));
  if (isFinite(declared) && declared > MAX_BODY) {
    return rpcError(null, -32600, "Invalid request: the request body is larger than 64 KB.", 413);
  }

  var body;
  try {
    var text = await req.text();
    // Run 11 R11-A3-9 c: the limit counts bytes (UTF-8), not characters, so multi-byte text cannot pass 64 KB.
    if (Buffer.byteLength(text, "utf8") > MAX_BODY) {
      return rpcError(null, -32600, "Invalid request: the request body is larger than 64 KB.", 413);
    }
    body = JSON.parse(text);
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
          serverInfo: { name: "gtm-alpha-mcp-server", version: "1.3.9" },
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
      var toolArgs = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
      var tool = TOOLS.find(function(t) { return t.name === toolName; });
      if (!tool) {
        // Run 12 R12-12 a (A5-4 a): a name that is not text, or is longer than 100 characters, is never echoed back.
        if (typeof toolName !== "string" || toolName.length > 100) return toolError(id, "Unknown tool.");
        return toolError(id, "Unknown tool: " + toolName + ". Available tools: " + TOOLS.map(function(t) { return t.name; }).join(", ") + ".");
      }
      var missing = missingRequired(tool, toolArgs);
      if (missing.length > 0) {
        return toolError(id, "Missing required input for " + toolName + ": " + missing.join(", ") + ". Provide " + (missing.length === 1 ? "it" : "them") + " and call the tool again.");
      }
      var long = tooLong(toolArgs);
      if (long.length > 0) {
        return toolError(id, "Invalid input for " + toolName + ": " + long.join("; ") + ".");
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

    // Run 12 R12-12 a (A5-4 b): at most 100 characters of the method are echoed back.
    return rpcError(id, -32601, "Method not found: " + method.slice(0, 100));
  } catch (error) {
    console.error("mcp-sse error:", error && error.message);
    // Run 11 R11-A3-9 c: a fixed message; the caller's method name is never echoed back.
    return rpcError(id, -32603, "Internal error. Please try again.", 500);
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
