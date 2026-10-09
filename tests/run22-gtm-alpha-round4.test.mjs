// Run 22 round 4 (writer alpha-w1): faults the fresh judges named after round 3, written before the fixes. Companies are invented (rule B81);
// every figure is an example. Run: node --test tests/run22-gtm-alpha-round4.test.mjs
//  1. a small-ticket, huge-base product (ACV 600, 5,000,000 accounts): no role by role outbound list, the owner decides, the stated pain and the small-versus-large split are used
//  2. a payments platform with a very wide market: founders and finance heads for the small end, self_serve raised, no CTO list across 500,000 accounts
//  3. a payment gateway: "payouts to local bank accounts" is not a buyer, a comma list of adjectives is one use case, MENA is not just the Middle East, first value and expansion fit a payment business
//  4. a data platform with developer, student, startup credit and enterprise buyers: the text names the product-led end, no "each of 300,000 accounts is worth its own plan", no developer tooling measures
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
const prose = (j) => (j.consultation_output || flat(j)).replace(/^Challenge: .*$/m, "");

const SHOP = "We sell retail ERP and POS software for shops, restaurants and distributors: billing, stock, purchase and accounting, available on premise or in the cloud, to shop owners and single stores up to multi-outlet chains; the Starter, Standard and Professional editions suit businesses with fewer than five billing counters, and multi-chain businesses get an Enterprise quote. Our buyers' pain: paper registers and slow billing at the counter; stock and accounts never tie out. We want help choosing our go-to-market motion.";
const PAYS = "We sell a payments platform: accept online payments with many methods, make payouts, and run payroll and credit, to businesses of every size in India that accept and disburse payments: startups, D2C brands, education, freelancers and large enterprises. Our buyers' pain: high cart abandonment and return to origin rates for D2C brands; slow vendor payouts. We want help choosing our go-to-market motion.";
const GATE = "an online payment gateway for businesses in MENA: one setup for local, regional and global payment methods with hosted checkout, a unified API, refunds, subscription payments and payouts to local bank accounts, run from the Payhive dashboard";
const DATA = "Streamdock sells a managed data platform: Kafka, PostgreSQL and ClickHouse on any cloud, to developers and engineering teams who want production data services without the operations work: solo developers and students, startups (eligible startups can receive credits for a year), scale-ups and enterprises. Our buyers' pain: running data services means constant patching, scaling and failures. We want an EPIC view of our go-to-market.";

test("a small-ticket product across millions of accounts: no role by role list, the owner decides, the pain and the tier split are used", async () => {
  const j = await call("gtm_consultation", { company_name: "Shelfpilot", industry: "vertical SaaS", gtm_challenge: SHOP, acv_usd: 600, deal_cycle_days: 14, nrr_percent: 100, tam_accounts: 5000000 });
  const t = prose(j);
  assert.doesNotMatch(t, /Build the outbound list by role/);
  assert.ok(j.scale_note, "a scale_note field");
  assert.match(j.scale_note, /5,000,000/);
  assert.match(j.scale_note, /owner/i);
  assert.match(j.scale_note, /self_serve/);
  assert.ok(t.includes(j.scale_note));
  assert.match(t, /paper registers|slow billing/);
  assert.ok(j.tier_note, "a tier_note field");
  assert.match(j.tier_note, /fewer than five billing counters/);
  assert.match(j.tier_note, /Enterprise/);
  assert.match(j.tier_note, /once for each|for each tier|per tier/i);
  assert.match(flat(j.sector_notes), /billing counter|stock/);
  assert.deepEqual(j.epic_scores, { E: 5, P: 7, I: 8, C: 6 }, "scores come from the rubric, unchanged");
});

