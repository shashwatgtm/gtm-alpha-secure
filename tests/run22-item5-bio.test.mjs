// Run 22 job 4b (item 5): the old bio wording and the retired Person @id are gone from GTM Alpha's pages, README and sample-report data.
// The correct text is what the facts file (gtm-expert-schema, facts/shashwat-ghosh.json, via work/bio.json) produces on tools.gtmhelix.com
// and gtmhelix.com since the schema run of 4 October 2026. This test fails when:
//   - one of the old strings, or the retired Person @id, is in any page, README.md, llms.txt or netlify/lib/report-chrome.js;
//   - a JSON-LD block of a live page does not parse;
//   - a Person node is not the one the facts file gives, with @id https://www.gtmexpert.com/#shashwat-ghosh;
//   - the sample report's data (LD_SAMPLE) differs from the Person node, or the built sample page differs from LD_SAMPLE.
// The old strings are written in two pieces on purpose, so a repo-wide search for them finds only the pages that still hold them.
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const cat = (...parts) => parts.join(" ");

// The four old strings and the retired id (item 5 of the run 22 job card), plus the two words the facts file does not use.
const OLD = {
  "rank line": cat("#14 in AI", "Research and Innovation on LinkedIn India"),
  "Locus line": cat("VP Performance", "Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025."),
  "CRED line": cat("VP Marketing,", "Happay: 161% ARR growth. 2x exit: to CRED ($180M" + "+), then MakeMyTrip."),
  "Locus job title": cat("VP Performance", "Marketing"),
  "CRED price with a plus": "$180M" + "+",
  "retired Person id": "https://gtmhelix.com" + "/about/#person",
  "older Person id of the retired pages": "https://www.gtmexpert.com/#" + "shashwat\"",
  "start date in the Person description": cat("since", "October 2022"),
};
// The old description line is the Person description that carries the old Locus and CRED lines: it is caught by the strings above
// and by the exact comparison with the facts file node below.

const NEW_ID = "https://www.gtmexpert.com/#shashwat-ghosh";
const LIVE = ["api-docs.html", "consultation.html", "faq.html", "index.html", "integration.html", "pricing.html", "privacy.html",
  "sample-report/index.html", "terms.html"];
const RETIRED = ["netlify/retired/payment-cancel.html", "netlify/retired/payment-success.html"];

// The Person node the facts file gives (work/bio.json: frameworks_line, rebrands_short, results, awards, links; same node as on tools.gtmhelix.com).
const PERSON = {
  "@type": "Person",
  "@id": NEW_ID,
  name: "Shashwat Ghosh",
  jobTitle: "Co-Founder and Fractional CMO",
  description: "Co-Founder and Fractional CMO of Helix GTM Consulting, with 24+ years in B2B and 10+ years of fractional experience. Creator of the EPIC, IMPACT and CRAFT frameworks and the Hub-Spoke Brand Messaging Methodology. Part of 6+ rebrands. Results: VP Marketing, Happay: 161% ARR growth. 2x exit: to CRED ($180M), then MakeMyTrip. VP Global Performance Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025. Fractional CMO, FieldAssist: 2.25x growth in mid-market and enterprise qualified leads. Advisor, QuantumStreet AI: rebranded a $7Bn AUM AI investment fund, with Digitas and IBM. 4x business growth, Airtel Data Centers and Managed Services. Rs 2.35 Cr TCV in 6 months with ABM at Seclore, and 225+ sales meetings across Seclore's target accounts.",
  worksFor: { "@id": "https://gtmhelix.com/#org" },
  url: "https://www.gtmexpert.com",
  email: "shashwat@gtmhelix.com",
  award: [
    "LinkedIn Top Product Marketing Voice: #10 India, #52 worldwide (Favikon verified)",
    "Top 15 AI Research and Innovation (India)",
    "Top 30 PLG creators worldwide",
    "Most Admired Marketing Leaders 2025 (CMO Asia)",
    "B2B Marketer of the Year 2020, Fintech (CMO Asia)",
  ],
  knowsAbout: ["EPIC", "IMPACT", "CRAFT", "Hub-Spoke Brand Messaging Methodology"],
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru" },
  image: "https://tools.gtmhelix.com/assets/shashwat-ghosh-480.jpg",
  sameAs: [
    "https://www.gtmexpert.com/",
    "https://www.linkedin.com/in/shashwatghosh-ai-b2b-gtm-fractionalcmo/",
    "https://github.com/shashwatgtm",
    "https://gtmexpert.substack.com/",
    "https://x.com/Shashwat_Ghosh",
    "https://apify.com/shashghosh",
    "https://www.google.com/search?kgmid=/g/11k58ncv_x",
  ],
  hasOccupation: [
    "VP Marketing, Happay: 161% ARR growth. 2x exit: to CRED ($180M), then MakeMyTrip.",
    "VP Global Performance Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025.",
    "Fractional CMO, FieldAssist: 2.25x growth in mid-market and enterprise qualified leads.",
    "Advisor, QuantumStreet AI: rebranded a $7Bn AUM AI investment fund, with Digitas and IBM.",
    "4x business growth, Airtel Data Centers and Managed Services.",
    "Rs 2.35 Cr TCV in 6 months with ABM at Seclore, and 225+ sales meetings across Seclore's target accounts.",
  ].map((name) => ({ "@type": "Occupation", name })),
};

