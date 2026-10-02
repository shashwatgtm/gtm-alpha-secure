// Run 19 (owner decision D77): /version.json names the deployed commit. scripts/build-site.mjs writes site/version.json after
// the copy step with exactly four fields: site, version (package.json), commit (Netlify's COMMIT_REF build variable, else
// `git rev-parse HEAD`) and built_utc. Written before build-site.mjs learned it (B43). Run: node --test tests/version-json.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
const build = (env) => { execFileSync("node", ["scripts/build-site.mjs"], { cwd: ROOT, env: { ...process.env, ...env }, stdio: "pipe" });
  return JSON.parse(readFileSync(join(ROOT, "site", "version.json"), "utf8")); };

test("version.json uses Netlify's COMMIT_REF when it is set", () => {
  const ref = "0123456789abcdef0123456789abcdef01234567";
  const v = build({ COMMIT_REF: ref });
  assert.deepEqual(Object.keys(v), ["site", "version", "commit", "built_utc"]);
  assert.equal(v.site, "gtmalpha.gtmhelix.com");
  assert.equal(v.version, VERSION);
  assert.equal(v.commit, ref);
  assert.match(v.built_utc, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});

test("version.json falls back to git rev-parse HEAD locally", () => {
  const env = { ...process.env }; delete env.COMMIT_REF;
  execFileSync("node", ["scripts/build-site.mjs"], { cwd: ROOT, env, stdio: "pipe" });
  const v = JSON.parse(readFileSync(join(ROOT, "site", "version.json"), "utf8"));
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).toString().trim();
  assert.equal(v.commit, head);
  assert.match(v.commit, /^[0-9a-f]{40}$/);
});
