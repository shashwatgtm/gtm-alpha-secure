// Run 15 D40: helpers for the Content-Security-Policy script rules, shared by scripts/build-site.mjs (which enforces them on
// every build) and tests/csp.test.mjs. The policy allows no 'unsafe-inline' script. An inline script is allowed by the sha256
// hash of its exact text, which the build computes from the page as served, so a changed script is never silently blocked.
import { createHash } from "node:crypto";

// The hash source for one inline script, from the exact text between <script> and </script>.
export const hashOf = (text) => "'sha256-" + createHash("sha256").update(text, "utf8").digest("base64") + "'";

// Every inline script (a script tag with no src) in a page: { type, text, executable }. Data blocks (JSON-LD and other JSON)
// are never run by the browser, so the policy does not apply to them.
export function inlineScripts(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\ssrc\s*=/i.test(m[1])) continue;
    const type = ((m[1].match(/\stype\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || "").toLowerCase();
    out.push({ type, text: m[2], executable: !(type === "application/ld+json" || type === "application/json") });
  }
  return out;
}

// Inline event handler attributes (onclick=...) and javascript: addresses: a hash cannot allow these, so a page may not have them.
export function inlineHandlers(html) {
  const found = [];
  for (const m of html.matchAll(/<[a-z][^<>]*?\s(on[a-z]+)\s*=/gi)) found.push(m[1].toLowerCase());
  for (const m of html.matchAll(/(?:href|src|action)\s*=\s*["']?\s*javascript:/gi)) found.push(m[0]);
  return found;
}

// The Content-Security-Policy line of the /* rule in a _headers file.
export function siteCsp(headersText) {
  const m = headersText.match(/^\/\*\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+Content-Security-Policy:[ \t]*([^\n]*)/m);
  if (!m) throw new Error("csp-hashes: no Content-Security-Policy in the /* rule of _headers");
  return m[1].trim();
}

// The sources of one directive in a policy string (empty list when the directive is missing).
export function directive(csp, name) {
  for (const part of csp.split(";")) {
    const words = part.trim().split(/\s+/);
    if (words[0] === name) return words.slice(1);
  }
  return [];
}
