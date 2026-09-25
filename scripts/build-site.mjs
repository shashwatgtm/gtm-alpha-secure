// Build the published folder site/ with ONLY the public pages and assets (run 5, 25 September 2026).
// Before this, netlify.toml published "." so function source, tests, package files, TESTING.md and
// GTM_ALPHA_HISTORY.txt were served to anyone. Functions are bundled separately from netlify/functions.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "site");
const PAGES = ["index.html", "pricing.html", "consultation.html", "integration.html", "faq.html", "api-docs.html",
  "privacy.html", "terms.html", "payment-success.html", "payment-cancel.html"];
const FILES = [...PAGES, "favicon.svg", "logo.svg", "robots.txt", "sitemap.xml", "llms.txt", "_redirects", "openapi.yaml",
  "5d1ec46b7e579accde50872ab5aef7a4.txt"];
const DIRS = ["assets"];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of FILES) {
  if (!existsSync(join(ROOT, f))) throw new Error("build-site: missing " + f);
  cpSync(join(ROOT, f), join(OUT, f));
}
for (const d of DIRS) cpSync(join(ROOT, d), join(OUT, d), { recursive: true });
const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1), 0);
console.log(`build-site: site/ has ${count(OUT)} files (${FILES.length} top-level files plus ${DIRS.join(", ")}/)`);
