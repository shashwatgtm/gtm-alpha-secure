// Tests for netlify/lib/epic-advanced.js against the documented rubric (epic-motion-diagnostic skill,
// GTM Alpha system reference section 1.1). Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEpic, stageRow } from "../netlify/lib/epic-advanced.js";
import { exampleAnswers } from "../scripts/build-sample-report.mjs";

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

// Run 14 D31a: reasonFor used to list only the rules that raised a motion's score, so a rule that raised it and a
// later rule that cut it (for example "TAM above 10,000 accounts (E -1)" followed by "India B2B (E +1)") left the cut
// out, and "starting point 7; India B2B (E +1)" read as 8 while the motion scored 7. It must now list every
// adjustment after the starting point, raises and cuts alike, in the order applied, including the 1 to 10 clamp in
// plain words, and the parts must always add up to the printed score. checkReason re-parses the printed sentence
// (not the internal `applied` array) so it proves what actually prints, for the sample answers and 5 other inputs:
// one that reproduces the reported bug (a raise and a cut on the same motion, cancelling out), the docs' gold case
// (a cut applies, buried in a rich set of adjustments), one that clamps a motion at 10 (the top of the scale, in a
// printed reason), one that clamps a motion at 1 (the bottom of the scale, confirmed in adjustments_applied), and
// one with no recognised inputs at all (every reason ends "no further adjustment changed it").
function checkReason(reason, letter, expectedFinal) {
  const scoreM = reason.match(/scores (-?\d+) of 10:/);
  assert.ok(scoreM, reason);
  assert.equal(Number(scoreM[1]), expectedFinal, reason);
  const spIdx = reason.indexOf("starting point ");
  assert.ok(spIdx >= 0, reason);
  const rest = reason.slice(spIdx + "starting point ".length);
  const numM = rest.match(/^(-?\d+)/);
  assert.ok(numM, reason);
  let running = Number(numM[1]);
  let tail = rest.slice(numM[1].length);
  assert.ok(tail.endsWith("."), reason);
  tail = tail.slice(0, -1);
  if (tail === "; no further adjustment changed it") {
    // nothing after the starting point changed this motion's score
  } else {
    assert.ok(tail.startsWith("; "), reason);
    for (const seg of tail.slice(2).split("; ")) {
      const clampM = seg.match(/^held at (\d+), the (top|bottom) of the scale$/);
      if (clampM) {
        running = Number(clampM[1]);
        assert.equal(clampM[2], running === 10 ? "top" : "bottom", seg);
        continue;
      }
      const partM = seg.match(/\(([A-Z]) ([+-]\d+)\)$/);
      assert.ok(partM, "unrecognised reason segment: " + seg);
      assert.equal(partM[1], letter, seg);
      running += Number(partM[2]);
    }
  }
  assert.equal(running, expectedFinal, reason);
}

test("D31a: the reason line lists every adjustment (raises and cuts) and the clamp, and always adds up to the printed score", () => {
  const cases = {
    sample: exampleAnswers(),
    bug_repro: { business_stage: "Series B", industry: "Software", geography: "India", tam_accounts: 20000 },
    gold: { business_stage: "Series A", industry: "Legal tech", deal_cycle_days: 120, acv_usd: 42000, nrr_percent: 108, tam_accounts: 2500, self_serve: false, deal_source: "partnerships", geography: "India", gtm_challenge: "Sales cycle is too long, losing deals to incumbents who have analyst coverage" },
    clamps_at_10: { business_stage: "Series C", industry: "x", acv_usd: 90000, deal_cycle_days: 200, tam_accounts: 100, deal_source: "partnerships", geography: "Middle East" },
    clamps_at_1: { business_stage: "Seed", industry: "x", acv_usd: 1000, deal_cycle_days: 5, tam_accounts: 20000, deal_source: "outbound", geography: "US" },
    no_inputs: { gtm_challenge: "Help" }
  };
  for (const [label, input] of Object.entries(cases)) {
    const r = scoreEpic(input);
    checkReason(r.primary.reason, r.primary.letter, r.scores[r.primary.letter]);
    checkReason(r.secondary.reason, r.secondary.letter, r.scores[r.secondary.letter]);
  }
  // The reported bug, reproduced and fixed: E is raised by India B2B and cut by TAM above 10,000 accounts; both now
  // print, in the order applied, and cancel out to the starting point.
  const bug = scoreEpic(cases.bug_repro);
  assert.equal(bug.secondary.letter, "E");
  assert.equal(bug.scores.E, 7);
  assert.match(bug.secondary.reason, /TAM above 10,000 accounts \(E -1\); India B2B \(E \+1\)\.$/);
  // Clamped at 10 (top of the scale), visible in the printed primary reason.
  const hi = scoreEpic(cases.clamps_at_10);
  assert.equal(hi.primary.letter, "E");
  assert.equal(hi.scores.E, 10);
  assert.match(hi.primary.reason, /held at 10, the top of the scale\.$/);
  // Clamped at 1 (bottom of the scale): E is driven below 1 and held there. E is not one of this input's top two
  // motions here (the same rules that cut a motion this hard also lift another one above it), so this reason line
  // is not printed for this case; the score itself still proves the clamp held (E never goes below 1).
  const lo = scoreEpic(cases.clamps_at_1);
  assert.equal(lo.scores.E, 1);
  // adjustments_applied (the browser report's "why these scores" list, read by netlify/lib/analyze.js) is untouched
  // by this fix: it never carries a clamp entry, in this case or the one that clamps at 10 above.
  assert.ok(hi.adjustments_applied.every((a) => !a.isClamp), "adjustments_applied must not carry a clamp entry");
  assert.ok(lo.adjustments_applied.every((a) => !a.isClamp), "adjustments_applied must not carry a clamp entry");
  // No recognised inputs at all: both reasons end "no further adjustment changed it".
  const none = scoreEpic(cases.no_inputs);
  assert.match(none.primary.reason, /no further adjustment changed it\.$/);
  assert.match(none.secondary.reason, /no further adjustment changed it\.$/);
});
