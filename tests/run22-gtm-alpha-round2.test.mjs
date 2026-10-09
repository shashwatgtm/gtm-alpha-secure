// Run 22 round 2 (writer alpha-w1): the faults the fresh judges named after round 1, written as tests before the fixes. Companies are
// invented (rule B81); every figure is an example. Run: node --test tests/run22-gtm-alpha-round2.test.mjs
//  1. sector notes that do not fit the product (a close call between two kinds, or a kind whose words are not in the text) print only notes that fit
//  2. misread buyers, roles, teams and countries
//  3. gtm_consultation repeats the same findings and echoes a long challenge in full
//  4. generate_roadmap for a large pilot-led deal needs a pilot design step, an outreach step and a partner step tied to the user's inputs
//  5. when no input moved the four scores, say so plainly
//  6. no figure the user did not give is printed as if it were advice
import { test } from "node:test";
import assert from "node:assert/strict";

const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
let id = 1;
const rpc = async (method, params) => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id++, method, params }) }), {});
  return r.json();
};
const call = async (name, args) => {
  const j = await rpc("tools/call", { name, arguments: args });
  assert.ok(!j.result.isError, "no error: " + JSON.stringify(j.result).slice(0, 300));
  return JSON.parse(j.result.content.map((c) => c.text).join("\n"));
};
const flat = (x) => JSON.stringify(x);
const lines = (v) => (Array.isArray(v) ? v : v ? [v] : []).join(" | ");
const steps = (j) => [...(j.first_30_days || []), ...((j.action_plan && [...j.action_plan.immediate, ...j.action_plan.short_term, ...j.action_plan.medium_term]) || [])].join(" | ");
// everything a client reads about the sector: the steps, the notes and the fit line (not the user's own words)
const sectorText = (j) => steps(j) + " | " + flat(j.sector_notes || {}) + " | " + (j.sector_fit || "");
const NUM = { acv_usd: 90000, deal_cycle_days: 120, nrr_percent: 112, tam_accounts: 4000 };
const consult = (company_name, industry, text, extra = {}) => ({ company_name, industry, gtm_challenge: text, ...NUM, ...extra });
const audit = (company_name, industry, text, extra = {}) => ({ company_name, industry, challenge: text, ...NUM, ...extra });

const TIDE = "We sell a decision platform for shippers that joins transportation management, shipment and inventory visibility on every mode (ocean, over the road, air, rail), yard management and last mile logistics, with AI agents that act on exceptions, on one network of carriers to shippers and brands that move freight. Our buyers' pain: shipments go dark between carriers. We want help choosing our go-to-market motion.";
const MIND = "We sell a human risk management platform that automates adaptive phishing training, security awareness training and incident reporting, with gamified simulations delivered across email, SMS, phone calls and Teams, to security and IT teams that want to reduce employee cyber risk. Our buyers' pain: employees click on lures. We want help choosing our go-to-market motion.";
const CODE = "We sell a cloud security platform: workload protection, posture management, detection and response and vulnerability scanning to security teams collaborating with developers to safeguard application pipelines and defend runtime environments in large hybrid cloud estates. Our buyers' pain: findings sit in separate consoles. We want help choosing our go-to-market motion.";
const LOCA = "We sell a localization platform that connects to developer, design and content tools so teams can translate and ship software and marketing content in many markets: translation memory, workflow automation, a REST API, a CLI and SDKs, to product, engineering, localization and marketing teams at software companies. Our buyers' pain: every new market starts from scratch. We want help choosing our go-to-market motion.";

// ---- 1. sector notes that do not fit ----
test("a platform that does shipment visibility, transport management, yard and last mile gets no fleet or courier notes (a close call uses the sector-level notes)", async () => {
  for (const [tool, args] of [["gtm_consultation", consult("Tideline", "logistics tech", TIDE)], ["epic_audit", audit("Tideline", "logistics tech", TIDE)]]) {
    const j = await call(tool, args);
    const t = sectorText(j);
    assert.doesNotMatch(t, /fleet size|Fleet Manager|hub pilot|empty miles|cash on delivery|\bcourier|dispatchers/i, tool + ": " + (t.match(/fleet size|Fleet Manager|hub pilot|empty miles|cash on delivery|\bcourier|dispatchers/i) || [""])[0]);
    assert.match(lines(j.what_i_read), /Close call/, tool);
    assert.match(lines(j.what_i_read), /sector-level notes|notes that hold for every/i, tool);
    assert.equal(j.sector_notes.sector, "logistics tech", tool);
  }
});

