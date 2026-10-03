// Shared body of the run 21b stock-text tests (netlify tools epic_audit and gtm_consultation). Not a test file itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scoreEpic } from "../netlify/lib/epic-advanced.js";

const cases = JSON.parse(readFileSync(new URL("./fixtures/run21-stock-cases.json", import.meta.url), "utf8"));
const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
let id = 1;
const call = async (name, args) => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }), {});
  const j = await r.json();
  assert.ok(!j.result.isError, "no error: " + JSON.stringify(j.result).slice(0, 300));
  return JSON.parse(j.result.content.map((c) => c.text).join("\n"));
};
const INPUTS = { acv_usd: 60000, deal_cycle_days: 100, tam_accounts: 3000, nrr_percent: 110 };
const argsFor = (tool, side, name) => (tool === "epic_audit"
  ? { company_name: name, industry: side.industry, challenge: side.text, ...INPUTS }
  : { company_name: name, industry: side.industry, gtm_challenge: side.text, ...INPUTS });
// The sector-bearing parts of an answer: the first 30 days, the sector notes and the sector fit (the user's own words are not part of them).
const sectorText = (j) => JSON.stringify({ f: j.first_30_days, n: j.sector_notes, s: j.sector_fit });
const re = (s) => new RegExp(s, "i");

export function defineTests(tool) {
  for (const p of cases.pairs) {
    test(`${tool}: ${p.id}: each company gets its own kind's wording and not the other's`, async () => {
      const a = await call(tool, argsFor(tool, p.a, "Company A"));
      const b = await call(tool, argsFor(tool, p.b, "Company B"));
      const ta = sectorText(a), tb = sectorText(b);
      assert.doesNotMatch(ta, re(p.a.forbid), "A got a line written for B's kind: " + ta.match(re(p.a.forbid)));
      assert.doesNotMatch(tb, re(p.b.forbid), "B got a line written for A's kind: " + tb.match(re(p.b.forbid)));
      assert.match(ta, re(p.a.want), "A's own wording is missing");
      assert.match(tb, re(p.b.want), "B's own wording is missing");
      assert.notDeepEqual(a.first_30_days, b.first_30_days, "the first 30 days differ");
      assert.notEqual(a.sector_fit, b.sector_fit, "the sector fit lines differ");
      assert.notEqual(a.sector_notes.who_decides, b.sector_notes.who_decides, "who decides differs");
      if (tool === "gtm_consultation") {
        const strip = (j, side) => j.consultation_output.replace(/^Challenge: .*$/m, "");
        assert.doesNotMatch(strip(a), re(p.a.forbid));
        assert.doesNotMatch(strip(b), re(p.b.forbid));
      }
    });
  }

  for (const g of cases.generic) {
    test(`${tool}: ${g.id}: only wording true for every company of the vertical`, async () => {
      const j = await call(tool, argsFor(tool, g, "Company G"));
      const t = sectorText(j);
      assert.ok(j.sector_notes && j.sector_notes.sector, "the vertical is read");
      assert.doesNotMatch(t, re(g.forbid), "a line written for one kind of company: " + t.match(re(g.forbid)));
    });
  }

  test(`${tool}: the business model line follows the sub-type and does not call a messaging API a payments business`, async () => {
    const msg = cases.pairs.find((p) => /telecom/.test(p.id)).a, pay = cases.pairs.find((p) => /fintech/.test(p.id)).a;
    const m = await call(tool, argsFor(tool, msg, "Company M"));
    const f = await call(tool, argsFor(tool, pay, "Company F"));
    assert.match(m.business_model, /per-transaction \((priced on volume|volume based)\)/);
    assert.doesNotMatch(m.business_model, /payments|per site|bandwidth/i);
    assert.match(f.business_model, /per-transaction \((payments or volume based|volume based)\)/);
  });

  test(`${tool}: the 'evenly distributed' note uses this company's scores, lead and missing inputs`, async () => {
    const mk = (extra) => (tool === "epic_audit" ? { challenge: "We want an EPIC view.", ...extra } : { gtm_challenge: "We want an EPIC view.", ...extra });
    const a = await call(tool, mk({ company_name: "Company A", industry: "fintech" }));
    const b = await call(tool, mk({ company_name: "Company B", industry: "fintech", business_stage: "series-a", acv_usd: 20000, deal_cycle_days: 60, nrr_percent: 105, tam_accounts: 2000, self_serve: false, deal_source: "inbound", geography: "india" }));
    const notes = (j) => (j.notes || (j.epic_detail && j.epic_detail.notes) || []).filter((n) => /evenly distributed/.test(n)).join(" ");
    const na = notes(a), nb = notes(b);
    assert.ok(na && nb, "both answers carry the note");
    assert.notEqual(na, nb, "the note differs between the two companies");
    const sa = a.scores || a.epic_scores, sb = b.scores || b.epic_scores;
    assert.ok(na.includes(`E ${sa.E}, P ${sa.P}, I ${sa.I}, C ${sa.C}`), "A's own scores: " + na);
    assert.ok(nb.includes(`E ${sb.E}, P ${sb.P}, I ${sb.I}, C ${sb.C}`), "B's own scores: " + nb);
    assert.match(na, /Not given: business stage, ACV, deal cycle, NRR, TAM, deal source, geography/, "A's missing inputs are named");
    assert.doesNotMatch(nb, /Not given/, "B gave every input");
    assert.ok(na.includes(a.primaryFocus ? a.recommendation : a.primary_focus), "names the current lead");
  });
}

test("scoreEpic: the scores of the evenly distributed case are unchanged by the new note wording", () => {
  const r = scoreEpic({ industry: "fintech", gtm_challenge: "We want an EPIC view." });
  assert.deepEqual(r.scores, { E: 7, P: 5, I: 6, C: 6 });
});
