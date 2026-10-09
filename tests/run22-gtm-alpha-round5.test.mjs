// Run 22 round 5 (writer alpha-w1): faults the fresh judges named after round 4, written before the fixes. Companies are invented (rule B81);
// every figure is an example. Run: node --test tests/run22-gtm-alpha-round5.test.mjs
//  (a) a coarse sector with a narrower product kind: the user's own nouns become the vocabulary, and the answer says the sector file has no notes for this kind
//  (b) customer groups named in the text (banking, financial services, Fortune 500) are kept as the buyer segment
//  (c) the headline pain is the one tied to the product's core nouns, not an add-on mentioned later
//  plus: junior roles out of a large deal's role list, a plain warning when community leads a large long-cycle deal, no pasted parenthesis in a first-value sentence
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

const BIN = "Binsentry sells an enterprise mobile application security testing platform that scans compiled APK and IPA binaries rather than source code, delivering automated dynamic testing on real devices, binary static analysis and per-build compliance evidence, with app store monitoring as an add-on, to enterprises that build and ship mobile apps and must secure them: 200+ enterprises including 40+ in banking and financial services and 8+ Fortune 500 companies (page claims). Our buyers' pain: outdated security tools leave mobile apps exposed: source code scanners miss issues in binaries and third party components, separate tools slow workflows, and excessive false positives waste security teams' time; fake apps and unauthorized versions in app stores go unnoticed. We want an EPIC view of our go-to-market.";
const NET = "Threadnet sells a predictive attack graph platform made of attack surface monitoring, third party risk monitoring and threat intelligence to cybersecurity teams at global enterprises and Fortune 500 companies; more than 1,000 teams use it (page claim). Our buyers' pain: attackers chain identities and exposure into attack paths, while most tools hand security teams thousands of isolated findings. We want an EPIC view of our go-to-market.";
const NUM = { acv_usd: 90000, deal_cycle_days: 120, nrr_percent: 112, tam_accounts: 30000 };

test("(a)(b)(c) a mobile app binary scanner: the headline pain is the core one, the vocabulary is the user's own, banking and Fortune 500 customers are kept", async () => {
  const j = await call("epic_audit", { company_name: "Binsentry", industry: "cybersecurity", challenge: BIN, ...NUM });
  const s = steps(j);
  assert.match(s, /(?:starting from|answers) "(?:outdated security tools leave mobile apps exposed|source code scanners miss issues in binaries[^"]*)"/);
  assert.doesNotMatch(s, /(?:starting from|answers) "fake apps/);
  assert.doesNotMatch(flat(j.sector_notes), /attack surface|alert fatigue|mean time to detect|mean time to respond|least privilege/i);
  assert.match(flat(j.sector_notes.buyer_words), /APK|IPA|binar/i);
  assert.match(j.sector_notes.read_as, /no notes for/i);
  assert.match(lines(j.what_i_read), /Buyers: enterprises[^|]*banking and financial services/);
  assert.match(lines(j.what_i_read), /Fortune 500/);
  assert.match(s, /banking and financial services/);
  assert.doesNotMatch(s, /attack surface, exposure|mean time to detect/);
  assert.equal(j.sector_notes.sector, "cybersecurity");
});

test("(b) cybersecurity teams at global enterprises and Fortune 500 companies: the customer groups are kept", async () => {
  const j = await call("gtm_consultation", { company_name: "Threadnet", industry: "cybersecurity", gtm_challenge: NET, ...NUM });
  assert.match(lines(j.what_i_read), /Buyers: cybersecurity teams[^|]*(?:global enterprises and Fortune 500 companies)/);
  assert.match(j.first_30_days.join(" | "), /global enterprises and Fortune 500 companies/);
});

test("a large deal's role list leaves out manager level titles; a small deal keeps them", async () => {
  const text = "We sell route planning and dispatch software to parcel delivery fleets: driver app, proof of delivery and failed delivery re-planning, to courier companies. Our buyers' pain: dispatchers re-plan by hand. We want an EPIC view.";
  const big = await call("epic_audit", { company_name: "Lanehop", industry: "logistics tech", challenge: text, acv_usd: 250000, deal_cycle_days: 150, nrr_percent: 110, tam_accounts: 3000 });
  const role = big.first_30_days.find((x) => x.startsWith("For every account name the people on the buying side"));
  assert.doesNotMatch(role.split(".")[0], /Operations Manager|Fleet Manager|Planning Manager/);
  const small = await call("epic_audit", { company_name: "Lanehop", industry: "logistics tech", challenge: text, acv_usd: 8000, deal_cycle_days: 30, nrr_percent: 110, tam_accounts: 3000 });
  assert.ok(small.first_30_days.some((x) => /Manager/.test(x.split(".")[0])), "a small deal keeps manager level roles");
});

