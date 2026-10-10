// Run 22 round 8 (writer alpha-w1): a services firm whose text names more than one line of business (here customer experience outsourcing and financial
// services operations) must get buyer roles, buyer words, objections and pains for each named line, not only for the line the sector file has notes for.
// Invented company; every figure is an example. Run: node --test tests/run22-gtm-alpha-round8.test.mjs
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
const count = (text, phrase) => text.split(phrase).length - 1;

const MULTI = "We sell operations, data and customer experience services delivered with AI: customer experience, financial services operations, financial crime compliance, market intelligence and data and analytics, to large enterprises and financial institutions, brands and growth clients, including Fortune 500 companies (page claim). Our buyers' pain: customer experience management is the new battleground, with consumers demanding better support; capital markets are under constant strain from rising volumes, tighter regulations and the cost of financial risk management; fragmented data slows decisions. We want help choosing our go-to-market motion.";
const ONE = "We sell customer experience outsourcing: voice, chat and email support and back office for retail and travel brands. Our buyers' pain: contact volumes spike in peak season and quality drops. We want help choosing our go-to-market motion.";
const NUM = { acv_usd: 1000000, deal_cycle_days: 150, nrr_percent: 108, tam_accounts: 8000 };

test("a services text with several lines of business: roles, words, objections and pains cover each named line", async () => {
  const j = await call("gtm_consultation", { company_name: "Opsgrid", industry: "ITeS", gtm_challenge: MULTI, ...NUM });
  const role = j.first_30_days.find((x) => x.startsWith("For every account name the people on the buying side")).split(". ")[0];
  assert.match(role, /Chief Customer Officer/);
  assert.match(role, /financial services operations/);
  assert.match(role, /financial crime compliance/);
  assert.match(flat(j.sector_notes.buyer_words), /financial services operations/);
  assert.match(flat(j.sector_notes.buyer_words), /financial crime compliance/);
  assert.match(j.sector_notes.read_as, /financial services operations/);
  assert.match(j.sector_notes.read_as, /no notes for|do not cover/);
  assert.match(flat(j.sector_notes.usual_objections), /financial services operations[^"]*no objections|no objections[^"]*financial services operations/);
  assert.match(lines(j.what_i_read), /more than one line of business/);
  const s = steps(j);
  assert.equal(count(s, "capital markets are under constant strain"), 1, "the capital markets pain is used once");
  assert.ok(count(s, "customer experience management is the new battleground") <= 1, "the customer experience pain is used at most once");
  assert.doesNotMatch(flat(j), /[—–]/);
});

test("a services text with one line of business keeps the plain answer", async () => {
  const j = await call("gtm_consultation", { company_name: "Callbridge", industry: "ITeS", gtm_challenge: ONE, ...NUM });
  assert.doesNotMatch(lines(j.what_i_read), /more than one line of business/);
  assert.doesNotMatch(flat(j.sector_notes), /no objections/);
});

test("epic_audit and generate_roadmap give the same per line coverage; scores are not moved", async () => {
  const a = await call("epic_audit", { company_name: "Opsgrid", industry: "ITeS", challenge: MULTI, ...NUM });
  assert.match(lines(a.what_i_read), /more than one line of business/);
  assert.match(steps(a), /financial crime compliance/);
  const g = await call("gtm_consultation", { company_name: "Opsgrid", industry: "ITeS", gtm_challenge: MULTI, ...NUM });
  assert.deepEqual(a.scores, g.epic_scores);
  const r = await call("generate_roadmap", { primary_focus: "E", industry: "ITeS", company_name: "Opsgrid", product_description: "operations, data and customer experience services delivered with AI: customer experience, financial services operations, financial crime compliance and market intelligence, to large enterprises and financial institutions", acv_usd: 1000000, deal_cycle_days: 150, tam_accounts: 8000 });
  assert.match(steps(r), /financial services operations/);
});

test("a headline pain is cut where its clause ends, not inside a list of tools", async () => {
  const j = await call("epic_audit", { company_name: "Tracegrid", industry: "software", challenge: "Tracegrid sells an observability platform for engineering teams that run services in the cloud: logging, tracing and alerting. Our buyers' pain: organizations bought separate tools for performance monitoring, log analysis and incident response that did not share data, forcing engineers to correlate findings by hand across consoles. We want an EPIC view of our go-to-market.", acv_usd: 20000, deal_cycle_days: 45, nrr_percent: 110, tam_accounts: 5000 });
  const s = steps(j);
  assert.match(s, /answers "organizations bought separate tools for performance monitoring, log analysis and incident response that did not share data"/);
  assert.doesNotMatch(s, /for performance monitoring" first/);
});
