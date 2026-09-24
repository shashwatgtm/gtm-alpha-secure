// Tests for netlify/lib/epic-advanced.js against the documented rubric (epic-motion-diagnostic skill,
// GTM Alpha system reference section 1.1). Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEpic, stageRow } from "../netlify/lib/epic-advanced.js";

const full = { industry: "Software", acv_usd: 20000, deal_cycle_days: 45, nrr_percent: 110, tam_accounts: 3000, deal_source: "inbound", geography: "global" };

test("gold case from the docs resolves to E10 P5 I5 C5, Ecosystem leads", () => {
  const r = scoreEpic({ business_stage: "Series A", industry: "Legal tech", deal_cycle_days: 120, acv_usd: 42000, nrr_percent: 108, tam_accounts: 2500, self_serve: false, deal_source: "partnerships", geography: "India", gtm_challenge: "Sales cycle is too long, losing deals to incumbents who have analyst coverage" });
  assert.deepEqual(r.scores, { E: 10, P: 5, I: 5, C: 5 });
  assert.equal(r.primary.letter, "E");
  assert.equal(r.preliminary, false);
});

test("stage defaults follow the documented table", () => {
  const rows = { "Pre-seed": [3, 4, 5, 2], "Seed": [3, 4, 5, 2], "Series A": [5, 5, 6, 4], "Series B": [7, 5, 6, 6], "Series C": [8, 4, 5, 7], "Bootstrapped": [4, 5, 6, 3] };
  for (const [stage, v] of Object.entries(rows)) {
    const r = scoreEpic({ ...full, business_stage: stage });
    assert.deepEqual([r.scores.E, r.scores.P, r.scores.I, r.scores.C], v, stage);
  }
});

test("consultation form stage values map to the documented rows, so stage changes the scores", () => {
  const map = { "Pre-launch": "seed", "MVP": "seed", "Early Traction": "series_a", "Growth": "series_b", "Scale": "series_c", "Mature": "series_c" };
  for (const [v, row] of Object.entries(map)) assert.equal(stageRow(v), row, v);
  const seen = new Set(["Pre-launch", "Early Traction", "Growth", "Scale"].map((s) => JSON.stringify(scoreEpic({ ...full, business_stage: s }).scores)));
  assert.equal(seen.size, 4);
});

test("boundary values get no adjustment; values past them do", () => {
  const base = scoreEpic({ ...full, business_stage: "Series A" }).scores;
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", acv_usd: 50000 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", acv_usd: 5000 }).scores, base);
  assert.equal(scoreEpic({ ...full, business_stage: "Series A", acv_usd: 50001 }).scores.E, base.E + 2);
  assert.equal(scoreEpic({ ...full, business_stage: "Series A", acv_usd: 4999 }).scores.P, base.P + 2);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", deal_cycle_days: 90 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", deal_cycle_days: 14 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", nrr_percent: 100 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", nrr_percent: 120 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", tam_accounts: 500 }).scores, base);
  assert.deepEqual(scoreEpic({ ...full, business_stage: "Series A", tam_accounts: 10000 }).scores, base);
});