test("a payments platform with a very wide market: founders and finance heads for the small end, self_serve raised, no CTO list across 500,000 accounts", async () => {
  const j = await call("gtm_consultation", { company_name: "Paywharf", industry: "fintech", gtm_challenge: PAYS, acv_usd: 30000, deal_cycle_days: 45, nrr_percent: 115, tam_accounts: 500000 });
  const t = prose(j);
  assert.doesNotMatch(t, /Build the outbound list by role \(Chief Technology Officer/);
  assert.ok(j.scale_note);
  assert.match(j.scale_note, /500,000/);
  assert.match(j.scale_note, /founder|owner/i);
  assert.match(j.scale_note, /finance/i);
  assert.match(j.scale_note, /self_serve/);
  assert.match(lines(j.to_sharpen_this), /Give self_serve/);
  assert.match(t, /cart abandonment/);
  const a = await call("epic_audit", { company_name: "Paywharf", industry: "fintech", challenge: PAYS, acv_usd: 30000, deal_cycle_days: 45, nrr_percent: 115, tam_accounts: 500000 });
  assert.deepEqual(a.scores, j.epic_scores);
});

test("a payment gateway roadmap: payouts to bank accounts are not the buyers, the use case list is whole, MENA is named as such, and first value and growth fit a payment business", async () => {
  const j = await call("generate_roadmap", { primary_focus: "P", timeframe: "90-day", industry: "fintech", company_name: "Payhive", product_description: GATE, acv_usd: 24000, deal_cycle_days: 45, tam_accounts: 500000, nrr_percent: 115 });
  const read = lines(j.what_i_read);
  assert.doesNotMatch(flat(j), /bank accounts, run from|Aim it at local bank accounts|Buyers: local bank accounts/);
  assert.match(read, /Buyers: businesses in MENA/);
  assert.match(read, /one setup for local, regional and global payment methods with hosted checkout/);
  assert.match(read, /Geography: the text says the Middle East and North Africa/);
  const s = steps(j);
  assert.doesNotMatch(s, /bring in a teammate|second user|invitations inside accounts/i);
  assert.match(s, /first (?:real|live) (?:payment|transaction)/i);
  assert.match(s, /second (?:live )?payment method/i);
  const e = await call("generate_roadmap", { primary_focus: "E", timeframe: "90-day", industry: "fintech", company_name: "Payhive", product_description: GATE, acv_usd: 24000, deal_cycle_days: 45, tam_accounts: 500000, nrr_percent: 115 });
  assert.doesNotMatch(flat(e), /local bank accounts, run from|Aim it at local bank accounts/);
});

test("a data platform with solo developers, students, startup credits and enterprises: the text names the product-led end, and no account list claims every account is worth its own plan", async () => {
  for (const [tool, args] of [["epic_audit", { company_name: "Streamdock", industry: "software", challenge: DATA, acv_usd: 60000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 300000 }], ["gtm_consultation", { company_name: "Streamdock", industry: "software", gtm_challenge: DATA, acv_usd: 60000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 300000 }]]) {
    const j = await call(tool, args);
    assert.doesNotMatch(prose(j), /each account is worth its own researched plan/, tool);
    assert.ok(j.adoption_note, tool + ": an adoption_note field");
    assert.match(j.adoption_note, /solo developers/);
    assert.match(j.adoption_note, /credits/);
    assert.match(j.adoption_note, /self_serve/);
    assert.match(j.adoption_note, /Product-Led/);
    assert.doesNotMatch(flat(j.sector_notes), /release frequency|build time|flaky|per user cost|Per user cost/i, tool);
    assert.match(flat(j.sector_notes), /managed data infrastructure/i, tool);
    assert.match(steps(j), /best-scoring accounts|first batch/, tool);
  }
});

test("a developer adopted product: the channel step counts sign-ups and the meetings that followed, not meetings with the signers alone", async () => {
  const text = "We sell an API workspace for designing, testing and documenting APIs to API teams and developers at 400,000 companies. Our buyers' pain: specs, tests and docs drift apart. We want help choosing our go-to-market motion.";
  const j = await call("gtm_consultation", { company_name: "Specbridge", industry: "software", gtm_challenge: text, acv_usd: 30000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 20000 });
  assert.match(j.first_30_days.join(" | "), /sign-ups|developers each channel brought|activated/i);
});

test("scores and tools/list are unchanged", async () => {
  const j = await call("epic_audit", { company_name: "Streamdock", industry: "software", challenge: DATA, acv_usd: 60000, deal_cycle_days: 60, nrr_percent: 120, tam_accounts: 300000 });
  assert.deepEqual(j.scores, { E: 8, P: 4, I: 8, C: 6 });
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 9999, method: "tools/list", params: {} }) }), {});
  const { createHash } = await import("node:crypto");
  assert.equal(createHash("sha256").update(JSON.stringify((await r.json()).result.tools)).digest("hex").slice(0, 12), "ea2cc9aa4d69");
});
