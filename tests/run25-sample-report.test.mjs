// Run 25 (owner decision of 11 October 2026, P24-2): the browser report and the sample report page carry one company name,
// "Helix GTM Consulting" (the logo wordmark "Helix GTM" is the only exception), and the sample uses CloudSEK, a real company
// used only as an example to show the tool, in place of the made-up company used before. Every figure in the example answers
// is hypothetical. Run: node --test tests/run25-sample-report.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import * as RC from "../netlify/lib/report-chrome.js";

const WORDMARK = '<span class="hx9-word">Helix GTM</span>';
// "Helix GTM" not followed by " Consulting", outside the wordmark (the SVG text "HELIX GTM" is upper case and is the wordmark too).
const loose = (s) => (s.split(WORDMARK).join("").match(/Helix GTM(?! Consulting)/g) || []).length;

test("report chrome: one company name in the header, footer, aria labels and structured data", () => {
  for (const name of ["HEADER", "SAMPLE_HEADER", "FOOTER", "NEXT", "SKIP", "SAMPLE_TITLE", "SAMPLE_DESC", "LD_SAMPLE"]) {
    assert.equal(loose(RC[name]), 0, name);
    assert.ok(!RC[name].includes("GTM Helix"), name);
  }
  for (const h of [RC.HEADER, RC.SAMPLE_HEADER]) {
    assert.ok(h.includes('aria-label="Helix GTM Consulting home"') && h.includes('aria-label="Helix GTM Consulting menu"'));
    assert.ok(h.includes('<a href="https://gtmhelix.com/">Helix GTM Consulting</a>'));
    assert.equal(h.split(WORDMARK).length - 1, 1, "the wordmark is kept");
  }
  assert.ok(RC.FOOTER.includes('role="img" aria-label="Helix GTM Consulting"') && RC.FOOTER.includes(">HELIX GTM</text>"));
  const ld = JSON.parse(RC.LD_SAMPLE);
  const org = ld["@graph"].find((n) => n["@type"] === "Organization");
  assert.equal(org.name, "Helix GTM Consulting");
  assert.equal(org.alternateName, undefined);
  const crumbs = ld["@graph"].find((n) => n["@type"] === "BreadcrumbList");
  assert.equal(crumbs.itemListElement[0].name, "Helix GTM Consulting");
});
