// Tests for the API paths served by netlify/functions/api.js: the free Premium Audit form (owner decision 3),
// the trimmed health check and the own-origin rule of the audit API. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import api, { config } from "../netlify/functions/api.js";
import { checkAnswers } from "../netlify/lib/premium-audit.js";
import { allowedOrigin } from "../netlify/lib/site-origin.js";

const BASE = "https://gtmalpha.gtmhelix.com";
const FORM = {
  client_name: "Test Person", client_designation: "Founder", company_name: "TEST Company <b>", industry: "SaaS",
  company_description: "TEST data: a B2B tool for finance teams.", gtm_challenge: "TEST data: long sales cycles.",
  business_stage: "Growth", team_size: "20", monthly_budget: "5000", primary_focus: "Customer acquisition",
  company_website: "https://example.com", linkedin_url: "", acv_band: "5k_to_50k", deal_cycle_band: "14_to_90_days",
  nrr_band: "", tam_band: "", deal_source: "inbound", geography: "india", self_serve: "no", confirm_consultation: "on",
  leave_this_empty: ""
};
const post = (path, body, type = "application/x-www-form-urlencoded") =>
  api(new Request(BASE + path, { method: "POST", headers: { "content-type": type }, body }), {});

test("the function serves exactly the three API paths, with one rate limit", () => {
  assert.deepEqual(config.path, ["/api/epic-audit", "/api/premium-audit", "/api/health"]);
  assert.deepEqual(config.rateLimit, { windowSize: 60, windowLimit: 30, aggregateBy: ["ip", "domain"] });
});

test("a complete form gets the report page, with a policy that allows only its own script", async () => {
  const res = await post("/api/premium-audit", new URLSearchParams(FORM).toString());
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  const html = await res.text();
  assert.ok(html.includes("TEST Company &lt;b&gt;"), "company name is shown, escaped");
  assert.ok(!html.includes("TEST Company <b>"));
  assert.ok(!/Valued Client|undefined|NaN/.test(html));
  assert.ok(!html.includes("onclick="), "no inline event handlers");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const hash = createHash("sha256").update(scripts[0][1], "utf8").digest("base64");
  const csp = res.headers.get("content-security-policy");
  assert.ok(csp.includes(`'sha256-${hash}'`), "the one inline script is allowed by its hash");
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), "no unsafe-inline scripts");
  assert.ok(csp.includes("frame-ancestors 'none'"));
});

test("JSON posts work the same way", async () => {
  const res = await post("/api/premium-audit", JSON.stringify(FORM), "application/json");
  assert.equal(res.status, 200);
});

test("the honeypot field refuses the request", async () => {
  const res = await post("/api/premium-audit", new URLSearchParams({ ...FORM, leave_this_empty: "http://spam.example" }).toString());
  assert.equal(res.status, 400);
  assert.ok(!(await res.text()).includes("EPIC"));
});

test("missing and unexpected answers are listed, and no report is built", async () => {
  const res = await post("/api/premium-audit", new URLSearchParams({ company_name: "X", industry: "Crypto", team_size: "7" }).toString());
  assert.equal(res.status, 400);
  const html = await res.text();
  for (const s of ["Your name is required.", "Industry has a value the form does not offer.", "Team size has a value the form does not offer.", "The confirmation box is required."]) {
    assert.ok(html.includes(s), s);
  }
  const c = checkAnswers({ ...FORM, company_website: "javascript:alert(1)" });
  assert.deepEqual(c.problems, ["Company website must be a web address starting with http:// or https://."]);
  assert.deepEqual(checkAnswers({ ...FORM, company_name: "x".repeat(201) }).problems, ["Company name is longer than 200 characters."]);
});

test("fields the form does not have are dropped", () => {
  const c = checkAnswers({ ...FORM, email: "a@b.c", tier: "enterprise", __proto__x: "y" });
  assert.equal(c.clean.email, undefined);
  assert.equal(c.clean.tier, undefined);
});

test("over-long bodies and GET requests are refused", async () => {
  assert.equal((await post("/api/premium-audit", "a=" + "x".repeat(33000))).status, 413);
  assert.equal((await api(new Request(BASE + "/api/premium-audit"), {})).status, 405);
});

test("health answers without environment, memory or payment details", async () => {
  const res = await api(new Request(BASE + "/api/health"), {});
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.deepEqual(Object.keys(j).sort(), ["service", "status", "timestamp", "version"]);
  assert.equal((await api(new Request(BASE + "/api/health", { method: "POST" }), {})).status, 405);
});

test("the audit API allows browsers only from the site's own addresses", async () => {
  const pre = (origin) => api(new Request(BASE + "/api/epic-audit", { method: "OPTIONS", headers: { origin } }), {});
  assert.equal((await pre("https://gtmalpha.gtmhelix.com")).headers.get("access-control-allow-origin"), "https://gtmalpha.gtmhelix.com");
  assert.equal((await pre("https://gtmalpha.netlify.app")).headers.get("access-control-allow-origin"), "https://gtmalpha.netlify.app");
  assert.equal((await pre("https://evil.example.com")).headers.get("access-control-allow-origin"), null);
  assert.equal(allowedOrigin({ headers: new Headers() }), null);
});

test("other paths answer 404", async () => {
  assert.equal((await api(new Request(BASE + "/api/create-payment", { method: "POST" }), {})).status, 404);
});
