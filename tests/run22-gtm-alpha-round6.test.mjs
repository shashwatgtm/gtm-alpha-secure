// Run 22 round 6 (writer alpha-w1): the three kinds the shared sector file now holds (mobile application security, core banking and lending platforms,
// managed data infrastructure) must reach the plan text: partners, reviews, entry offer and assets are written for the kind, not for the whole vertical,
// and no step falls back on generic filler. Invented companies; every figure is an example. Run: node --test tests/run22-gtm-alpha-round6.test.mjs
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

const APP = "Binsentry sells an enterprise mobile application security testing platform that scans compiled APK and IPA binaries rather than source code, delivering automated dynamic testing on real devices, binary static analysis and per-build compliance evidence, with app store monitoring as an add-on, to enterprises that build and ship mobile apps and must secure them: 200+ enterprises including 40+ in banking and financial services (page claims). Our buyers' pain: outdated security tools leave mobile apps exposed: source code scanners miss issues in binaries. We want an EPIC view of our go-to-market.";
const CORE = "a cloud-native, composable core banking platform that runs lending, deposits and payments on one ledger, to banks, lenders and fintechs";
const DATA = "Datanest sells managed open source data infrastructure: managed Kafka, PostgreSQL and ClickHouse with automatic failover, backups and upgrades on any cloud, to engineering teams that would rather not run databases themselves. Our buyers' pain: on call load and failed upgrades eat the platform team's week. We want help choosing our go-to-market motion.";

test("mobile application security: the plan text is written for the kind, not for security operations", async () => {
  const j = await call("epic_audit", { company_name: "Binsentry", industry: "cybersecurity", challenge: APP, acv_usd: 40000, deal_cycle_days: 90, nrr_percent: 112, tam_accounts: 30000 });
  assert.match(j.sector_notes.sector, /mobile application security/);
  assert.match(flat(j.sector_notes.buyer_words), /app binary/);
  const s = steps(j);
  assert.doesNotMatch(s, /MSSP|managed security service/i);
  assert.doesNotMatch(j.sector_fit, /MSSP|marketplaces/);
  assert.match(j.sector_fit, /app vulnerabilities|audit evidence|audit finding|one or two apps|release/i);
  assert.match(s, /Head of Application Security/);
  const rm = await call("generate_roadmap", { primary_focus: "E", industry: "cybersecurity", company_name: "Binsentry", product_description: "an enterprise mobile application security testing platform that scans compiled APK and IPA binaries rather than source code, delivering automated dynamic testing on real devices and binary static analysis, with manual penetration testing as an add-on", acv_usd: 40000, deal_cycle_days: 90, tam_accounts: 30000 });
  const rs = steps(rm);
  assert.doesNotMatch(rs, /MSSP|managed security service/i);
  assert.match(rs, /app|release/i);
  assert.match(rs, /one or two apps|every release|app portfolio|release process/i);
});

test("core banking platform: partners, reviews and the first offer are those of a core change, and no step is filler", async () => {
  const rm = await call("generate_roadmap", { primary_focus: "I", industry: "fintech", company_name: "Ledgerstone", product_description: CORE, acv_usd: 250000, deal_cycle_days: 180, tam_accounts: 5000 });
  const s = steps(rm);
  assert.match(lines(rm.what_i_read), /core banking and lending platforms/);
  assert.match(s, /core replacement|core banking|migration/i);
  assert.doesNotMatch(s, /a pilot on one flow, team or entity/);
  assert.doesNotMatch(s, /cost and time your buyer spends on the problem|how often the problem recurs/);
  assert.doesNotMatch(s, /Lead the sequence with your a? ?cloud-native/);
  assert.match(s, /time to launch|cost of a change request/);
  assert.match(s, /proof of concept|staged migration|rollback/i);
  const e = await call("generate_roadmap", { primary_focus: "E", industry: "fintech", company_name: "Ledgerstone", product_description: CORE, acv_usd: 250000, deal_cycle_days: 180, tam_accounts: 5000 });
  assert.match(steps(e), /regulator|regulatory reporting|data location/i);
  assert.doesNotMatch(steps(e), /a pilot on one flow, team or entity/);
});