test("a human risk and phishing training platform gets no email gateway notes (mail flow, filters, monitor mode)", async () => {
  for (const [tool, args] of [["gtm_consultation", consult("Mindshield", "cybersecurity", MIND)], ["epic_audit", audit("Mindshield", "cybersecurity", MIND)]]) {
    const j = await call(tool, args);
    const t = sectorText(j);
    assert.doesNotMatch(t, /mail flow|filters?\b|monitor mode|gateway|on the buyer's own mail/i, tool + ": " + (t.match(/mail flow|filters?\b|monitor mode|gateway|on the buyer's own mail/i) || [""])[0]);
    assert.match(j.sector_notes.sector, /^cybersecurity/, tool);
    assert.doesNotMatch(j.sector_notes.sector, /email security/i, tool);
  }
});

test("a decisive kind still gets its own notes (the fix does not drop every kind)", async () => {
  const text = "We sell route planning and dispatch software to parcel delivery fleets: driver app, proof of delivery and failed delivery re-planning, to courier companies. Our buyers' pain: dispatchers re-plan by hand. We want help choosing our go-to-market motion.";
  const j = await call("epic_audit", audit("Lanehop", "logistics tech", text));
  assert.match(j.sector_notes.sector, /last mile/i);
  assert.match(sectorText(j), /dispatch|driver app/i);
});

