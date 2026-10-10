// Run 22 round 3 (writer alpha-w1): the faults the fresh judges named after round 2, and the principle behind the sealed-set E8 flags: never print a
// sector or product-kind name, a sector term or kind-specific notes unless the user's own words hold the evidence. Written before the fixes.
// Companies are invented (rule B81); every figure is an example. Run: node --test tests/run22-gtm-alpha-round3.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
let id = 1;
const call = async (name, args) => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }), {});
  const j = await r.json();
  assert.ok(!j.result.isError, "no error: " + JSON.stringify(j.result).slice(0, 300));
  return JSON.parse(j.result.content.map((c) => c.text).join("\n"));
};
const flat = (x) => JSON.stringify(x);
const lines = (v) => (Array.isArray(v) ? v : v ? [v] : []).join(" | ");
const steps = (j) => [...(j.first_30_days || []), ...((j.action_plan && [...j.action_plan.immediate, ...j.action_plan.short_term, ...j.action_plan.medium_term]) || [])].join(" | ");
const sectorText = (j) => steps(j) + " | " + flat(j.sector_notes || {}) + " | " + (j.sector_fit || "");
const NUM = { acv_usd: 90000, deal_cycle_days: 120, nrr_percent: 112, tam_accounts: 4000 };
const consult = (company_name, industry, text, extra = {}) => ({ company_name, industry, gtm_challenge: text, ...NUM, ...extra });
const audit = (company_name, industry, text, extra = {}) => ({ company_name, industry, challenge: text, ...NUM, ...extra });
const road = (company_name, industry, text, focus, extra = {}) => ({ primary_focus: focus, timeframe: "90-day", industry, company_name, product_description: text.split(" Our buyers")[0].replace(/^We sell /, ""), ...NUM, ...extra });

const SPEC = "We sell an API workspace for designing, testing and documenting APIs to API teams and developers at 400,000 companies, including most of the Fortune 500. Our buyers' pain: most enterprises run the API lifecycle as disconnected projects with separate tools, so specs, tests and docs drift apart. We want help choosing our go-to-market motion.";
const BIN = "We sell a mobile application security testing platform that scans compiled APK and IPA binaries rather than source code, with automated dynamic testing on real devices and per-build compliance evidence, to enterprises that build and ship mobile apps and must secure them: 300+ enterprises including 60+ in banking and 10+ in the Fortune 500. Our buyers' pain: mobile releases ship faster than reviews. We want help choosing our go-to-market motion.";
const CORE = "We sell a cloud-native core banking platform that runs lending, deposits and payments on one ledger, with implementation services, to banks, lenders and fintechs that need to replace an ageing core. Our buyers' pain: product launches wait on a rigid core. We want help choosing our go-to-market motion.";
const PHISH = "We sell an anti phishing and anti spam messaging platform that blocks scam messages sent under a brand's name, with consent management, to enterprises across industries, including banks and financial services firms and digital native brands. Our buyers' pain: scam messages travel over SMS under legitimate brand names. We want help choosing our go-to-market motion.";

test("a developer adopted product: the outbound list is aimed at the people who sign, the stated pain is used, and the answer says self_serve is the lever", async () => {
  const j = await call("gtm_consultation", consult("Specbridge", "software", SPEC, { acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 20000 }));
  const out = j.consultation_output.replace(/^Challenge: .*$/m, "");
  assert.doesNotMatch(out, /outbound list by role \([^)]*developers/i);
  assert.match(out, /disconnected projects/);
  assert.ok(j.adoption_note, "an adoption_note field");
  assert.match(j.adoption_note, /self_serve/);
  assert.match(j.adoption_note, /Product-Led/);
  assert.match(j.adoption_note, /VP Engineering|signs|sign/i);
  assert.ok(out.includes(j.adoption_note));
  assert.match(j.epic_scores.I + "", /\d/);
});

