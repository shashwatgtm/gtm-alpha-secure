import { scoreEpic, MOTIONS } from "../lib/epic-advanced.js";
import { MODEL_NAME } from "../lib/verticals.js";
import { buildPlan, sectorBlock, sectorFit, MODEL_PLAN } from "../lib/gtm-plan.js";
import { readCompany, readLines, sharpenLines } from "../lib/company-read.js";
import { neutraliseDeep } from "../lib/echo-safe.js";

// Run 20 quality round 1b (D92): the plan steps and the sector text come from netlify/lib/gtm-plan.js, written from the sector
// file, the business model and the user's own inputs. The scores still come from netlify/lib/epic-advanced.js.
// Run 22 (alpha-w1): netlify/lib/company-read.js reads the business model, the country, the buyers, the roles and the product's use cases
// from ALL the text given (the challenge or product description, the industry, the channels), and says what it read and from where.
const clean = function(v) { return typeof v === "string" ? v.trim() : ""; };
// Run 21b: the shared name of the per-transaction model says "payments"; for a seller outside fintech (a messaging API, say) it says volume only.
function modelName(model, v) {
  return model === "transactions" && v && v.id !== "fintech" ? "per-transaction (priced on volume)" : MODEL_NAME[model];
}
// The model line of the answers: the model, and how it was reached (set by the user, read from named words, or assumed).
function modelLine(read) {
  var m = read.model, v = read.v;
  if (!m.model) return "not clear from your inputs; set business_model";
  var n = modelName(m.model, v);
  if (m.how === "input") return n;
  if (m.how === "priced") return n + " (read from your text: \"" + m.words + "\")";
  if (m.how === "product") return n + (m.words ? " (read from your product words: \"" + m.words + "\")" : " (read from your product words)");
  if (m.how === "assumed") return n + " (assumed: your text describes a software product but does not say how you charge; set business_model to change it)";
  return n + " (the usual model in this sector, assumed; set business_model to change it)";
}
// self_serve was not given: show what giving it would do, by running the same scoring with it set. Only for a business whose
// product can be tried alone. The scores shown above are not changed by this.
function selfServeCheck(input, analysis, model, text) {
  if (input.self_serve === true || input.self_serve === false) return null;
  if (model !== "saas" && model !== "hardware_software") return null;
  var alt = scoreEpic(Object.assign({}, input, { self_serve: true }));
  if (alt.scores.P === analysis.scores.P) return null;
  var lead = alt.primary.letter === analysis.primary.letter ? "the lead would stay " + analysis.primary.motion : "the lead would move to " + (alt.primary.letter === "P" ? "the product-led motion" : alt.primary.motion);
  var seen = (text || "").match(/(?:\b[\w'-]+\s+){0,5}\d{1,3}(?:,\d{3})+\+?\s+(?:companies|businesses|organi[sz]ations|teams|developers|customers|users|accounts)\b/i);
  return "self_serve was not given, so the Product-Led score got no lift. If people can sign up and get value without talking to sales, set self_serve to true: the Product-Led score would go from " + analysis.scores.P + " to " + alt.scores.P + " and " + lead + "."
    + (seen ? " Your text says \"" + seen[0].trim() + "\". If that adoption happens without a sales call, self_serve is the input to change." : "");
}
// The same effect, worded for the closing list (the name of the input is the list's own label, so it is not repeated).
function selfServeEffect(input, analysis, model, text) {
  if (input.self_serve === true || input.self_serve === false) return null;
  if (model !== "saas" && model !== "hardware_software") return null;
  var alt = scoreEpic(Object.assign({}, input, { self_serve: true }));
  if (alt.scores.P === analysis.scores.P) return null;
  var lead = alt.primary.letter === analysis.primary.letter ? "the lead would stay " + analysis.primary.motion : "the lead would move to " + alt.primary.motion;
  var seen = (text || "").match(/(?:\b[\w'-]+\s+){0,5}\d{1,3}(?:,\d{3})+\+?\s+(?:companies|businesses|organi[sz]ations|teams|developers|customers|users|accounts)\b/i);
  return "if people can sign up and get value without talking to sales, setting it to true would change the Product-Led score from " + analysis.scores.P + " to " + alt.scores.P + " and " + lead + "."
    + (seen ? " Your text says \"" + seen[0].trim() + "\"; if that adoption happens without a sales call, this is the input to change." : "");
}
// The country in the text is shown, never applied (D80: the scores follow the inputs given). What setting geography would do is worked out with the same scoring.
function geographyEffect(input, analysis, read) {
  if (clean(input.geography)) return null;
  var codes = [];
  read.geo.hits.forEach(function(h) { if (h.code && codes.indexOf(h.code) < 0) codes.push(h.code); });
  if (codes.length !== 1) return null;
  var alt = scoreEpic(Object.assign({}, input, { geography: codes[0] }));
  var d = alt.scores, o = analysis.scores;
  if (d.E === o.E && d.P === o.P && d.I === o.I && d.C === o.C) return null;
  var lead = alt.primary.letter === analysis.primary.letter ? "the lead would stay " + analysis.primary.motion : "the lead would move to " + alt.primary.motion;
  var label = read.geo.hits[0].label;
  return "your text says " + label + ", but the scores only follow the inputs you set. Setting geography to " + codes[0] + " would change the scores to E " + d.E + ", P " + d.P + ", I " + d.I + ", C " + d.C + " (now E " + o.E + ", P " + o.P + ", I " + o.I + ", C " + o.C + "), and " + lead + ".";
}
// The text shown for the read-back of the inputs: the lines of inputs that were not given are named once in the closing list instead.
function inputsGiven(lines) {
  return lines.filter(function(t) { return !/^(?:ACV|Deal cycle|NRR|TAM|Self-serve|Deal source|Geography): .*not given, no adjustment/.test(t); });
}
// The answer both scoring tools share: scores, inputs read back, what was read from the text, model, sector block, fit, the first 30 days, what to give next.
function describe(args, tool) {
  var input = Object.assign({}, args, { gtm_challenge: args.gtm_challenge || args.challenge || "", business_stage: args.business_stage, industry: args.industry || "" });
  var analysis = GTM_CONSULTANT.analyzeEPIC(input);
  var read = readCompany(input, tool);
  var v = read.v, m = read.model;
  var pargs = Object.assign({}, input, { read: read });
  var plan = buildPlan({ letter: analysis.primary.letter, vertical: v, model: m.model, args: pargs });
  var notes = sectorBlock(v, m.model, pargs);
  var fit = sectorFit({ vertical: v, model: m.model, letter: analysis.primary.letter, motionName: analysis.primary.motion, scores: analysis.scores, args: input, selfServeGiven: input.self_serve === true || input.self_serve === false });
  var nameOf = function(model) { return modelName(model, v); };
  var seen = readLines(read, input, nameOf);
  var sharpen = sharpenLines(read, input, { selfServe: selfServeEffect(input, analysis, m.model, input.gtm_challenge), geography: geographyEffect(input, analysis, read) });
  return { analysis: analysis, read: read, v: v, m: m, first: plan.days_30, notes: notes, fit: fit, check: selfServeCheck(input, analysis, m.model, input.gtm_challenge), input: input, seen: seen, sharpen: sharpen };
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
    var company = clean(args.company_name), person = clean(args.client_name);
    var d = describe(args, "gtm_consultation");
    var analysis = d.analysis;
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
    lines.push("", "What I read from your text:");
    d.seen.forEach(function(t) { lines.push("- " + t); });
    lines.push("", "Your inputs, read:");
    inputsGiven(analysis.inputs_read).forEach(function(t) { lines.push("- " + t); });
    lines.push("", "First 30 days for " + analysis.primary.motion + ":");
    d.first.forEach(function(t) { lines.push("- " + t); });
    if (d.notes) {
      lines.push("", "Sector notes (" + d.notes.sector + "):", "Who usually decides: " + d.notes.who_decides);
      if (d.notes.buyer_words && d.notes.buyer_words.length) lines.push("Words this buyer uses: " + d.notes.buyer_words.join(", ") + ".");
      if (d.notes.read_as) lines.push(d.notes.read_as);
    }
    if (d.fit) lines.push("", "How this fits the sector: " + d.fit);
    if (d.sharpen.length) { lines.push("", "To sharpen this, give these inputs (each line says what it would change):"); d.sharpen.forEach(function(t) { lines.push("- " + t); }); }
    var out = {
      consultation_output: lines.join("\n"),
      epic_scores: analysis.scores,
      primary_focus: analysis.primary.motion,
      secondary_focus: analysis.secondary.motion,
      inputs_read: analysis.inputs_read,
      what_i_read: d.seen,
      first_30_days: d.first,
      sector_notes: d.notes,
      sector_fit: d.fit,
      business_model: modelLine(d.read),
      to_sharpen_this: d.sharpen,
      epic_detail: analysis
    };
    if (d.check) out.self_serve_check = d.check;
    return out;
  },

  generateRoadmap(focus, timeframe, args) {
    var letter = this.epicFramework[focus] ? focus : "P";
    var component = this.epicFramework[letter];
    var industry = clean(args.industry), what = clean(args.product_description);
    // Run 22: the sector, the kind of company, the business model, the country and the product's use cases are read from the industry AND the
    // product description together (the same reading as the two scoring tools), and the answer says what it read.
    var read = readCompany(args, "generate_roadmap");
    var v = read.v, model = read.model.model, how = read.model.how;
    var input = { company_name: args.company_name, industry: industry, product_description: what, acv_usd: args.acv_usd, deal_cycle_days: args.deal_cycle_days, tam_accounts: args.tam_accounts, nrr_percent: args.nrr_percent, current_channels: args.current_channels, read: read };
    var plan = buildPlan({ letter: letter, vertical: v, model: model, args: input });
    // The chosen timeframe sets the day range of each phase (thirds of 30, 60 or 90 days).
    var days = { "30-day": 30, "60-day": 60, "90-day": 90 }[timeframe] || 90;
    var third = days / 3;
    var used = [];
    if (what) used.push("product description: read for the sector, the kind of company, the business model, the country, the buyers and the use cases (see what_i_read)");
    if (v) used.push("industry: sector notes, partner types and measures for " + v.name);
    else if (industry) used.push("industry: " + industry + " (the words did not name one of the nine sectors, so the steps are written for any sector)");
    if (model) used.push("business model: " + modelLine(read));
    if (typeof args.acv_usd === "number") used.push("ACV: " + args.acv_usd.toLocaleString("en-US") + " US dollars a year");
    if (typeof args.deal_cycle_days === "number") used.push("deal cycle: " + args.deal_cycle_days.toLocaleString("en-US") + " days");
    if (typeof args.tam_accounts === "number") used.push("TAM: " + args.tam_accounts.toLocaleString("en-US") + " accounts");
    if (typeof args.nrr_percent === "number") used.push("NRR: " + args.nrr_percent + " percent");
    if (clean(args.current_channels)) used.push("current channels: quoted in the first steps");
    var seen = readLines(read, args, function(mm) { return modelName(mm, v); });
    var missing = sharpenLines(read, args, {});
    // AI native covers very different products; when nothing in the text says which, the investment case is the one that changes the steps most.
    if (v && v.id === "ai-native" && how !== "input" && model !== "investment" && !read.head && !read.uses.length) missing.push("Give business_model or product_description: AI native covers very different products (an agent that automates a workflow, a forecasting tool, investment strategies built with AI). If you sell investment strategies, setting business_model to investment would change the steps to due diligence, consultants and track record.");
    var note;
    if (letter === "P" && model && MODEL_PLAN[model] && MODEL_PLAN[model].selfServe === false) {
      var short = MODEL_NAME[model].replace(/ \(.*$/, "");
      note = "Product-Led Growth for " + (/^[aeiou]/i.test(short) ? "an " : "a ") + short + " business means a low-risk first step the buyer can take without a full project, not a product the buyer starts alone. The steps describe that version.";
    }
    var out = {};
    // When the ACV and cycle given contradict the motion asked for, one line says so before anything else.
    if (plan.warning) out.read_this_first = plan.warning;
    Object.assign(out, {
      // A timeframe the user did not choose is shown as the default, not as their choice.
      timeframe: timeframe || "90-day (default, not supplied; Example figure: replace with your own)",
      primary_focus: component.name,
      schedule: {
        immediate: "Days 1 to " + third,
        short_term: "Days " + (third + 1) + " to " + (2 * third),
        medium_term: "Days " + (2 * third + 1) + " to " + days
      },
      what_i_read: seen,
      action_plan: {
        immediate: plan.days_30,
        short_term: plan.days_60,
        medium_term: plan.first_quarter
      },
      business_model: model ? modelLine(read) : "not given (each step that needs a product people can try alone says so; set business_model to narrow the steps)",
      inputs_used: used
    });
    if (clean(args.company_name)) out.company = clean(args.company_name);
    if (v) out.sector = v.name;
    if (note) out.note = note;
    if (missing.length) out.what_would_make_this_specific = missing;
    return out;
  }
};

var TOOLS = [
  {
    name: "gtm_consultation",
    title: "Free EPIC audit (in your browser and in Claude)",
    description: "Scores the four motions from 1 to 10 with the documented rubric, names the primary and secondary motion, reads back every input you gave and what it did to the scores, and lists the first 30 days of steps for the primary motion, written from your sector, business model, channels, ACV and deal cycle, with sector notes when your inputs name the sector. Add the optional inputs (stage, ACV, deal cycle, NRR, TAM, self-serve, deal source, geography) for a full score; without them the result is marked preliminary and no stage is assumed.",
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
    description: "Get EPIC framework scores for your GTM strategy: Ecosystem and ABM, Product-Led Growth, Inbound and Outbound, Community-Led, each 1 to 10, with the lead motion, warnings and notes, every input read back with what it did, the first 30 days for the lead motion, and the sector's buying committee and usual objections when your inputs name the sector. Add the optional inputs for a full score; without them the result is marked preliminary and no stage is assumed.",
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
    description: "Return a GTM action plan for one EPIC motion (E Ecosystem and ABM, P Product-Led Growth, I Inbound and Outbound, C Community-Led) over 30, 60 or 90 days: immediate, short-term and medium-term steps. Give industry, business_model, deal cycle and current channels to make the steps specific to your sector and buyers; without them the steps are written for any business and each says when it applies. Builds text from the inputs only.",
    inputSchema: {
      type: "object",
      properties: {
        primary_focus: { type: "string", enum: ["E", "P", "I", "C"], description: "EPIC motion to plan for: E, P, I or C" },
        timeframe: { type: "string", enum: ["30-day", "60-day", "90-day"], description: "30-day, 60-day or 90-day (default 90-day)" },
        business_model: { type: "string", enum: ["saas", "services", "connectivity", "transactions", "marketplace", "hardware_software", "investment"], description: "Optional. How you charge: software subscription, services, connectivity, per transaction, marketplace, hardware plus software, or investment management. For a business that is not a software subscription, the product-led steps become a low-risk first step the buyer can take without a full project, and no trial or sign-up steps are given" },
        product_description: { type: "string", description: "Optional. One or two sentences on what you sell and to whom. Read for the sector, the business model and the buyer's function, so the steps fit your product" },
        industry: { type: "string", description: "Optional. Your industry or what you sell (for example logistics tech, fintech, telecom, cybersecurity). Names your buyers' roles, partner types and measures in the steps" },
        company_name: { type: "string", description: "Optional. Your company or product name, repeated in the answer" },
        acv_usd: { type: "number", minimum: 0, description: "Optional. Average contract value per year in US dollars (for example 42000)" },
        deal_cycle_days: { type: "number", minimum: 0, description: "Optional. Days from first touch to closed-won (for example 120). A long cycle adds the review steps to the plan" },
        tam_accounts: { type: "number", minimum: 0, description: "Optional. Number of addressable accounts (for example 2500)" },
        nrr_percent: { type: "number", description: "Optional. Net revenue retention in percent (for example 108)" },
        current_channels: { type: "string", description: "Optional. What you do today (content, outbound, events, partnerships, PLG, community). The first steps start from it" }
      },
      required: ["primary_focus"]
    },
    annotations: { title: "GTM Roadmap (in Claude)", readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  }
];

function handleToolCall(name, rawArgs) {
  // Run 20 round 1d (D086): the one place where a tools/call reaches a tool. Every text the caller sent is made inert once, here
  // (markup, hidden characters and fake chat markers; an instruction-like text is quoted as the caller's own), so no tool can
  // repeat live markup. The words stay. The checks before this call (required, length, type, minimum) ran on the original text.
  var args = neutraliseDeep(rawArgs);
  if (name === "gtm_consultation") {
    return GTM_CONSULTANT.generateConsultation(args);
  } else if (name === "epic_audit") {
    // Run 19 (D80, problem 8): the scores are unchanged; the company name given is echoed and, when the inputs name a
    // sector clearly, its buying committee and usual objections follow the scores (nothing is invented about the company).
    // Run 20 round 1b (D92): the same inputs read-back, business model, first 30 days and sector fit as the consultation.
    var d = describe(Object.assign({}, args, { gtm_challenge: args.challenge || "" }), "epic_audit");
    var named = typeof args.company_name === "string" ? args.company_name.trim() : "";
    var audit = Object.assign({ scores: d.analysis.scores, primaryFocus: d.analysis.primary.letter, recommendation: d.analysis.primary.motion }, d.analysis);
    if (audit.preliminary_note === null) delete audit.preliminary_note;
    var extra = { what_i_read: d.seen, business_model: modelLine(d.read), first_30_days: d.first };
    if (d.notes) extra.sector_notes = d.notes;
    if (d.fit) extra.sector_fit = d.fit;
    if (d.check) extra.self_serve_check = d.check;
    extra.to_sharpen_this = d.sharpen;
    return Object.assign(named ? { company: named } : {}, audit, extra);
  } else if (name === "generate_roadmap") {
    return GTM_CONSULTANT.generateRoadmap(args.primary_focus || "P", args.timeframe, args);
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

// Run 20 round 1: the media type is the part before the first semicolon, compared without regard to letter case, so
// "application/json; charset=utf-8" passes. A header that joins two values (a comma after the media type) does not pass.
// This is the rule of the SDK transport that the other connectors use.
function isJsonContentType(header) {
  if (!header) return false;
  var cut = header.indexOf(";");
  var essence = (cut < 0 ? header : header.slice(0, cut)).trim().toLowerCase();
  return essence === "application/json" && (cut < 0 || header.slice(cut).indexOf(",") === -1);
}

export default async function handler(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return rpcError(null, -32000, "Method not allowed. This MCP endpoint accepts POST requests only (Streamable HTTP, stateless). Setup: https://gtmalpha.gtmhelix.com/integration", 405, { "Allow": "POST, OPTIONS" });
  }

  // Run 20 round 1 (ledger): a request whose Content-Type is missing or is not application/json is refused, with the status,
  // code and message the other five connectors answer (415, -32000). Checked before the body is read.
  if (!isJsonContentType(req.headers.get("content-type"))) {
    return rpcError(null, -32000, "Unsupported Media Type: Content-Type must be application/json", 415);
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
          serverInfo: { name: "gtm-alpha-mcp-server", version: "1.3.10" },
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