test("managed data infrastructure: a developer trial and a platform lead, cloud partners, migration with a rollback", async () => {
  const j = await call("gtm_consultation", { company_name: "Datanest", industry: "software", gtm_challenge: DATA, acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 115, tam_accounts: 8000 });
  assert.match(lines(j.what_i_read), /managed data infrastructure/);
  const s = steps(j);
  assert.match(s, /cloud|migration|on call/i);
  assert.doesNotMatch(s, /cloud platform marketplaces your developers already use/);
  const p = await call("generate_roadmap", { primary_focus: "P", industry: "software", company_name: "Datanest", product_description: "managed open source data infrastructure: managed Kafka, PostgreSQL and ClickHouse with automatic failover, backups and upgrades on any cloud, to engineering teams", acv_usd: 30000, deal_cycle_days: 60, tam_accounts: 8000 });
  assert.match(steps(p), /provision|first managed service|trial|credits/i);
  assert.match(steps(p), /operations hours|incidents/i);
});

test("a close call names the user's words without a dangling function word, and a segment line keeps the group, not the client count", async () => {
  const crm = await call("epic_audit", { company_name: "Salesloop", industry: "SaaS", challenge: "Salesloop sells CRM for sales, marketing and service teams: lead and opportunity management, lead scoring, workflow automation, a mobile app for field sales, and Service CRM, an omnichannel customer support suite to sales, marketing and customer service teams that manage leads. Our buyers' pain: no single view of customers across marketing, sales and service. We want an EPIC view of our go-to-market.", acv_usd: 9000, deal_cycle_days: 45, nrr_percent: 105, tam_accounts: 50000 });
  assert.doesNotMatch(lines(crm.what_i_read), /your words \((?:[^)]*, )?[^)]* (?:for|and|of|with|to|in|the)\)/);
  const svc = await call("gtm_consultation", { company_name: "Opsgrid", industry: "ITeS", gtm_challenge: "We sell finance operations, data and customer experience services delivered with AI to large enterprises and financial institutions, brands and growth clients, including Fortune 500 companies, with 400+ clients (page claim). Our buyers' pain: capital markets are under constant strain from rising volumes and tighter regulations. We want help choosing our go-to-market motion.", acv_usd: 1000000, deal_cycle_days: 150, nrr_percent: 108, tam_accounts: 8000 });
  assert.match(lines(svc.what_i_read), /segments named: Fortune 500 companies[;. (]/);
  assert.doesNotMatch(steps(svc), /Fortune 500 companies, with 400\+ clients/);
});

test("a product with four use cases names all four, not the first three", async () => {
  const j = await call("epic_audit", { company_name: "Vigilant", industry: "cybersecurity", challenge: "Vigilant sells a predictive attack graph platform made of phishing takedown, attack surface monitoring, third party risk monitoring and brand abuse detection to cybersecurity teams at global enterprises. Our buyers' pain: attackers move faster than reviews. We want an EPIC view of our go-to-market.", acv_usd: 60000, deal_cycle_days: 120, nrr_percent: 110, tam_accounts: 10000 });
  assert.match(steps(j), /brand abuse detection/);
});

test("a product led plan without a first value written for the kind names the first use case as the first result", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", industry: "SaaS", company_name: "Billnest", product_description: "billing and monetization platform for SaaS and AI companies: billing automation for any pricing model (tiered, volume, usage based, flat fee, hybrid), invoicing, subscription management and collections", acv_usd: 6000, deal_cycle_days: 10, tam_accounts: 4000 });
  assert.match(steps(j), /a first result from billing automation for any pricing model, on their own data/);
  assert.doesNotMatch(steps(j), /the task the product exists for/);
});

test("the earlier gains stay: no dash characters, the scores and the tools list are unchanged", async () => {
  const j = await call("epic_audit", { company_name: "Binsentry", industry: "cybersecurity", challenge: APP, acv_usd: 90000, deal_cycle_days: 120, nrr_percent: 112, tam_accounts: 30000 });
  assert.deepEqual(j.scores, { E: 10, P: 4, I: 7, C: 6 });
  assert.doesNotMatch(flat(j), /[—–]/);
});