test("Community-Led asked for a 250,000 dollar 180 day deal gets a plain warning", async () => {
  const j = await call("generate_roadmap", { primary_focus: "C", industry: "fintech", company_name: "Ledgerstone", product_description: "a cloud-native core banking platform that runs lending, deposits and payments on one ledger, with implementation services, to banks, lenders and fintechs", acv_usd: 250000, deal_cycle_days: 180, tam_accounts: 5000 });
  assert.ok(j.read_this_first, "a note first");
  assert.match(j.read_this_first, /community/i);
  assert.match(j.read_this_first, /250,000/);
  assert.match(j.read_this_first, /180-day/);
  assert.match(j.read_this_first, /gtm_consultation/);
});

test("a first-value sentence does not paste a long parenthesised use case", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", industry: "SaaS", company_name: "Billnest", product_description: "billing and monetization platform for SaaS and AI companies: billing automation for any pricing model (tiered, volume, usage based, flat fee, hybrid), invoicing, subscription management, quoting, revenue recognition and collections", acv_usd: 6000, deal_cycle_days: 10, tam_accounts: 4000 });
  assert.doesNotMatch(steps(j), /it comes from [^.]*\(/);
  assert.match(steps(j), /first moment of value/);
});

test("a roadmap for the scanner reads the delivered features as uses and leaves the add-ons out", async () => {
  const j = await call("generate_roadmap", { primary_focus: "E", industry: "cybersecurity", company_name: "Binsentry", product_description: "an enterprise mobile application security testing platform that scans compiled APK and IPA binaries rather than source code, delivering automated dynamic testing on real devices, binary static analysis and per-build compliance evidence, with manual penetration testing, app store monitoring and an SBOM export as add-ons", acv_usd: 40000, deal_cycle_days: 90, tam_accounts: 30000 });
  assert.match(lines(j.what_i_read), /use cases named: automated dynamic testing on real devices/);
  assert.doesNotMatch(lines(j.what_i_read), /use cases named:[^|]*add-ons/);
  assert.doesNotMatch(steps(j), /decide which use case leads:[^.]*add-ons/);
  assert.match(lines(j.what_i_read), /no notes for/);
});

test("banks as buyers: the technology, risk and compliance roles lead; a small fintech buyer keeps the owner roles", async () => {
  const bank = await call("gtm_consultation", { company_name: "Ledgerstone", industry: "fintech", gtm_challenge: "We sell a cloud-native core banking platform that runs lending, deposits and payments on one ledger, with implementation services, to banks, lenders and fintechs. We want more qualified pipeline from banks.", acv_usd: 250000, deal_cycle_days: 180, nrr_percent: 110, tam_accounts: 5000 });
  const role = bank.first_30_days.find((x) => x.startsWith("For every account name the people on the buying side")).split(".")[0];
  assert.doesNotMatch(role, /Chief Executive Officer|Head of Product/);
  assert.match(role, /Chief Technology Officer/);
  assert.doesNotMatch(lines(bank.what_i_read), /use cases named:[^|]*implementation services/);
  const small = await call("gtm_consultation", { company_name: "Paynest", industry: "fintech", gtm_challenge: "We sell a payout app for small online shops, so owners can pay suppliers in one tap. We want more qualified pipeline from shop owners.", acv_usd: 6000, deal_cycle_days: 30, nrr_percent: 100, tam_accounts: 20000 });
  assert.ok(small.first_30_days.join(" | ").length > 100);
});

test("a long first pain clause is cut at its last comma, not replaced by a later side issue", async () => {
  const j = await call("epic_audit", { company_name: "Textguard", industry: "telecom software", challenge: "We sell a messaging platform that unifies SMS, voice and email, with a spam filter, to enterprises across industries. Our buyers' pain: scam messages travel over SMS under the names of known brands, victims rarely report them, and rule based filters are slow to adapt; enterprises also have to manage many separate channels and partners. We want help choosing our go-to-market motion.", acv_usd: 50000, deal_cycle_days: 90, nrr_percent: 110, tam_accounts: 4000 });
  assert.match(steps(j), /"scam messages travel over SMS under the names of known brands, victims rarely report them"/);
  assert.doesNotMatch(steps(j), /"enterprises also have to manage/);
});

test("scores and tools/list are unchanged", async () => {
  const j = await call("epic_audit", { company_name: "Binsentry", industry: "cybersecurity", challenge: BIN, ...NUM });
  assert.deepEqual(j.scores, { E: 10, P: 4, I: 7, C: 6 });
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 9999, method: "tools/list", params: {} }) }), {});
  const { createHash } = await import("node:crypto");
  assert.equal(createHash("sha256").update(JSON.stringify((await r.json()).result.tools)).digest("hex").slice(0, 12), "ea2cc9aa4d69");
});