// Every tracked page, the README, llms.txt and the sample report's data string. site/ and node_modules/ are not tracked.
const walk = (dir) => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
  if (e.name === "node_modules" || e.name === "site" || e.name === ".git") return [];
  const p = dir ? join(dir, e.name) : e.name;
  return e.isDirectory() ? walk(p) : [p];
});
const SCANNED = [...walk("").filter((p) => p.endsWith(".html")), "README.md", "llms.txt", "netlify/lib/report-chrome.js"].sort();

const blocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const nodes = (html) => blocks(html).flatMap((b) => { const j = JSON.parse(b); return j["@graph"] || [j]; });
// every { "@id": ... } reference, and every node @id, anywhere in a value
const ids = (o, out = []) => {
  if (Array.isArray(o)) o.forEach((v) => ids(v, out));
  else if (o && typeof o === "object") { if (typeof o["@id"] === "string") out.push(o["@id"]); Object.values(o).forEach((v) => ids(v, out)); }
  return out;
};

test("the scan covers every page, the README and the sample report data", () => {
  assert.ok(SCANNED.length >= 14, "found only " + SCANNED.join(", "));
  for (const f of [...LIVE, ...RETIRED, "README.md", "netlify/lib/report-chrome.js"]) assert.ok(SCANNED.includes(f), f + " is not scanned");
});

test("none of the old bio strings and not the retired Person id is in any page, README, llms.txt or report-chrome.js", () => {
  const found = [];
  for (const f of SCANNED) {
    const t = read(f);
    for (const [what, s] of Object.entries(OLD)) if (t.includes(s)) found.push(`${f}: ${what}`);
  }
  assert.deepEqual(found, []);
});

test("every JSON-LD block of the nine live pages parses", () => {
  for (const f of LIVE) {
    const b = blocks(read(f));
    assert.ok(b.length >= 1, f + " has no JSON-LD block");
    for (const x of b) assert.doesNotThrow(() => JSON.parse(x), f + " has a JSON-LD block that does not parse");
  }
  for (const f of RETIRED) for (const x of blocks(read(f))) assert.doesNotThrow(() => JSON.parse(x), f);
});

test("the Person node of every page with structured data is the one the facts file gives, with the right @id", () => {
  for (const f of [...LIVE, ...RETIRED]) {
    const people = nodes(read(f)).filter((n) => n["@type"] === "Person");
    assert.equal(people.length, 1, f + " should have one Person node");
    assert.equal(people[0]["@id"], NEW_ID, f);
    assert.deepStrictEqual(people[0], PERSON, f + ": the Person node differs from the facts file");
  }
});

test("every reference to the Person, on every page, is the new @id; the Organization member is the Person", () => {
  for (const f of [...LIVE, ...RETIRED]) {
    const all = ids(nodes(read(f)));
    const personIds = all.filter((i) => /gtmexpert\.com\/#|\/about\/#person/.test(i));
    assert.ok(personIds.length >= 2, f + ": expected the Person node and the Organization member reference");
    assert.deepEqual([...new Set(personIds)], [NEW_ID], f);
    const org = nodes(read(f)).find((n) => n["@type"] === "Organization");
    assert.deepEqual(org.member, { "@id": NEW_ID }, f);
    assert.ok(all.every((i) => !i.startsWith("https://tools.gtmhelix.com" + "/#org")), f + " still points at the older Organization id");
  }
});

test("the sample report's data string (LD_SAMPLE) holds the same Person node, and the built sample page carries exactly that data", async () => {
  const { LD_SAMPLE } = await import(pathToFileURL(join(ROOT, "netlify/lib/report-chrome.js")).href);
  const data = JSON.parse(LD_SAMPLE);
  const people = data["@graph"].filter((n) => n["@type"] === "Person");
  assert.equal(people.length, 1);
  assert.deepStrictEqual(people[0], PERSON);
  const page = blocks(read("sample-report/index.html"));
  assert.equal(page.length, 1);
  assert.equal(page[0], "\n" + LD_SAMPLE + "\n", "sample-report/index.html differs from LD_SAMPLE; rebuild it with node scripts/build-sample-report.mjs");
});

test("the README results and recognition lists use the facts file wording", () => {
  const t = read("README.md");
  for (const line of [
    "- VP Marketing, Happay: 161% ARR growth. 2x exit: to CRED ($180M), then MakeMyTrip.",
    "- VP Global Performance Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025.",
    "- Top 15 AI Research and Innovation (India)",
  ]) assert.ok(t.split("\n").includes(line), "README.md has no line: " + line);
});

test("the visible results list on the home page uses the facts file wording", () => {
  const t = read("index.html");
  const ul = t.match(/<ul class="hx7-results">[\s\S]*?<\/ul>/);
  assert.ok(ul, "no results list on the home page");
  assert.ok(ul[0].includes("<li>VP Marketing, Happay: 161% ARR growth. 2x exit: to CRED ($180M), then MakeMyTrip.</li>"));
  assert.ok(ul[0].includes("<li>VP Global Performance Marketing, Locus: $4.2M pipeline. Acquired by IKEA (Ingka Group) in Oct 2025.</li>"));
});
