// Run 25 P24-1 (owner, 11 October 2026): the published pages and the sample report's structured data carry the canonical
// Organization and Person nodes of the project's work/chrome.py (bio facts from gtm-expert-schema facts/shashwat-ghosh.json,
// Structured Data Reference v3.0): one Person @id, https://gtmhelix.com/about/#shashwat-ghosh, and none of the retired strings.
// Run: node --test tests/run25-bio.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LD_SAMPLE } from "../netlify/lib/report-chrome.js";

const PERSON_ID = "https://gtmhelix.com/about/#shashwat-ghosh";
const RETIRED = ["CRED ($180M+)", "$180M+", "VP Performance Marketing", "#14 in AI Research", "https://gtmhelix.com/about/#person"];
const PAGES = ["index.html", "pricing.html", "consultation.html", "integration.html", "faq.html", "api-docs.html", "privacy.html", "terms.html", "404.html", "sample-report/index.html", "README.md"];
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");

test("no retired bio string or Person id in the published pages, the README or the report chrome", () => {
  for (const f of PAGES) for (const bad of RETIRED) assert.ok(!read(f).includes(bad), f + ": " + bad);
  for (const bad of RETIRED) assert.ok(!LD_SAMPLE.includes(bad), "LD_SAMPLE: " + bad);
});

test("every JSON-LD block has one Person, with the canonical @id, and every reference to a Person uses it", () => {
  const blocks = [LD_SAMPLE];
  for (const f of PAGES.filter((p) => p.endsWith(".html"))) {
    for (const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) blocks.push(m[1]);
  }
  assert.equal(blocks.length, 10, "the report chrome plus 9 pages with structured data (404.html has none)");
  for (const b of blocks) {
    const g = JSON.parse(b)["@graph"];
    const people = g.filter((n) => n["@type"] === "Person");
    assert.equal(people.length, 1);
    assert.equal(people[0]["@id"], PERSON_ID);
    // Owner, 5 and 6 Nov 2026: only profiles he controls; gtmexpert.com (noindex) is dropped.
    assert.deepEqual(people[0].sameAs, ["https://www.linkedin.com/in/shashwatghosh-ai-b2b-gtm-fractionalcmo/", "https://github.com/shashwatgtm", "https://www.npmjs.com/org/shashwatgtmalpha", "https://apify.com/shashghosh", "https://x.com/Shashwat_Ghosh", "https://www.skills.sh/shashwatgtm"]);
    assert.ok(!JSON.stringify(people[0]).includes("gtmexpert.com"));
    assert.equal(people[0].jobTitle, "Co-Founder and Fractional CMO");
    assert.ok(people[0].award.includes("Top 15 AI Research and Innovation (India)"));
    const org = g.find((n) => n["@type"] === "Organization");
    assert.equal(org.name, "Helix GTM Consulting");
    assert.equal(org.member["@id"], PERSON_ID);
  }
});
