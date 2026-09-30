// Run 15 R15-14 (Codex C-IMP-01, M1): every place that states the server's version says the version in package.json.
// It fails when any of them differs. The release-history rows in api-docs.html are exempt (they are history, one row per
// version); only the row marked "current" and the paragraph above the table must name the newest version.
// openapi.yaml and openai-gpt-actions.json carry the version of the API description, a separate number, and are not checked.
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const VERSION = JSON.parse(read("package.json")).version;
const one = (text, re, what) => {
  const m = text.match(re);
  assert.ok(m, "no version statement found for " + what);
  return m[1];
};

test("package.json holds a version", () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test("every version statement in the repo equals package.json", () => {
  const found = {
    "manifest.json version": JSON.parse(read("manifest.json")).version,
    "server.json version": JSON.parse(read("server.json")).version,
    "server.json packages[0].version": JSON.parse(read("server.json")).packages[0].version,
    "mcp-sse.js serverInfo version": one(read("netlify/functions/mcp-sse.js"), /serverInfo: \{ name: "gtm-alpha-mcp-server", version: "(\d+\.\d+\.\d+)" \}/, "serverInfo"),
    "health.js version": one(read("netlify/lib/health.js"), /version: "(\d+\.\d+\.\d+)"/, "health.js"),
    "README.md line 1": one(read("README.md").split("\n")[0], /^# GTM Alpha MCP Server v(\d+\.\d+\.\d+)$/, "README line 1"),
    "README.md newest-version sentence": one(read("README.md"), /tools\/list` of gtm-alpha-mcp-server (\d+\.\d+\.\d+)/, "README newest-version sentence"),
    "integration.html Server version": one(read("integration.html"), /<li>Server version: (\d+\.\d+\.\d+)<\/li>/, "integration.html"),
    "sample-report GTM Alpha version": one(read("sample-report/index.html"), /Built by the GTM Alpha (\d+\.\d+\.\d+) report code/, "sample report"),
    "api-docs.html row marked current": one(read("api-docs.html"), /<tr><td>(\d+\.\d+\.\d+)<\/td><td>[^<]*<\/td><td>[^<]*\(current[^<]*<\/td>/, "api-docs current row"),
  };
  // the paragraph above the release table lists the versions that run on this site only: the newest one is the current version
  const para = one(read("api-docs.html"), /Versions 1\.1\.0, ([^<]*?) run on this site only/, "api-docs release paragraph");
  const listed = para.match(/\d+\.\d+\.\d+/g);
  found["api-docs.html release paragraph (newest version listed)"] = listed[listed.length - 1];
  // softwareVersion in any page's JSON-LD, where a page has one
  for (const f of ["index.html", "api-docs.html", "integration.html", "pricing.html", "faq.html", "consultation.html", "sample-report/index.html"]) {
    for (const m of read(f).matchAll(/"softwareVersion":\s*"([^"]+)"/g)) found[f + " softwareVersion"] = m[1];
  }
  const wrong = Object.entries(found).filter(([, v]) => v !== VERSION);
  assert.deepEqual(wrong, [], `package.json says ${VERSION}; these differ: ` + wrong.map(([k, v]) => `${k} = ${v}`).join("; "));
  assert.ok(Object.keys(found).length >= 10, "all statements were found");
});

test("the release history has a row for the current version, and only that row is marked current", () => {
  const html = read("api-docs.html");
  const rows = [...html.matchAll(/<tr><td>(\d+\.\d+\.\d+)<\/td>/g)].map((m) => m[1]);
  assert.ok(rows.includes(VERSION), "a release-history row for " + VERSION);
  assert.equal(rows[rows.length - 1], VERSION, "the newest row is last");
  assert.equal((html.match(/\(current;/g) || []).length, 1, "one row is marked current");
});
