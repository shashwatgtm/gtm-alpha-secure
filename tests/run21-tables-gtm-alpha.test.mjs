// Run 21b late task (written before the fix): the audit API (netlify/lib/epic-audit.js, POST /api/epic-audit) printed industry
// opportunities from a table keyed by the typed industry word. Its fintech entry (a financial advisor and broker channel), its logistics
// entry (carrier and fulfilment partners) and its SaaS entry (a freemium model and a developer community for API adoption) were written
// for one kind of company each. The stock line must appear only when the shared reader names that kind (vertical.subtype); every other
// company of the vertical gets the neutral entry. Companies are described in plain words, no real names.
// Run: node --no-warnings --test tests/run21-tables-gtm-alpha.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import api from "../netlify/functions/api.js";

const opportunities = async (industry) => {
  const r = await api(new Request("https://gtmalpha.gtmhelix.com/api/epic-audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ company: "Plain Co", industry }) }), {});
  assert.equal(r.status, 200);
  const j = await r.json();
  return j.audit_results.detailed_assessment.opportunities.join(" | ");
};

const BROKER = /broker/i, FULFIL = /fulfil+ment/i, FREEMIUM = /freemium|API adoption/i;

test("fintech: the advisor and broker channel is for wealth or insurance companies only", async () => {
  for (const kind of ["wealth management platform", "insurance brokerage software"]) assert.match(await opportunities(kind), BROKER, kind);
  for (const other of ["fintech", "payments API", "lending and credit data platform", "expense management software"]) assert.doesNotMatch(await opportunities(other), BROKER, other);
});

test("logistics: the carrier and fulfilment partner line is for freight marketplaces, warehousing and transport management only", async () => {
  for (const kind of ["warehouse fulfilment software", "freight marketplace", "transport management system"]) assert.match(await opportunities(kind), FULFIL, kind);
  for (const other of ["logistics", "last mile delivery", "freight visibility platform"]) assert.doesNotMatch(await opportunities(other), FULFIL, other);
});

test("SaaS: the freemium and developer community lines are for product analytics and growth tools only", async () => {
  assert.match(await opportunities("product analytics"), FREEMIUM);
  for (const other of ["SaaS", "customer service software", "collaboration software"]) assert.doesNotMatch(await opportunities(other), FREEMIUM, other);
});

test("every company still gets three opportunity lines, and the typed words that name no table entry keep the old default", async () => {
  for (const industry of ["fintech", "logistics", "saas", "last mile delivery", "wealth management platform", "something unusual"]) {
    assert.equal((await opportunities(industry)).split(" | ").length, 3, industry);
  }
  assert.match(await opportunities("something unusual"), /Partnership ecosystem development/);
});
