// Run 15 D40: no page allows 'unsafe-inline' scripts; every inline script that runs is allowed by its sha256 hash, computed from
// the exact text as served (built pages by scripts/build-site.mjs, the report and message pages by netlify/lib/premium-audit.js).
// A changed script can therefore never be silently blocked. The browser check is in work/run15/ga15 (Playwright, Chromium).
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import api from "../netlify/functions/api.js";
import { directive, hashOf, inlineHandlers, inlineScripts, siteCsp } from "../scripts/csp-hashes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://gtmalpha.gtmhelix.com";
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);

// Netlify builds in UTC; the sample report carries a date, so the build is run in UTC here too (HANDOFF.md "GTM Alpha builds").
function build(cwd) {
  return spawnSync(process.execPath, ["scripts/build-site.mjs"], { cwd, env: { ...process.env, TZ: "UTC" }, encoding: "utf8" });
}

test("built site: script-src has no unsafe-inline, and every inline script that runs is allowed by its hash", () => {
  const r = build(ROOT);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const headers = readFileSync(join(ROOT, "site/_headers"), "utf8");
  const csp = siteCsp(headers);
  const scriptSrc = directive(csp, "script-src");
  assert.ok(scriptSrc.includes("'self'"));
  assert.ok(!scriptSrc.includes("'unsafe-inline'") && !scriptSrc.includes("'unsafe-eval'"), "script-src: " + scriptSrc.join(" "));
  // the rest of the policy is unchanged (style-src keeps 'unsafe-inline': the pages use style blocks)
  assert.deepEqual(directive(csp, "style-src"), ["'self'", "'unsafe-inline'"]);
  for (const d of ["default-src", "font-src", "img-src", "connect-src", "form-action", "base-uri", "frame-ancestors", "object-src"]) {
    assert.ok(directive(csp, d).length > 0, d);
  }
  const pages = walk(join(ROOT, "site")).filter((f) => f.endsWith(".html"));
  assert.ok(pages.length >= 10, "every published page is checked: " + pages.length);
  for (const f of pages) {
    const html = readFileSync(f, "utf8");
    assert.deepEqual(inlineHandlers(html), [], f + " has inline handlers");
    assert.ok(!/<meta[^>]+http-equiv=["']?content-security-policy/i.test(html), f + " sets its own policy in a meta tag");
    for (const sc of inlineScripts(html)) {
      if (sc.executable) assert.ok(scriptSrc.includes(hashOf(sc.text)), f + ": an inline script is not allowed by a hash in _headers");
      else assert.equal(sc.type, "application/ld+json", f + ": only JSON-LD data blocks are inline");
    }
    // every script that loads is one of the site's own files
    for (const m of html.matchAll(/<script\b[^>]*\ssrc\s*=\s*["']([^"']+)["']/gi)) assert.ok(m[1].startsWith("/assets/js/"), f + ": " + m[1]);
  }
});

test("the build allows an inline script by its hash, and refuses an inline handler or an unsafe-inline policy", () => {
  const tmp = mkdtempSync(join(tmpdir(), "ga15-build-"));
  try {
    for (const p of ["scripts", "netlify/lib", "assets", "package.json", "sample-report", "sitemap.xml", "robots.txt", "llms.txt",
      "_redirects", "_headers", "openapi.yaml", "favicon.svg", "favicon.ico", "logo.svg", "5d1ec46b7e579accde50872ab5aef7a4.txt",
      "index.html", "pricing.html", "consultation.html", "integration.html", "faq.html", "api-docs.html", "privacy.html", "terms.html", "404.html"]) {
      mkdirSync(dirname(join(tmp, p)), { recursive: true });
      cpSync(join(ROOT, p), join(tmp, p), { recursive: true });
    }
    const script = "document.title = 'x' + 1;\n";
    const faq = readFileSync(join(tmp, "faq.html"), "utf8");
    writeFileSync(join(tmp, "faq.html"), faq.replace("</body>", "<script>" + script + "</script></body>"));
    let r = build(tmp);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const src = directive(siteCsp(readFileSync(join(tmp, "site/_headers"), "utf8")), "script-src");
    assert.ok(src.includes(hashOf(script)), "the injected script is allowed by its hash");
    assert.ok(!src.includes("'unsafe-inline'"));
    assert.equal(src.filter((s) => s.startsWith("'sha256-")).length, 1);
    // an inline handler cannot be allowed by a hash: the build fails
    writeFileSync(join(tmp, "faq.html"), faq.replace("</body>", "<button onclick=\"alert(1)\">x</button></body>"));
    r = build(tmp);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /inline handlers/);
    // a policy that allows unsafe-inline scripts fails the build
    writeFileSync(join(tmp, "faq.html"), faq);
    const h = readFileSync(join(tmp, "_headers"), "utf8");
    writeFileSync(join(tmp, "_headers"), h.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"));
    r = build(tmp);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /unsafe-inline/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

const FORM = {
  client_name: "Test Person", client_designation: "Founder", company_name: "TEST Company", industry: "SaaS",
  company_description: "TEST data: a B2B tool for finance teams.", gtm_challenge: "TEST data: long sales cycles.",
  business_stage: "Growth", team_size: "20", monthly_budget: "5000", confirm_consultation: "on", leave_this_empty: ""
};
const post = (body) => api(new Request(BASE + "/api/premium-audit", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body }), {});

test("report page: no unsafe-inline script, every inline script it emits is allowed by its hash, no inline handlers", async () => {
  for (const extra of [{}, { company_name: "Clausewise (example company)" }]) {
    const res = await post(new URLSearchParams({ ...FORM, ...extra }).toString());
    assert.equal(res.status, 200);
    const csp = res.headers.get("content-security-policy");
    const src = directive(csp, "script-src");
    assert.ok(!src.includes("'unsafe-inline'") && !src.includes("'self'") && !src.includes("'unsafe-eval'"), "script-src: " + src.join(" "));
    assert.equal(src.length, 2, "exactly the report's two scripts");
    const html = await res.text();
    assert.deepEqual(inlineHandlers(html), []);
    const scripts = inlineScripts(html).filter((s) => s.executable);
    assert.equal(scripts.length, 2);
    for (const sc of scripts) assert.ok(src.includes(hashOf(sc.text)), "an inline script is not allowed by a hash in the report policy");
    // nothing a visitor types changes what the policy allows
    const other = await post(new URLSearchParams({ ...FORM, company_name: "<script>alert(1)</script>" }).toString());
    assert.equal(other.headers.get("content-security-policy"), csp);
    assert.ok(!(await other.text()).includes("<script>alert(1)</script>"), "the typed script is escaped");
    // the rest of the report policy is as before
    assert.deepEqual(directive(csp, "style-src"), ["'self'", "'unsafe-inline'"]);
    assert.deepEqual(directive(csp, "default-src"), ["'none'"]);
  }
});

test("message pages (refusals) allow no script at all and carry none", async () => {
  const res = await post("a=b");
  assert.equal(res.status, 400);
  const csp = res.headers.get("content-security-policy");
  assert.deepEqual(directive(csp, "default-src"), ["'none'"]);
  assert.deepEqual(directive(csp, "script-src"), [], "no script-src: default-src 'none' blocks scripts");
  const html = await res.text();
  assert.deepEqual(inlineScripts(html), []);
  assert.deepEqual(inlineHandlers(html), []);
});
