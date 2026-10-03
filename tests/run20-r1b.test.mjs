// Run 20 quality round 1b (D92): the judges' reasons for gtm_consultation, epic_audit and generate_roadmap. Written before the
// fixes. Companies are invented (rule B81), every figure is an example. Run: node --test tests/run20-r1b.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEpic, stageRow } from "../netlify/lib/epic-advanced.js";

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
const plan = (j) => [...(j.first_30_days || []), ...((j.action_plan && [...j.action_plan.immediate, ...j.action_plan.short_term, ...j.action_plan.medium_term]) || [])].join(" | ");

// Invented companies, one per sector (example inputs, hypothetical figures).
const CASES = {
  logistics: { company_name: "Routewise", industry: "logistics tech", gtm_challenge: "We sell a transport management system and last mile delivery platform to retailers and food brands with their own fleets. Dispatchers re-plan by hand and failed deliveries are costly.", acv_usd: 90000, deal_cycle_days: 120, nrr_percent: 112, tam_accounts: 3000 },
  fintech: { company_name: "Ledgerline", industry: "fintech", gtm_challenge: "We sell an expense and reimbursement platform to midsize companies. Claims take weeks to reimburse and policy breaches go unseen.", acv_usd: 30000, deal_cycle_days: 90, nrr_percent: 110, tam_accounts: 8000 },
  vertical: { company_name: "Shelfbeat", industry: "vertical SaaS", gtm_challenge: "We sell distributor management and field sales software to consumer goods brands. Reps miss outlet visits and schemes are not followed.", acv_usd: 24000, deal_cycle_days: 75, nrr_percent: 112, tam_accounts: 6000 },
  ainative: { company_name: "Quantforge", industry: "AI native", gtm_challenge: "We sell systematic investment strategies powered by adaptive AI, and a platform that overlays AI forecasts on an existing investment process, to asset allocators, investment managers and banks.", acv_usd: 250000, deal_cycle_days: 180, nrr_percent: 108, tam_accounts: 1500 },
  telecom: { company_name: "Linkspan", industry: "telecom", gtm_challenge: "We sell managed SD-WAN, internet leased lines and business internet to enterprises with many branches. Outages hit branch sales.", acv_usd: 120000, deal_cycle_days: 120, nrr_percent: 108, tam_accounts: 4000 },
  saas: { company_name: "Billnest", industry: "SaaS", gtm_challenge: "We sell a billing and subscription management platform with invoicing, revenue recognition and collections to software companies. Finance spends days reconciling usage and flat fees.", acv_usd: 60000, deal_cycle_days: 75, nrr_percent: 118, tam_accounts: 10000 },
  ites: { company_name: "Bridgeworks", industry: "ITeS", gtm_challenge: "We sell modernization engineering services, cloud migration and managed services, to large enterprises. Clients want lower cost and modernization together.", acv_usd: 400000, deal_cycle_days: 180, nrr_percent: 108, tam_accounts: 2000 },
  software: { company_name: "Specdrop", industry: "software", gtm_challenge: "We sell an API platform for building and testing APIs to developers at more than 500,000 companies. Specs and docs drift apart in large teams.", acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 20000 },
  cyber: { company_name: "Threadguard", industry: "cybersecurity", gtm_challenge: "We sell attack surface monitoring and threat intelligence to security teams at large enterprises. Teams get thousands of isolated findings.", acv_usd: 80000, deal_cycle_days: 120, nrr_percent: 115, tam_accounts: 5000 },
};

test("a missing stage keeps the old Series B starting row (D80) but says plainly that the stage was not given", async () => {
  const j = await call("gtm_consultation", CASES.fintech);
  assert.match(j.epic_detail.stage_used, /Stage not given: the Series B starting row is used as a neutral default/);
  assert.match(j.consultation_output, /Stage not given: the Series B starting row/);
  assert.deepEqual(j.epic_scores, { E: 7, P: 5, I: 6, C: 6 }); // the preset is unchanged; ACV 30,000, cycle 90, NRR 110 and TAM 8,000 are all in the middle bands
  const big = await call("epic_audit", { ...CASES.ainative, challenge: CASES.ainative.gtm_challenge });
  assert.deepEqual(big.scores, { E: 10, P: 4, I: 5, C: 6 }); // Series B row + ACV above 50,000 (+2 E, -1 P) + cycle above 90 (+2 E, -1 I), E held at 10
  assert.match(big.primary.reason, /stage not given, the Series B starting row is used as a neutral default: starting point 7/);
  assert.doesNotMatch(flat(big), /used because the stage was missing/);
});