test("customer claims are not use cases, buyers are read before a colon list of claims, and a binary scanner gets no source-code notes", async () => {
  for (const [tool, args] of [["epic_audit", audit("Apkguard", "cybersecurity", BIN)], ["gtm_consultation", consult("Apkguard", "cybersecurity", BIN)]]) {
    const j = await call(tool, args);
    const t = sectorText(j);
    assert.doesNotMatch(lines(j.what_i_read), /use cases named:[^|]*300\+/, tool);
    assert.match(lines(j.what_i_read), /Buyers: enterprises/, tool);
    assert.doesNotMatch(t, /repositor|pull request|secrets in code|merge request/i, tool + ": " + (t.match(/repositor\w*|pull request|secrets in code/i) || [""])[0]);
    assert.match(j.sector_notes.sector, /^cybersecurity(?:, mobile application security)?$/, tool);
  }
});

test("a core banking vendor gets no card acceptance words, and no article stands before a noun phrase that already has one", async () => {
  for (const f of ["E", "P", "I", "C"]) {
    const j = await call("generate_roadmap", road("Ledgerstone", "fintech", CORE, f, { acv_usd: 250000, deal_cycle_days: 180, tam_accounts: 1500 }));
    assert.doesNotMatch(steps(j), /payment success rate|authori[sz]ation|chargeback|tokeni[sz]ation|sponsor bank/i, "motion " + f);
    assert.doesNotMatch(flat(j), /\byour (?:a|an|the) /i, "motion " + f + ": " + (flat(j).match(/\byour (?:a|an|the) [^.]{0,40}/i) || [""])[0]);
  }
  const i = await call("generate_roadmap", road("Ledgerstone", "fintech", CORE, "I", { acv_usd: 250000, deal_cycle_days: 180, tam_accounts: 1500 }));
  assert.match(steps(i), /Lead the sequence with your cloud-native, composable core banking platform offer|Lead the sequence with your [a-z-]|Lead the sequence with the first number this buyer already watches/);
});

test("grammar: no 'your a/an/the' in any answer of any tool for several invented companies", async () => {
  for (const [name, ind, text] of [["Specbridge", "software", SPEC], ["Apkguard", "cybersecurity", BIN], ["Ledgerstone", "fintech", CORE], ["Smishguard", "telecom", PHISH]]) {
    for (const [tool, args] of [["gtm_consultation", consult(name, ind, text)], ["epic_audit", audit(name, ind, text)], ["generate_roadmap", road(name, ind, text, "I")], ["generate_roadmap", road(name, ind, text, "P")]]) {
      const j = await call(tool, args);
      assert.doesNotMatch(flat(j), /\b(?:your|our) (?:a|an|the) /i, name + " " + tool);
    }
  }
});

test("an anti phishing messaging product: no pointer to a closing line that is not there, fraud or risk heads named, banks and brands kept", async () => {
  const j = await call("gtm_consultation", consult("Smishguard", "telecom", PHISH, { acv_usd: 150000, deal_cycle_days: 120, tam_accounts: 8000 }));
  const out = j.consultation_output;
  const closing = out.slice(out.indexOf("To sharpen this"));
  if (/closing list shows what setting it would do/.test(out)) assert.match(closing, /Give self_serve/);
  assert.match(lines(j.what_i_read), /banks and financial services firms/);
  assert.match(steps(j), /fraud/i);
});

test("principle: no other sector's name is printed, and a close call names the readings only with the user's own words", async () => {
  const SECTORS = ["logistics tech", "fintech", "telecom", "ITeS", "AI native", "cybersecurity", "vertical SaaS"];
  const texts = [
    ["software", "We sell a developer platform for building, testing and shipping code: pipelines, a package registry and test automation, to engineering teams. We also handle payments for freight shippers on the side. Our buyers' pain: slow releases."],
    ["SaaS", "We sell a team workspace for planning work: boards, docs and automation, to operations teams at fintech and telecom companies and logistics firms. Our buyers' pain: scattered tools."],
    ["vertical SaaS", "We sell hotel front desk software: reservations, housekeeping and payments, to hotels and hostels. We are AI-native in how we build. Our buyers' pain: overbooking."],
  ];
  for (const [ind, text] of texts) {
    for (const [tool, args] of [["gtm_consultation", consult("Acme" + ind.length, ind, text)], ["epic_audit", audit("Acme" + ind.length, ind, text)]]) {
      const j = await call(tool, args);
      const read = lines(j.what_i_read);
      for (const s of SECTORS) if (s !== ind && !text.includes(s) && !(j.sector_notes && j.sector_notes.sector.startsWith(s))) assert.ok(!read.includes(s), `${tool} ${ind}: prints ${s}`);
    }
  }
  const tide = "We sell a decision platform for shippers that joins transportation management, shipment and inventory visibility on every mode (ocean, over the road, air, rail), yard management and last mile logistics, with AI agents that act on exceptions, on one network of carriers to shippers and brands that move freight. Our buyers' pain: shipments go dark between carriers. We want help choosing our go-to-market motion.";
  const j = await call("epic_audit", audit("Tideline", "logistics tech", tide));
  const close = lines(j.what_i_read).match(/Close call:[^|]*/)[0];
  assert.match(close, /transportation management/);
  assert.match(close, /shipment and inventory visibility|visibility/);
  assert.doesNotMatch(close, /freight visibility|transport and fleet management/);
});

