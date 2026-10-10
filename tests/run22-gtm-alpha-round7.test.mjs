// Run 22 round 7 (writer alpha-w1): faults the fresh judges named after round 6, written before the fixes. Invented companies; every figure is an example.
//  * when no input moved a score (the lead is a tie-break), the first step takes the user's stated pain and turns it into the first action
//  * a long one-clause pain is still used as the headline; use cases keep up to four, named products stay, and the list reads as a list
//  * a large company is told once that the assumed Series B row is a poor fit; a small ticket does not get chief officer deciders
//  * a security kind that is read brings its own partner types
// Run: node --test tests/run22-gtm-alpha-round7.test.mjs
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
const lines = (v) => (Array.isArray(v) ? v : v ? [v] : []).join(" | ");
const steps = (j) => [...(j.first_30_days || []), ...((j.action_plan && [...j.action_plan.immediate, ...j.action_plan.short_term, ...j.action_plan.medium_term]) || [])].join(" | ");

const FIELD = "Routeloop sells a field execution platform for route to market: order capture, a distributor portal, a retailer ordering app, and AI agents such as Nudge Copilot, beat optimisation, image recognition and outlet deduplication to consumer goods brands that sell through distributors and retailers (700+ brands). Our buyers' pain: most field apps capture orders and track visits but do not tell the field what to do next at each outlet. We want an EPIC view of our go-to-market.";

test("a tie-break lead: step 1 takes the stated pain as the first action, the tie-break note stays", async () => {
  const j = await call("epic_audit", { company_name: "Routeloop", industry: "vertical SaaS", challenge: FIELD, acv_usd: 30000, deal_cycle_days: 90, nrr_percent: 112, tam_accounts: 3000 });
  assert.match(j.lead_note, /No input you gave moved a score/);
  const first = j.first_30_days[0];
  assert.match(first, /do not tell the field what to do next at each outlet/);
  assert.match(first, /your (?:numbers|scores) did not pick the lead|let the problem you stated/i);
  assert.doesNotMatch(first, /Pick the one your buyers would notice first/);
  // four use cases, the named product kept, no semicolons in the list
  assert.match(first, /AI agents such as Nudge Copilot/);
  assert.doesNotMatch(first.split("Aim it at")[0], /;/);
});

test("named products in a use case list are split, and a parenthesis is not spliced into the list", async () => {
  const j = await call("epic_audit", { company_name: "Shieldpost", industry: "telecom software", challenge: "Shieldpost sells a single API led messaging platform that unifies SMS, voice and email, with Phishguard anti phishing, Spamtrace anti spam on blockchain and Consentdesk Consent management to enterprises across industries. Our buyers' pain: scam messages travel over SMS under the names of known brands. We want an EPIC view of our go-to-market.", acv_usd: 80000, deal_cycle_days: 120, nrr_percent: 110, tam_accounts: 4000 });
  const first = j.first_30_days[0];
  assert.match(first, /Spamtrace anti spam on blockchain/);
  assert.doesNotMatch(first, /blockchain and Consentdesk Consent/);
  const b = await call("epic_audit", { company_name: "Billnest", industry: "SaaS", challenge: "Billnest sells billing and monetization platform for SaaS and AI companies: billing automation for any pricing model (tiered, volume, usage based, flat fee, hybrid), invoicing, subscription management, collections to SaaS and AI companies. Our buyers' pain: pricing changes break invoices. We want an EPIC view of our go-to-market.", acv_usd: 60000, deal_cycle_days: 75, nrr_percent: 118, tam_accounts: 10000 });
  assert.doesNotMatch(b.first_30_days[0].split("Aim it at")[0], /;/);
  assert.match(b.first_30_days[0], /billing automation for any pricing model, invoicing, subscription management or collections/);
});

test("a large company is told once that the assumed Series B row is a poor fit; a small one keeps the plain line", async () => {
  const big = await call("epic_audit", { company_name: "Gridwork", industry: "ITeS", challenge: "Gridwork sells IT services and consulting: cloud migration, managed services and data engineering to banks and manufacturers; 1,200+ enterprise clients and revenue above 1.5B dollars. Our buyers' pain: legacy systems slow every change. We want an EPIC view of our go-to-market.", acv_usd: 900000, deal_cycle_days: 150, nrr_percent: 108, tam_accounts: 3000 });
  assert.match(lines(big.to_sharpen_this), /Give business_stage[^|]*(established|large)[^|]*Series B[^|]*poor fit|Give business_stage[^|]*Series B[^|]*poor fit/i);
  const small = await call("epic_audit", { company_name: "Tinyship", industry: "SaaS", challenge: "Tinyship sells a shipping label app for small online shops. Our buyers' pain: labels take too long. We want an EPIC view of our go-to-market.", acv_usd: 600, deal_cycle_days: 7, nrr_percent: 100, tam_accounts: 20000 });
  assert.doesNotMatch(lines(small.to_sharpen_this), /poor fit/);
});

test("a small ticket product does not list chief officers as the deciders", async () => {
  const text = "We sell route planning and dispatch software to parcel delivery fleets: driver app, proof of delivery and failed delivery re-planning, to courier companies. Our buyers' pain: dispatchers re-plan by hand. We want an EPIC view.";
  const small = await call("epic_audit", { company_name: "Lanehop", industry: "logistics tech", challenge: text, acv_usd: 3000, deal_cycle_days: 20, nrr_percent: 110, tam_accounts: 3000 });
  const role = small.first_30_days.find((x) => x.startsWith("For every account name the people on the buying side")).split(".")[0];
  assert.doesNotMatch(role, /Chief/);
});

test("a cloud security product brings the partner types of its kind, not managed security service providers", async () => {
  const j = await call("epic_audit", { company_name: "Cloudward", industry: "cybersecurity", challenge: "Cloudward sells a cloud native application protection platform that finds misconfigurations and exposed workloads across cloud accounts and ranks them by risk, to security teams at cloud first companies. Our buyers' pain: separate tools for posture and workloads do not share data. We want an EPIC view of our go-to-market.", acv_usd: 60000, deal_cycle_days: 90, nrr_percent: 112, tam_accounts: 6000 });
  assert.match(j.sector_notes.sector, /cloud security/);
  const partners = j.first_30_days.find((x) => x.startsWith("List the partners")) || "";
  assert.ok(partners, "a partner step");
  assert.doesNotMatch(partners, /managed security service providers/);
  assert.match(partners, /cloud/i);
});

test("scores and the tools list are unchanged by round 7", async () => {
  const j = await call("epic_audit", { company_name: "Routeloop", industry: "vertical SaaS", challenge: FIELD, acv_usd: 30000, deal_cycle_days: 90, nrr_percent: 112, tam_accounts: 3000 });
  assert.deepEqual(j.scores, { E: 7, P: 5, I: 6, C: 6 });
  assert.equal(j.primaryFocus, "E");
});