test("a stage that is given keeps the documented scores", () => {
  const r = scoreEpic({ business_stage: "Series B", acv_usd: 30000 });
  assert.deepEqual(r.scores, { E: 7, P: 5, I: 6, C: 6 });
  assert.match(r.stage_used, /Series B/);
  const pub = scoreEpic({ business_stage: "listed company", acv_usd: 30000 });
  assert.match(pub.stage_used, /Series C/); // "listed" is read as a late stage
  assert.equal(stageRow("Nasdaq listed"), "series_c");
  assert.equal(stageRow("NYSE"), "series_c");
});

test("a stage the tool cannot read is said so, with the same neutral default row", () => {
  const r = scoreEpic({ business_stage: "somewhere in between" });
  assert.deepEqual(r.scores, { E: 7, P: 5, I: 6, C: 6 });
  assert.match(r.stage_used, /Stage not recognised: the Series B starting row is used as a neutral default/);
});

test("every number given is read back with its band and what it did (NRR and TAM included)", async () => {
  for (const tool of ["gtm_consultation", "epic_audit"]) {
    const args = tool === "epic_audit" ? { ...CASES.saas, challenge: CASES.saas.gtm_challenge } : CASES.saas;
    const j = await call(tool, args);
    const reading = (j.inputs_read || j.epic_detail.inputs_read).join(" | ");
    assert.match(reading, /ACV[^|]*60,000[^|]*above 50,000[^|]*Ecosystem and ABM \+2/i, tool);
    assert.match(reading, /deal cycle[^|]*75 days[^|]*no adjustment/i, tool);
    assert.match(reading, /NRR 118[^|]*100[^|]*120[^|]*no adjustment/i, tool);
    assert.match(reading, /TAM 10,000[^|]*500[^|]*10,000[^|]*no adjustment/i, tool);
  }
  const low = await call("epic_audit", { challenge: "Churn is the issue.", industry: "SaaS", nrr_percent: 92, tam_accounts: 300 });
  const lr = low.inputs_read.join(" | ");
  assert.match(lr, /NRR[^|]*92[^|]*below 100[^|]*Community-Led \+2/i);
  assert.match(lr, /TAM[^|]*300[^|]*below 500[^|]*Ecosystem and ABM \+2/i);
});

test("inputs that were not given are listed with what giving them would change", async () => {
  const j = await call("epic_audit", { ...CASES.telecom, challenge: CASES.telecom.gtm_challenge });
  const r = j.inputs_read.join(" | ");
  assert.match(r, /self-serve[^|]*not given/i);
  assert.match(r, /deal source[^|]*not given/i);
  assert.match(r, /geography[^|]*not given/i);
});

test("an investment manager with the industry AI native gets the investment buying committee, not corporate finance or AI support desk text", async () => {
  for (const tool of ["gtm_consultation", "epic_audit"]) {
    const args = tool === "epic_audit" ? { ...CASES.ainative, challenge: CASES.ainative.gtm_challenge } : CASES.ainative;
    const j = await call(tool, args);
    const n = flat(j.sector_notes);
    assert.match(n, /investment committee|chief investment officer/i, tool);
    assert.match(n, /due diligence/i, tool);
    assert.match(n, /track record/i, tool);
    assert.doesNotMatch(n, /close the books|ERP integration|ERP|resolution rate|handling time|Finance Controller/i, tool);
    assert.match(j.business_model || flat(j), /investment management/i, tool);
    assert.match(j.sector_notes.sector, /AI native/);
    assert.doesNotMatch(plan(j), /\bICP for ABM targeting\b/);
  }
});