test("thin evidence: a text with no product words names no kind and the answer says it could not tell", async () => {
  const j = await call("epic_audit", audit("Plainco", "software", "We want help with our go-to-market."));
  assert.equal(j.sector_notes.sector, "software");
  assert.match(lines(j.what_i_read), /Product: I could not tell/);
  assert.match(lines(j.what_i_read), /Buyers: I could not tell/);
});

test("a count of connectors is not a use case", async () => {
  const text = "We sell an enterprise AI platform that connects to company tools and data: Search, Assistant and Agents, 275+ app connectors and open APIs, to the world's leading enterprises. Our buyers' pain: people cannot find answers. We want an EPIC view.";
  const j = await call("epic_audit", audit("Findall", "AI native", text));
  assert.doesNotMatch(lines(j.what_i_read), /use cases named:[^|]*275\+/);
  assert.doesNotMatch(steps(j), /275\+ app connectors/);
});

test("pilot-led steps say pilot, not 'the step', and the first-moment sentence reads as one sentence", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", industry: "vertical SaaS", company_name: "Jobledger", business_model: "saas", product_description: "project cost control software for general contractors: job costing, change orders and subcontractor payments", acv_usd: 100000, deal_cycle_days: 90, tam_accounts: 20000 });
  assert.doesNotMatch(steps(j), /\b(?:the|that) step\b|step-one/i);
  const s = await call("generate_roadmap", { primary_focus: "P", industry: "AI native", company_name: "Bolwave", product_description: "speech and document AI for Indian languages: voice agents for collections calls and form extraction for insurers", acv_usd: 20000, deal_cycle_days: 10, tam_accounts: 2000 });
  assert.doesNotMatch(steps(s), /and check whether for/);
  assert.match(steps(s), /first moment of value/);
});

test("the stage row is described plainly as a neutral default that large established companies outgrow", async () => {
  const j = await call("epic_audit", audit("Biggco", "ITeS", "We sell IT services and consulting to large enterprises. Our buyers' pain: legacy applications. We want an EPIC view."));
  assert.match(lines(j.to_sharpen_this), /business_stage: .*(?:large|established).*later row/i);
});

test("ABM asked for a small fast deal across a very large account base gets a plain caution and what would change the lead", async () => {
  const j = await call("generate_roadmap", { primary_focus: "E", industry: "software", company_name: "Testlane", product_description: "a cloud platform for testing websites and mobile apps on real devices, with test automation, visual testing and accessibility testing, to developer and QA teams", acv_usd: 15000, deal_cycle_days: 30, tam_accounts: 200000 });
  assert.ok(j.read_this_first, "a note first");
  assert.match(j.read_this_first, /15,000/);
  assert.match(j.read_this_first, /200,000/);
  assert.match(j.read_this_first, /Inbound and Outbound|Product-Led/);
  assert.match(j.read_this_first, /gtm_consultation/);
});

test("scores and tools/list are unchanged", async () => {
  const j = await call("epic_audit", audit("Specbridge", "software", SPEC, { acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 20000 }));
  assert.deepEqual(j.scores, { E: 6, P: 5, I: 8, C: 6 });
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 9999, method: "tools/list", params: {} }) }), {});
  const { createHash } = await import("node:crypto");
  assert.equal(createHash("sha256").update(JSON.stringify((await r.json()).result.tools)).digest("hex").slice(0, 12), "ea2cc9aa4d69");
});