test("each adjustment matches the rubric", () => {
  const b = scoreEpic({ ...full, business_stage: "Series A" }).scores;
  const d = (x) => { const s = scoreEpic({ ...full, business_stage: "Series A", ...x }).scores; return { E: s.E - b.E, P: s.P - b.P, I: s.I - b.I, C: s.C - b.C }; };
  assert.deepEqual(d({ deal_cycle_days: 120 }), { E: 2, P: 0, I: -1, C: 0 });
  assert.deepEqual(d({ deal_cycle_days: 7 }), { E: -1, P: 2, I: 0, C: 0 });
  assert.deepEqual(d({ nrr_percent: 90 }), { E: 0, P: 0, I: -1, C: 2 });
  assert.deepEqual(d({ nrr_percent: 130 }), { E: 0, P: 1, I: 0, C: 1 });
  assert.deepEqual(d({ tam_accounts: 300 }), { E: 2, P: 0, I: -1, C: 0 });
  assert.deepEqual(d({ tam_accounts: 20000 }), { E: -1, P: 0, I: 2, C: 0 });
  assert.deepEqual(d({ self_serve: true }), { E: 0, P: 2, I: 0, C: 0 });
  assert.deepEqual(d({ deal_source: "referrals" }), { E: 0, P: 0, I: 0, C: 3 });
  assert.deepEqual(d({ deal_source: "outbound" }), { E: 0, P: 0, I: 2, C: 0 });
  assert.deepEqual(d({ deal_source: "partnerships" }), { E: 2, P: 0, I: 0, C: 0 });
  assert.deepEqual(d({ geography: "India" }), { E: 1, P: 0, I: 0, C: 1 });
  assert.deepEqual(d({ geography: "US" }), { E: 0, P: 0, I: 1, C: 0 });
  assert.deepEqual(d({ geography: "Middle East" }), { E: 2, P: 0, I: 0, C: 0 });
  assert.deepEqual(d({ geography: "APAC" }), { E: 1, P: 0, I: 0, C: 0 });
});

test("industry cap holds P at 4 even with self-serve and short cycles", () => {
  const r = scoreEpic({ ...full, business_stage: "Series A", industry: "Logistics", self_serve: true, deal_cycle_days: 7, acv_usd: 2000 });
  assert.equal(r.scores.P, 4);
});

test("bounds keep every score between 1 and 10", () => {
  const hi = scoreEpic({ business_stage: "Series C", industry: "x", acv_usd: 90000, deal_cycle_days: 200, tam_accounts: 100, deal_source: "partnerships", geography: "Middle East" });
  assert.equal(hi.scores.E, 10);
  const lo = scoreEpic({ business_stage: "Seed", industry: "x", acv_usd: 1000, deal_cycle_days: 5, tam_accounts: 20000, deal_source: "outbound", geography: "US" });
  for (const v of Object.values(lo.scores)) assert.ok(v >= 1 && v <= 10);
});

test("overrides: leaky bucket, AEO and GEO disruption, hybrid note", () => {
  const leaky = scoreEpic({ ...full, business_stage: "Series B", nrr_percent: 90, gtm_challenge: "We need more pipeline and new logos" });
  const plain = scoreEpic({ ...full, business_stage: "Series B", nrr_percent: 90, gtm_challenge: "Our messaging is unclear" });
  assert.equal(leaky.scores.I, plain.scores.I - 1);
  assert.ok(leaky.warnings.some((w) => /Fix retention first/.test(w)));
  const aeo = scoreEpic({ ...full, business_stage: "Series B", gtm_challenge: "Organic traffic is dropping because AI search answers the question" });
  const base = scoreEpic({ ...full, business_stage: "Series B" });
  assert.equal(aeo.scores.I, base.scores.I - 2);
  assert.equal(aeo.scores.C, base.scores.C + 2);
  const hybrid = scoreEpic({ ...full, business_stage: "Series B", self_serve: true, acv_usd: 60000, deal_cycle_days: 120, nrr_percent: 130, gtm_challenge: "We want to move upmarket to enterprise" });
  assert.ok(hybrid.warnings.some((w) => /Hybrid motion detected/.test(w)));
});

test("ties go E, then P, then C, then I", () => {
  const r = scoreEpic({ ...full, business_stage: "Series A", geography: "APAC", deal_source: "mixed" });
  assert.deepEqual(r.scores, { E: 6, P: 5, I: 6, C: 4 });
  assert.equal(r.primary.letter, "E");
});

test("missing inputs mark the result preliminary; never scored on the company name", () => {
  const r = scoreEpic({ gtm_challenge: "Help" });
  assert.equal(r.preliminary, true);
  assert.ok(r.skipped_adjustments.includes("ACV"));
  const a = scoreEpic({ ...full, business_stage: "Seed", company_name: "Acme" });
  const b = scoreEpic({ ...full, business_stage: "Seed", company_name: "Zeta" });
  assert.deepEqual(a.scores, b.scores);
});