test("a software TMS is a software subscription, never a people-delivered services model", async () => {
  const j = await call("gtm_consultation", CASES.logistics);
  assert.match(j.business_model, /software subscription/);
  assert.doesNotMatch(flat(j), /people-delivered|per FTE|per ticket/);
});

test("the first 30 days use the sector: partner types, buyer roles, the sector's numbers, proof shape and objections", async () => {
  const want = {
    logistics: /TMS|WMS|3PL|dispatch|cost per delivery|hub/i,
    fintech: /ERP|finance controller|CFO|Chief Financial Officer|month-end|reconcil/i,
    vertical: /distributor|DMS|secondary sales|beat|outlet|National Sales Head/i,
    ainative: /allocator|consultant|due diligence|investment committee|track record/i,
    telecom: /site survey|operator|SD-WAN|branch|uptime|CIO/i,
    saas: /finance|billing|reconcil|revenue/i,
    ites: /RFP|SLA|transition|procurement|references/i,
    software: /developer|VP Engineering|CI pipeline|integration|open-source/i,
    cyber: /CISO|SIEM|MSSP|proof of value|exposure|attack surface/i,
  };
  const seen = new Set();
  for (const [k, args] of Object.entries(CASES)) {
    const j = await call("gtm_consultation", args);
    const steps = j.first_30_days.join(" | ");
    assert.ok(j.first_30_days.length >= 3, k);
    assert.match(steps, want[k], k + ": " + steps);
    assert.doesNotMatch(steps, /Develop ideal customer profile \(ICP\) for ABM targeting|Audit content strategy and identify high-intent keywords|Define community vision and core value proposition/, k);
    seen.add(steps);
  }
  assert.equal(seen.size, 9, "nine different plans for nine companies");
});

test("the plan uses the user's own channels, cycle, ACV and TAM when given", async () => {
  const j = await call("gtm_consultation", { ...CASES.telecom, current_channels: "paid search and two trade shows a year" });
  const s = plan(j);
  assert.match(s, /paid search and two trade shows a year/);
  assert.match(s, /120-day/);
  assert.match(s, /4,000/);
  const k = await call("epic_audit", { ...CASES.telecom, challenge: CASES.telecom.gtm_challenge, current_channels: "paid search and two trade shows a year" });
  assert.match(plan(k), /paid search and two trade shows a year/);
});

test("epic_audit now carries the first 30 days and the business model, with the same scores as gtm_consultation", async () => {
  const a = await call("gtm_consultation", CASES.cyber);
  const b = await call("epic_audit", { ...CASES.cyber, challenge: CASES.cyber.gtm_challenge });
  assert.deepEqual(a.epic_scores, b.scores);
  assert.deepEqual(a.first_30_days, b.first_30_days);
  assert.match(b.business_model, /software subscription/);
});

test("a generic SaaS seller whose text names finance buyers gets finance buyers and a note that reconciles the lead motion with the product-led pattern", async () => {
  const j = await call("gtm_consultation", CASES.saas);
  const n = flat(j.sector_notes);
  assert.match(n, /Chief Financial Officer|CFO|VP Finance/);
  assert.match(n, /billing|days sales outstanding|invoice/i);
  assert.match(j.sector_fit, /Ecosystem and ABM/);
  assert.match(j.sector_fit, /product-led|self-serve|trial/i);
  assert.match(j.consultation_output, /How this fits the sector/);
});

test("self_serve not given: the answer shows what giving it would change, for a software subscription only", async () => {
  const sw = await call("gtm_consultation", CASES.software);
  assert.match(sw.self_serve_check, /self_serve/);
  assert.match(sw.self_serve_check, /Product-Led score would go from 5 to 7/);
  assert.match(sw.self_serve_check, /developers at more than 500,000 companies|500,000 companies/);
  const withIt = await call("gtm_consultation", { ...CASES.software, self_serve: true });
  assert.equal(withIt.self_serve_check, undefined);
  assert.equal(withIt.epic_scores.P, 7);
  const svc = await call("gtm_consultation", CASES.ites);
  assert.equal(svc.self_serve_check, undefined);
});

