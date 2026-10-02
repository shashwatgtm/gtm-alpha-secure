// Run 19 R19-35 (owner decision D80): the GTM Alpha problems of the real-world test. Written before the fixes (B43); every
// test here failed on the production head 8a6d1829. Companies are the invented ones of the run 19 examples (rule B81).
// Run: node --test tests/run19-d80.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
let id = 1;
const call = async (name, args) => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }), {});
  const j = await r.json();
  return { isError: !!j.result.isError, text: j.result.content.map((c) => c.text).join("\n") };
};
const B75 = /\b(clinics?|patients?|hospitals?|healthcare|hipaa|ehr|appointments?|no-shows?|dental|physio\w*|ExampleCo|Acme Notes|ClinicFlow|legal tech)\b/i;

test("problem 1: no clinic word in the MCP tool code", () => {
  for (const f of ["../netlify/functions/mcp-sse.js", "../netlify/lib/epic-advanced.js", "../netlify/lib/verticals.js"]) {
    // The rubric's industry cap on P names "Healthcare IT" and the form's "Healthcare" option (a fixed rule and option label,
    // allowed by B75); those lines are not examples and are left out of this check.
    const text = readFileSync(new URL(f, import.meta.url), "utf8").split("\n").filter((l) => !/P_CAP_INDUSTRY|caps P at 4|"Healthcare" is included/.test(l)).join("\n");
    assert.doesNotMatch(text, B75, f);
  }
});

// Problem 4: a motion the inputs rule out never wins a tie. Answerloop-like input: self_serve false, P and I tie at 6.
test("epic_audit: with self_serve false, Product-Led Growth never wins a tie", async () => {
  const r = await call("epic_audit", { challenge: "We sell Answerloop, AI agents that resolve support tickets inside the help desk, to support leaders at consumer apps.",
    industry: "AI native", business_stage: "series-a", acv_usd: 20000, deal_cycle_days: 45, nrr_percent: 125, tam_accounts: 6000, self_serve: false, deal_source: "inbound", geography: "global" });
  const j = JSON.parse(r.text);
  assert.equal(j.scores.P, j.scores.I); // the scores themselves are unchanged
  assert.notEqual(j.primary.letter, "P");
  assert.match(j.notes.join(" "), /self-serve/i);
});

// Problems 3 and 8: the consultation gives the first steps for the lead motion and sector notes, not only scores.
test("gtm_consultation: first steps for the lead motion and sector notes for a telecom company", async () => {
  const r = await call("gtm_consultation", { company_name: "Branchwire (example company)", gtm_challenge: "Deals close only after a costly outage at the buyer, and procurement compares us line by line with the national operators.",
    business_stage: "series-b", industry: "Telecom: managed SD-WAN and business internet for companies with many branches", acv_usd: 240000, deal_cycle_days: 150 });
  const j = JSON.parse(r.text);
  assert.ok(Array.isArray(j.first_30_days) && j.first_30_days.length >= 3);
  assert.match(JSON.stringify(j.sector_notes || ""), /uptime|site|SD-WAN|CIO/i);
});

// Problem 4: no SaaS-only product-led steps for a services business
test("generate_roadmap: a services business gets no self-service trial or viral steps", async () => {
  const r = await call("generate_roadmap", { primary_focus: "P", timeframe: "90-day", business_model: "services" });
  const j = JSON.parse(r.text);
  const all = [...j.action_plan.immediate, ...j.action_plan.short_term, ...j.action_plan.medium_term].join(" | ");
  assert.doesNotMatch(all, /self-service trial|viral|freemium|in-app/i);
  assert.match(JSON.stringify(j), /services/i);
});

// Problem 8 on the scores tool: the company name given is repeated and the sector notes follow, the scores unchanged.
test("epic_audit: names the company given and adds sector notes for a telecom company", async () => {
  const args = { challenge: "We sell managed SD-WAN and business internet to companies with many branches; deals wait for an outage at the buyer.",
    industry: "Telecom: managed SD-WAN and business internet", business_stage: "series-b", acv_usd: 240000, deal_cycle_days: 150 };
  const plain = JSON.parse((await call("epic_audit", args)).text);
  const j = JSON.parse((await call("epic_audit", { ...args, company_name: "Branchwire (example company)" })).text);
  assert.equal(j.company, "Branchwire (example company)");
  assert.deepEqual(j.scores, plain.scores);
  assert.match(JSON.stringify(j.sector_notes || ""), /uptime|site|SD-WAN|CIO/i);
});

// The consultation's first steps label example counts the way the roadmap does ("top 50" is an example figure).
test("gtm_consultation: an example count in the first steps is labelled as an example figure", async () => {
  const j = JSON.parse((await call("gtm_consultation", { gtm_challenge: "We sell managed SD-WAN to enterprises with many branches.", industry: "Telecom", business_stage: "series-b", acv_usd: 240000, deal_cycle_days: 150, tam_accounts: 800 })).text);
  for (const t of j.first_30_days) if (/\btop \d+\b/.test(t)) assert.match(t, /Example figure: replace with your own/);
  assert.ok(j.first_30_days.some((t) => /\btop \d+\b/.test(t)), "the E steps include a top-N count");
});