// ---- 2. buyers, roles, teams and countries are read only when the words support it ----
test("security teams collaborating with developers: the buyers are the security teams, developers are not named as the buyers", async () => {
  for (const [tool, args] of [["gtm_consultation", consult("Codewarden", "cybersecurity", CODE)], ["epic_audit", audit("Codewarden", "cybersecurity", CODE)]]) {
    const j = await call(tool, args);
    assert.doesNotMatch(steps(j), /names developers as the buyers|starting with developers|developers are the buyers/i, tool);
    assert.match(lines(j.what_i_read), /Buyers: security teams(?:;|\s*\()/, tool);
    assert.doesNotMatch(lines(j.what_i_read), /roles named: [^;]*developers/i, tool);
  }
});

test("systems, processes and teams in the problem text are not teams that use the product", async () => {
  const text = "We sell application modernization services and managed cloud operations to large enterprises with big application portfolios. Our buyers' pain: technical debt gathers across systems, processes and teams. We want help choosing our go-to-market motion.";
  const j = await call("epic_audit", audit("Bridgeline", "ITeS", text));
  assert.doesNotMatch(flat(j), /teams named|leader of each|Your text names these teams/i);
});

test("a list of channels is not a list of teams", async () => {
  const j = await call("epic_audit", audit("Mindshield", "cybersecurity", MIND));
  assert.doesNotMatch(flat(j), /teams named: [^;"]*(?:email|SMS)|Your text names these teams: [^.]*(?:email|SMS)|\(email, SMS, phone calls and\)/i);
  assert.match(lines(j.what_i_read), /gamified simulations delivered across email, SMS, phone calls and Teams/);
});

test("a localization platform is not given a marketer as its buyer, and its developer side (API, CLI, SDKs) reaches the plan", async () => {
  for (const tool of ["epic_audit", "generate_roadmap"]) {
    const args = tool === "epic_audit" ? audit("Wordlane", "SaaS", LOCA) : { primary_focus: "C", timeframe: "90-day", industry: "SaaS", company_name: "Wordlane", product_description: LOCA.split(" Our buyers")[0].replace(/^We sell /, ""), ...NUM };
    const j = await call(tool, args);
    const t = flat(j);
    assert.doesNotMatch(t, /pipeline sourced by marketing|a marketer or marketing operations user|Chief Marketing Officer/i, tool);
    assert.match(steps(j) + lines(j.what_i_read), /REST API|SDKs|translation memory|CLI/, tool);
  }
  // the roadmap builders give no buyers: the keyword guess must not turn a developer-side product into a marketer's
  const noBuyers = LOCA.split(" Our buyers")[0].replace(/^We sell /, "").replace(/, to product, engineering, localization and marketing teams at software companies\.?$/, "");
  const c = await call("generate_roadmap", { primary_focus: "C", timeframe: "90-day", industry: "SaaS", company_name: "Wordlane", product_description: noBuyers, ...NUM });
  assert.match(steps(c), /translation memory|REST API|workflow automation/);
  assert.doesNotMatch(flat(c), /a marketer or marketing operations user|pipeline sourced by marketing/);
});

test("Forbes Global 2000 is not a country or a global market", async () => {
  const text = "We sell identity and access management: single sign on, adaptive MFA and lifecycle management to organizations that secure workforce identities; used by a large share of the Forbes Global 2000. Our buyers' pain: stale accounts. We want help choosing our go-to-market motion.";
  const j = await call("epic_audit", audit("Keyring", "cybersecurity", text));
  assert.match(lines(j.what_i_read), /Geography: the text names no country or region/);
  assert.doesNotMatch(lines(j.what_i_read), /reads as global/);
});

test("a buyer phrase longer than a sentence fragment is cut at the buyer, not dropped", async () => {
  const text = "We sell AI-native business operations: we design, build and run customer experience, collections, back office and technology services under one contract to operations and customer experience leaders at large enterprises in banking and financial services, communications, media, technology, edtech, retail and energy and utilities. Our buyers' pain: hand-offs between firms. We want help choosing our go-to-market motion.";
  const j = await call("gtm_consultation", consult("Handoffless", "ITeS", text));
  assert.match(lines(j.what_i_read), /Buyers: operations and customer experience leaders/);
  assert.doesNotMatch(lines(j.what_i_read), /could not tell who buys/);
});

// ---- 3. less repetition in gtm_consultation ----
test("a long challenge is not echoed in full, and the embedded scoring detail does not repeat what the flat fields already hold", async () => {
  const j = await call("gtm_consultation", consult("Tideline", "logistics tech", TIDE));
  const line = j.consultation_output.split("\n").find((l) => l.startsWith("Challenge: "));
  assert.ok(line.length <= 300, "challenge line length " + line.length);
  assert.match(line, /shortened/i);
  const short = await call("gtm_consultation", { gtm_challenge: "We need more pipeline from mid-market freight buyers.", company_name: "Lanehop" });
  assert.match(short.consultation_output, /Challenge: We need more pipeline from mid-market freight buyers\./);
  for (const k of ["inputs_read", "notes", "warnings", "preliminary_note", "skipped_adjustments"]) assert.equal(j.epic_detail[k], undefined, "epic_detail." + k + " repeats a flat field");
  assert.ok(j.epic_detail.stage_used && j.epic_detail.adjustments_applied && j.epic_detail.primary, "the scoring reasons stay");
  assert.ok(j.inputs_read && j.epic_scores && j.first_30_days && j.sector_notes, "the flat fields stay");
});

test("the text answer does not print the same finding twice", async () => {
  const j = await call("gtm_consultation", consult("Tideline", "logistics tech", TIDE));
  const out = j.consultation_output.replace(/^Challenge: .*$/m, "");
  const sents = out.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length >= 40);
  const seen = new Map();
  for (const s of sents) seen.set(s, (seen.get(s) || 0) + 1);
  assert.deepEqual([...seen].filter(([, n]) => n > 1).map(([s]) => s), []);
});

// ---- 4. a pilot-led roadmap for a large deal is concrete ----
test("a 100,000 dollar pilot-led roadmap has a pilot design step, an outreach step and a partner step tied to the user's own inputs", async () => {
  const args = { primary_focus: "P", timeframe: "90-day", industry: "vertical SaaS", company_name: "Jobledger", business_model: "saas",
    product_description: "project cost control software for general contractors: job costing, change orders and subcontractor payments, with sign-off by the controller",
    acv_usd: 100000, deal_cycle_days: 90, tam_accounts: 20000, nrr_percent: 110 };
  const j = await call("generate_roadmap", args);
  const s = steps(j);
  assert.match(s, /Design the pilot/);
  assert.match(s, /job costing|change orders|subcontractor payments/);
  assert.match(s, /outreach/i);
  assert.match(s, /90-day cycle/);
  assert.match(j.action_plan.immediate.concat(j.action_plan.short_term).join(" | "), /Ask .*(?:introduce|put you in touch).*pilot/i);
  assert.doesNotMatch(s, /Keep the version of the step that converts and drop the rest/);
  assert.match(s, /controller/i);
  assert.match(s, /20,000/);
});

// ---- 5. the lead rests on the order rule when no input moved a score ----
test("when no input moved a score and the stage is assumed, the answer says the lead rests on the order rule and a one point gap, and what would change it", async () => {
  const mid = { acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 110, tam_accounts: 3000 };
  for (const [tool, args] of [["gtm_consultation", { company_name: "Shelfbeat", industry: "vertical SaaS", gtm_challenge: "We sell distributor management and field sales software to consumer goods brands. Reps miss outlet visits.", ...mid }],
    ["epic_audit", { company_name: "Shelfbeat", industry: "vertical SaaS", challenge: "We sell distributor management and field sales software to consumer goods brands. Reps miss outlet visits.", ...mid }]]) {
    const j = await call(tool, args);
    const note = j.lead_note;
    assert.ok(note, tool + ": a lead_note field");
    assert.match(note, /No input you gave moved a score/);
    assert.match(note, /order rule|tie-break order/i);
    assert.match(note, /one point/i);
    assert.match(note, /business_stage/);
    if (tool === "gtm_consultation") assert.ok(j.consultation_output.includes(note));
  }
  const moved = await call("epic_audit", { company_name: "Shelfbeat", industry: "vertical SaaS", challenge: "We sell field sales software to consumer goods brands.", acv_usd: 90000 });
  assert.equal(moved.lead_note, undefined);
  const staged = await call("epic_audit", { company_name: "Shelfbeat", industry: "vertical SaaS", challenge: "We sell field sales software to consumer goods brands.", business_stage: "series-a", ...mid });
  assert.equal(staged.lead_note, undefined);
});

// ---- 6. no figure the user did not give ----
test("no count the tool chose is printed in the plans, and the closing list asks for the user's own first batch", async () => {
  const text = "We sell route planning and dispatch software to parcel delivery fleets: driver app, proof of delivery and failed delivery re-planning, to courier companies. Our buyers' pain: dispatchers re-plan by hand. We want help choosing our go-to-market motion.";
  for (const f of ["E", "P", "I", "C"]) {
    const j = await call("generate_roadmap", { primary_focus: f, industry: "logistics tech", product_description: text.split(" Our buyers")[0].replace(/^We sell /, ""), ...NUM });
    assert.doesNotMatch(steps(j), /Example figure|\btop \d+\b|few dozen|five to ten|Interview five|\b(?:top|first) 20\b/i, "motion " + f);
  }
  const e = await call("generate_roadmap", { primary_focus: "E", industry: "logistics tech", ...NUM });
  assert.match(lines(e.what_would_make_this_specific), /first batch/i);
  const c = await call("gtm_consultation", consult("Lanehop", "logistics tech", text));
  assert.doesNotMatch(c.consultation_output.replace(/^Challenge: .*$/m, ""), /\btop \d+\b|Example figure: replace with your own\)\. At/);
  assert.match(c.consultation_output, /first batch/i);
});

// ---- schemas, names and descriptions stay ----
test("tools/list is unchanged: names, descriptions, schemas and annotations", async () => {
  const j = await rpc("tools/list", {});
  assert.deepEqual(j.result.tools.map((t) => t.name), ["gtm_consultation", "epic_audit", "generate_roadmap"]);
  const { createHash } = await import("node:crypto");
  const sha = createHash("sha256").update(JSON.stringify(j.result.tools)).digest("hex").slice(0, 12);
  assert.equal(sha, "ea2cc9aa4d69");
});