test("scores are not changed by the new text (D80): the same inputs with a stage give the documented numbers", async () => {
  const j = await call("gtm_consultation", { ...CASES.telecom, business_stage: "series-b" });
  assert.deepEqual(j.epic_scores, { E: 10, P: 4, I: 5, C: 6 });
});

test("a tie at the top names every tied motion, and Product-Led Growth loses a tie unless self_serve is true (D80 item)", () => {
  const base = { business_stage: "series-c", tam_accounts: 20000 }; // E 8-1, P 4, I 5+2, C 7: E, I and C tie at 7
  const r = scoreEpic(base);
  assert.deepEqual(r.scores, { E: 7, P: 4, I: 7, C: 7 });
  assert.equal(r.primary.letter, "E");
  assert.match(r.notes.join(" | "), /Tie at the top between E, C and I[^|]*order E, C, I, P/);
  // P and I tie at 7 only when self_serve is true (series-a 5/5/6/4, self-serve +2 for P, US or EU +1 for I): then P wins the tie
  const tie = scoreEpic({ business_stage: "series-a", self_serve: true, geography: "us_eu" });
  assert.deepEqual([tie.scores.P, tie.scores.I], [7, 7]);
  assert.equal(tie.primary.letter, "P");
  assert.match(tie.notes.join(" | "), /order E, P, C, I/);
});

test("the sector fit paragraph for a four-way tie names the sector pattern", async () => {
  const { sectorFit } = await import("../netlify/lib/gtm-plan.js");
  const { VERTICALS } = await import("../netlify/lib/verticals.js");
  const fin = VERTICALS.find((v) => v.id === "fintech");
  const text = sectorFit({ vertical: fin, model: "saas", letter: "E", motionName: "Ecosystem and ABM", scores: { E: 5, P: 5, I: 5, C: 5 }, selfServeGiven: false });
  assert.match(text, /tie/);
  assert.match(text, /CFO/);
});

test("generate_roadmap without a business model does not assume a software subscription", async () => {
  for (const f of ["E", "P", "I", "C"]) {
    const j = await call("generate_roadmap", { primary_focus: f, timeframe: "90-day" });
    assert.doesNotMatch(flat(j), /software subscription|assume/i, f);
    assert.match(j.business_model, /not given/i);
    assert.ok(j.action_plan.immediate.length >= 3 && j.action_plan.short_term.length >= 3 && j.action_plan.medium_term.length >= 3, f);
    assert.match(flat(j.what_would_make_this_specific), /industry/i);
  }
  const p = await call("generate_roadmap", { primary_focus: "P", timeframe: "90-day" });
  assert.match(plan(p), /If buyers can start without a sales call/i);
  assert.match(plan(p), /If they cannot/i);
});

test("generate_roadmap with an industry and a business model names the sector's partners, roles and measures", async () => {
  const j = await call("generate_roadmap", { primary_focus: "E", timeframe: "60-day", industry: "logistics tech", business_model: "saas", acv_usd: 90000, deal_cycle_days: 120, current_channels: "outbound and two events" });
  const s = plan(j);
  assert.match(s, /TMS|WMS|3PL/);
  assert.match(s, /cost per delivery|first-attempt/i);
  assert.match(s, /outbound and two events/);
  assert.match(s, /120-day/);
  assert.equal(j.sector, "logistics tech");
  assert.deepEqual(j.schedule, { immediate: "Days 1 to 20", short_term: "Days 21 to 40", medium_term: "Days 41 to 60" });
});

test("generate_roadmap: services, connectivity and investment get no trial, sign-up or viral steps, and say what the product-led motion means for them", async () => {
  for (const m of ["services", "connectivity", "investment"]) {
    for (const f of ["E", "P", "I", "C"]) {
      const j = await call("generate_roadmap", { primary_focus: f, timeframe: "90-day", business_model: m });
      assert.doesNotMatch(plan(j), /self-service trial|self-serve|viral|freemium|in-app|free trial|MRR|aha moment|\bseats?\b|per seat|sign-?up/i, m + f);
    }
  }
  const p = await call("generate_roadmap", { primary_focus: "P", timeframe: "90-day", business_model: "connectivity" });
  assert.match(plan(p), /site survey|pilot at one or two sites/i);
  assert.match(p.note, /connectivity/i);
});

