// Build the published folder site/ with ONLY the public pages and assets (run 5, 25 September 2026).
// Before this, netlify.toml published "." so function source, tests, package files, TESTING.md and
// GTM_ALPHA_HISTORY.txt were served to anyone. Functions are bundled separately from netlify/functions.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { buildSampleReport } from "./build-sample-report.mjs";
import { directive, hashOf, inlineHandlers, inlineScripts, siteCsp } from "./csp-hashes.mjs";

const ROOT = process.cwd();
const OUT = join(ROOT, "site");
// The PayPal pages (payment-success.html, payment-cancel.html) are kept for a paid launch in netlify/retired/ (run 12) and are not
// published: while GTM Alpha is free, the Premium Audit report is returned straight after the form (owner decision 3).
// Run 10 R10-05: 404.html is Netlify's page for any address that does not exist (served with status 404).
const PAGES = ["index.html", "pricing.html", "consultation.html", "integration.html", "faq.html", "api-docs.html",
  "privacy.html", "terms.html", "404.html", "sample-report/index.html"];
// Run 10 R10-28 (P13): favicon.ico is favicon.svg drawn at 16, 32 and 48 px (work/run10/gtmalpha/favicon_ico.mjs), for
// browsers and tools that ask for /favicon.ico.
const FILES = [...PAGES, "favicon.svg", "favicon.ico", "apple-touch-icon.png", "logo.svg", "robots.txt", "sitemap.xml", "llms.txt", "_redirects", "_headers", "openapi.yaml",
  "5d1ec46b7e579accde50872ab5aef7a4.txt"];
const DIRS = ["assets"];

// Run 10 R10-A1-5 c: rebuild the sample report from the report code first, so the published sample always matches the
// published code (scripts/build-sample-report.mjs; the same answers as "Fill in an example").
await buildSampleReport();
console.log("build-site: sample-report/index.html rebuilt from the report code");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of FILES) {
  if (!existsSync(join(ROOT, f))) throw new Error("build-site: missing " + f);
  mkdirSync(dirname(join(OUT, f)), { recursive: true });
  cpSync(join(ROOT, f), join(OUT, f));
}
for (const d of DIRS) cpSync(join(ROOT, d), join(OUT, d), { recursive: true });
const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1), 0);
console.log(`build-site: site/ has ${count(OUT)} files (${FILES.length} top-level files plus ${DIRS.join(", ")}/)`);

