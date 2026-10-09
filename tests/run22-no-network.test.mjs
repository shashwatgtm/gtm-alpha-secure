// Run 22 (risk R8 of the run 20 register): GTM Alpha's server code must not gain a way to reach an address the user types.
// Today nothing in netlify/lib or netlify/functions fetches anything, and the digital presence audit is switched off.
// This test fails if a network call, a process call or dynamic code appears there, so adding one has to be a deliberate, visible change
// (it would then need an https-only, public-host-only, no-redirect-to-private, time-limited design and the echo safeguard on the result).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = (dir) => readdirSync(join(ROOT, dir)).flatMap((f) => {
  const p = join(dir, f);
  return statSync(join(ROOT, p)).isDirectory() ? files(p) : /\.(js|mjs)$/.test(f) ? [p] : [];
});
const SERVER_FILES = [...files("netlify/lib"), ...files("netlify/functions")];
const FORBIDDEN = [
  [/\bfetch\s*\(/, "fetch("], [/\bXMLHttpRequest\b/, "XMLHttpRequest"], [/\bnode:(?:http|https|net|dns|tls|child_process)\b|require\(['"](?:http|https|net|dns|tls|child_process)['"]\)/, "a network or process module"],
  [/\beval\s*\(/, "eval("], [/\bnew Function\s*\(/, "new Function("], [/\bprocess\.env\.[A-Z_]*(?:KEY|TOKEN|SECRET|PASSWORD)/, "a secret from the environment"],
];

test("the server code lists some files to check", () => { assert.ok(SERVER_FILES.length >= 8, `only ${SERVER_FILES.length} files`); });

test("no network call, process call, eval or secret read in netlify/lib and netlify/functions", () => {
  const hits = [];
  for (const f of SERVER_FILES) {
    const text = readFileSync(join(ROOT, f), "utf8").split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n");
    for (const [re, name] of FORBIDDEN) if (re.test(text)) hits.push(`${f}: ${name}`);
  }
  assert.deepEqual(hits, [], "a file gained a capability the tools did not have: " + hits.join("; "));
});

test("the digital presence audit stays switched off", () => {
  assert.match(readFileSync(join(ROOT, "netlify/lib/analyze.js"), "utf8"), /export const DIGITAL_PRESENCE_AUDIT_ENABLED = false;/);
});