test("no placeholder, no undefined, no dash characters, no doubled spaces in any answer, for every sector and motion", async () => {
  const outs = [];
  for (const args of Object.values(CASES)) {
    outs.push(await call("gtm_consultation", args));
    outs.push(await call("epic_audit", { ...args, challenge: args.gtm_challenge }));
    for (const f of ["E", "P", "I", "C"]) outs.push(await call("generate_roadmap", { primary_focus: f, industry: args.industry, business_model: undefined }));
  }
  for (const j of outs) {
    const t = flat(j);
    assert.doesNotMatch(t, /undefined|NaN|\[Insert|\[Your|\{\{|null,|TBD|XX%/);
    assert.doesNotMatch(t.replace(/Challenge: [^"]*/g, ""), /[–—]/);
    assert.doesNotMatch(t.replace(/(\\n)+/g, " ").replace(/Challenge: .*?(?=Primary Focus)/, ""), /  /);
  }
});

test("the sector text adds no clinic word and no statistic: no digits followed by a percent sign in the plan text", async () => {
  const B75 = /\b(clinics?|patients?|hospitals?|healthcare|hipaa|ehr|appointments?|no-shows?|dental|physio\w*)\b/i;
  for (const args of Object.values(CASES)) {
    const j = await call("gtm_consultation", args);
    assert.doesNotMatch(plan(j) + flat(j.sector_notes) + j.sector_fit, B75);
    assert.doesNotMatch(plan(j) + j.sector_fit, /\d\s?%|percent/);
  }
});

test("business model words: no SaaS-only terms in a services, connectivity or investment answer unless the user typed them", async () => {
  for (const k of ["ites", "telecom", "ainative"]) {
    const j = await call("gtm_consultation", CASES[k]);
    assert.doesNotMatch(flat(j).replace(/Challenge: [^"]*/, ""), /\bMRR\b|free trial|freemium|self-serve sign-?up|per seat|\bseats\b|aha moment/i, k);
  }
});

test("tools/list: generate_roadmap takes optional industry, company_name, acv_usd, deal_cycle_days, tam_accounts and current_channels; required stays primary_focus", async () => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 99, method: "tools/list" }) }), {});
  const t = (await r.json()).result.tools.find((x) => x.name === "generate_roadmap");
  for (const k of ["industry", "company_name", "acv_usd", "deal_cycle_days", "tam_accounts", "current_channels"]) assert.ok(t.inputSchema.properties[k], k);
  assert.deepEqual(t.inputSchema.required, ["primary_focus"]);
});

test("an acronym at the start of the proof shape is kept in capitals (SLA, not sLA)", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", industry: "ITeS" });
  assert.match(plan(j), /: SLA and cost outcomes/);
  assert.doesNotMatch(flat(j), /sLA/);
  assert.doesNotMatch(flat(j), /self-serve sign-up/i);
});

// ---- Round 2 (fresh judge, 6 lines below 4) ----
test("round 2 (1, 5): the software sector fits developer platforms in general, not only testing tools", async () => {
  const QA = /Head of QA|test coverage|CI pipeline|cross-browser|escaped defects|release frequency|lead time for changes|regression testing/i;
  for (const tool of ["gtm_consultation", "epic_audit"]) {
    const args = tool === "epic_audit" ? { ...CASES.software, challenge: CASES.software.gtm_challenge } : CASES.software;
    const j = await call(tool, args);
    assert.doesNotMatch(plan(j) + flat(j.sector_notes), QA, tool);
    assert.match(plan(j), /developer/i, tool);
    assert.match(flat(j.sector_notes), /developer experience|documentation|integrations|governance/i, tool);
  }
  for (const f of ["E", "P", "I", "C"]) {
    const j = await call("generate_roadmap", { primary_focus: f, industry: "software" });
    assert.doesNotMatch(plan(j), QA, f);
  }
  const c = await call("generate_roadmap", { primary_focus: "C", industry: "software", company_name: "Specdrop" });
  assert.match(plan(c), /API design|governance|developer workflows|documentation/i);
});

test("round 2 (2): an AI native seller of investment strategies gets investment steps, and an unknown AI native model gets neutral wording and a question", async () => {
  const SUPPORT = /resolution rate|evaluation set|human review|handling time|escalation rate|customer satisfaction on automated/i;
  for (const f of ["E", "P", "I", "C"]) {
    const inv = await call("generate_roadmap", { primary_focus: f, industry: "AI native", business_model: "investment" });
    assert.doesNotMatch(plan(inv), SUPPORT, f);
    assert.match(plan(inv), /due diligence|consultant|track record|model portfolio|allocation|mandate|investment committee/i, f);
    const unknown = await call("generate_roadmap", { primary_focus: f, industry: "AI native" });
    assert.doesNotMatch(plan(unknown), SUPPORT, f + " unknown");
    assert.match(flat(unknown.what_would_make_this_specific), /investment/i, f);
  }
  const read = await call("generate_roadmap", { primary_focus: "C", industry: "AI native", product_description: "We sell systematic investment strategies powered by adaptive AI to asset allocators and banks." });
  assert.match(read.business_model, /investment management/);
  assert.doesNotMatch(plan(read), SUPPORT);
  assert.match(plan(read), /track record|due diligence|consultant/i);
});

test("round 2 (3): a requested motion that the ACV and cycle contradict is said so in one line at the top, with the nearest fitting steps", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", timeframe: "90-day", industry: "logistics tech", company_name: "Routewise", acv_usd: 150000, deal_cycle_days: 150 });
  assert.equal(Object.keys(j)[0], "read_this_first");
  assert.match(j.read_this_first, /150,000/);
  assert.match(j.read_this_first, /150-day/);
  assert.match(j.read_this_first, /pilot/i);
  assert.ok(!/\n/.test(j.read_this_first));
  assert.doesNotMatch(plan(j), /invitations|sign-up|plan and price page|first-use path/i);
  assert.match(plan(j), /hub|cost per delivery/i);
  const small = await call("generate_roadmap", { primary_focus: "P", industry: "logistics tech", acv_usd: 3000, deal_cycle_days: 10 });
  assert.equal(small.read_this_first, undefined);
  const e = await call("generate_roadmap", { primary_focus: "E", industry: "SaaS", acv_usd: 2000, deal_cycle_days: 10 });
  assert.match(e.read_this_first, /2,000/);
  const fine = await call("generate_roadmap", { primary_focus: "E", industry: "SaaS", acv_usd: 90000, deal_cycle_days: 120 });
  assert.equal(fine.read_this_first, undefined);
});

test("round 2 (4): the product-led user and the signer are different people, right for the sector", async () => {
  const generic = await call("generate_roadmap", { primary_focus: "P", industry: "SaaS" });
  assert.match(plan(generic), /who the product-led user is \(the person who feels the problem day to day[^)]*\) and who still has to say yes \(the budget owner/);
  assert.doesNotMatch(plan(generic), /user is \(Chief Financial Officer\)|VP Product\)/);
  const fin = await call("generate_roadmap", { primary_focus: "P", industry: "SaaS", product_description: "We sell a billing platform with invoicing, revenue recognition and collections to software companies." });
  assert.match(plan(fin), /finance operations user or an engineer evaluating the integration/);
  assert.match(plan(fin), /still has to say yes \(the CFO or VP Finance\)/);
  const dev = await call("generate_roadmap", { primary_focus: "P", industry: "software" });
  assert.match(plan(dev), /product-led user is \(a developer[^)]*\) and who still has to say yes \(the VP Engineering or CTO\)/);
});

test("round 2: tools/list lists product_description as an optional roadmap input", async () => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 98, method: "tools/list" }) }), {});
  const t = (await r.json()).result.tools.find((x) => x.name === "generate_roadmap");
  assert.ok(t.inputSchema.properties.product_description);
});