// Run 19 (owner decision D77): /version.json names the deployed commit. Netlify sets COMMIT_REF on a build of the repo
// (docs.netlify.com, "Build environment variables": "reference ID (also known as SHA or hash) of the commit we're building");
// a local build uses git rev-parse HEAD. Four fields only; no secret and no other variable is read.
{
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  let ref = /^[0-9a-f]{40}$/.test(process.env.COMMIT_REF || "") ? process.env.COMMIT_REF : "";
  if (!ref) {
    try { ref = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { ref = "unknown (not a git checkout)"; }
  }
  const built = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  writeFileSync(join(OUT, "version.json"), JSON.stringify({ site: "gtmalpha.gtmhelix.com", version: pkg.version, commit: ref, built_utc: built }, null, 1) + "\n");
  console.log(`build-site: version.json for ${pkg.version} at ${ref.slice(0, 12)}`);
}

// Run 9 D4: version every /assets/ address in the published CSS and HTML with ?v=<first 10 hex digits of the file's
// SHA-256>, the same rule as work/cachebust.py bust(out_dir), so a changed file always gets a new address and _headers can
// cache /assets/* for a year ("public, max-age=31536000, immutable") while HTML revalidates ("public, max-age=0,
// must-revalidate"). It runs on every build, so the versions always match the files that are published.
const REF = /((?:href|src|srcset|content)=["']|url\(\s*["']?)(\/assets\/[^"'\s)?#,]+)(\?v=[0-9a-f]+)?/g;
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
function bust(out) {
  let n = 0;
  let cache = new Map();
  const ver = (path) => {
    if (!cache.has(path)) {
      const f = join(out, path.replace(/^\//, ""));
      cache.set(path, existsSync(f) && statSync(f).isFile() ? createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 10) : null);
    }
    return cache.get(path);
  };
  const fix = (text) => text.replace(REF, (all, pre, path) => { const v = ver(path); if (!v) return all; n++; return `${pre}${path}?v=${v}`; });
  const files = walk(out);
  // CSS first (fonts inside fonts.css change the CSS file's own hash), then HTML
  for (const f of files.filter((f) => f.endsWith(".css"))) {  // site/ holds CSS only under assets/
    const t = readFileSync(f, "utf8"); const t2 = fix(t); if (t2 !== t) writeFileSync(f, t2);
  }
  cache = new Map();
  for (const f of files.filter((f) => f.endsWith(".html"))) {
    const t = readFileSync(f, "utf8"); const t2 = fix(t); if (t2 !== t) writeFileSync(f, t2);
  }
  return n;
}
console.log(`build-site: ${bust(OUT)} /assets/ references versioned with ?v=<sha256>`);

// Run 12 R12-12 h (G-M7): the live report (netlify/lib/premium-audit.js) links the stylesheets with the V_* versions in
// netlify/lib/report-chrome.js. Set them here from the published files, after the versioning above, so the ?v= the report
// asks for is always the hash of the file that is served (fonts.css changes when its font addresses are versioned).
const CHROME = join(ROOT, "netlify", "lib", "report-chrome.js");
let chromeJs = readFileSync(CHROME, "utf8");
const chromeBefore = chromeJs;
for (const [name, cssFile] of [["fonts", "fonts.css"], ["brand", "brand.css"], ["helix", "helix.css"],
  ["helix_report", "helix-report.css"], ["site", "site.css"]]) {
  const v = createHash("sha256").update(readFileSync(join(OUT, "assets", cssFile))).digest("hex").slice(0, 10);
  const re = new RegExp(`export const V_${name.toUpperCase()} = "[0-9a-f]+";`);
  if (!re.test(chromeJs)) throw new Error("build-site: V_" + name.toUpperCase() + " missing in report-chrome.js");
  chromeJs = chromeJs.replace(re, `export const V_${name.toUpperCase()} = "${v}";`);
}
// Run 12 R12-12 l: the live report preloads its two fonts like the static pages; their ?v= must equal the one the
// versioned fonts.css asks for, so the preloaded file is the one the page uses.
for (const [name, file] of [["ARCHIVO", "Archivo-latin-1.woff2"], ["VT323", "VT323-latin-400.woff2"]]) {
  const v = createHash("sha256").update(readFileSync(join(OUT, "assets", "fonts", file))).digest("hex").slice(0, 10);
  const line = `export const V_${name} = "${v}";`;
  const re = new RegExp(`export const V_${name} = "[0-9a-f]+";`);
  chromeJs = re.test(chromeJs) ? chromeJs.replace(re, line) : chromeJs.replace(/\n?$/, "\n" + line + "\n");
}
if (chromeJs !== chromeBefore) writeFileSync(CHROME, chromeJs);
console.log(`build-site: report-chrome.js V_FONTS, V_BRAND, V_HELIX, V_HELIX_REPORT, V_SITE, V_ARCHIVO, V_VT323 set from site/assets (${chromeJs === chromeBefore ? "unchanged" : "updated"})`);

// Run 15 D40: the site policy allows no 'unsafe-inline' script. Every executable inline script in a published page is allowed by
// the sha256 hash of its exact text, computed here from the page as served (after the versioning above, which can change a
// script's text), and written into the built _headers. A page with an inline event handler (onclick=...) or a javascript:
// address fails the build, because a hash cannot allow those. Today no page has an inline script that runs (the JSON-LD blocks
// are data), so the hash list is empty and _headers is copied as it is.
{
  const headersPath = join(OUT, "_headers");
  const headers = readFileSync(headersPath, "utf8");
  const csp = siteCsp(headers);
  const scriptSrc = directive(csp, "script-src");
  for (const bad of ["'unsafe-inline'", "'unsafe-eval'"]) {
    if (scriptSrc.includes(bad)) throw new Error(`build-site: script-src in _headers allows ${bad}`);
  }
  const hashes = [];
  for (const f of walk(OUT).filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(f, "utf8");
    const handlers = inlineHandlers(html);
    if (handlers.length) throw new Error(`build-site: ${f.slice(OUT.length + 1)} has inline handlers (${handlers.join(", ")}); move them to addEventListener in a script file`);
    for (const sc of inlineScripts(html)) if (sc.executable) hashes.push(hashOf(sc.text));
  }
  const missing = [...new Set(hashes)].filter((h) => !scriptSrc.includes(h));
  if (missing.length) {
    const newCsp = csp.replace(/script-src([^;]*)/, (all) => all + " " + missing.join(" "));
    writeFileSync(headersPath, headers.replace(csp, newCsp));
  }
  console.log(`build-site: script-src has no 'unsafe-inline'; ${hashes.length} inline scripts run in the published pages, ${missing.length} hashes added to _headers`);
}
