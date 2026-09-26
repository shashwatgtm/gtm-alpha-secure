// netlify/lib/premium-audit.js (served by netlify/functions/api.js at POST /api/premium-audit)
// Owner decision 3 (25 September 2026): while GTM Alpha is free, the Premium Audit form delivers the report directly,
// with no PayPal step. The form posts here (it works with JavaScript off, and the answers never go into a URL); the
// answers are checked, the report is built in this request by netlify/lib/analyze.js, and the report page is returned.
// Nothing is stored, logged or sent anywhere else.
import { createHash } from "node:crypto";
import analyze from "./analyze.js";

const MAX_BODY = 32000;
const HONEYPOT = "leave_this_empty";

// The form's own fields: [label, maximum length, allowed values or null for free text]
const FIELDS = {
  client_name: ["Your name", 200, null],
  client_designation: ["Your role or title", 200, null],
  company_name: ["Company name", 200, null],
  industry: ["Industry", 60, ["Technology", "SaaS", "E-commerce", "Healthcare", "Finance", "Education", "Manufacturing", "Retail",
    "Logistics", "Media", "Consulting", "Real Estate", "Travel", "Other"]],
  company_description: ["Company description", 4000, null],
  gtm_challenge: ["Primary GTM challenge", 4000, null],
  business_stage: ["Business stage", 60, ["Pre-launch", "MVP", "Early Traction", "Growth", "Scale", "Mature"]],
  team_size: ["Team size", 10, ["1", "5", "10", "20", "50", "100", "200"]],
  monthly_budget: ["Monthly GTM budget", 10, ["500", "1000", "5000", "10000", "25000", "50000", "100000"]],
  primary_focus: ["Primary focus area", 200, null],
  company_website: ["Company website", 300, "url"],
  linkedin_url: ["LinkedIn URL", 300, "url"],
  acv_band: ["Average contract value", 30, ["under_5k", "5k_to_50k", "over_50k"]],
  deal_cycle_band: ["Deal cycle", 30, ["under_14_days", "14_to_90_days", "over_90_days"]],
  nrr_band: ["Net revenue retention", 30, ["under_100", "100_to_120", "over_120"]],
  tam_band: ["Addressable accounts", 30, ["under_500", "500_to_10000", "over_10000"]],
  deal_source: ["Main deal source", 30, ["referrals", "outbound", "partnerships", "inbound", "mixed"]],
  geography: ["Primary market", 30, ["india", "us_eu", "middle_east", "apac", "global"]],
  self_serve: ["Self-serve sign-up", 10, ["yes", "no"]],
  confirm_consultation: ["The confirmation box", 10, ["on"]]
};
// The same fields the form marks as required.
const REQUIRED = ["client_name", "client_designation", "company_name", "industry", "company_description", "gtm_challenge",
  "business_stage", "team_size", "monthly_budget", "confirm_consultation"];

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PAGE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

function messagePage(status, title, lines) {
  const csp = "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
  const body = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex">
<title>${esc(title)} | GTM Alpha</title><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/brand.css"></head>
<body><main class="hx-wrap hx-message"><h1>${esc(title)}</h1>
<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<p><a href="/consultation">Back to the free audit form</a> (use your browser's Back button to keep your answers)</p></main></body></html>`;
  return new Response(body, { status, headers: { ...PAGE_HEADERS, "Content-Security-Policy": csp } });
}

async function readInput(req) {
  const text = await req.text();
  if (text.length > MAX_BODY) return { error: "too_large" };
  const type = (req.headers.get("content-type") || "").toLowerCase();
  if (type.includes("application/json")) {
    try {
      const j = JSON.parse(text);
      return { data: j && typeof j === "object" && !Array.isArray(j) ? j : {} };
    } catch {
      return { error: "bad_json" };
    }
  }
  return { data: Object.fromEntries(new URLSearchParams(text)) };
}

// Checks the answers. Returns { clean } with only the form's own fields, or { problems } to show the visitor.
export function checkAnswers(d) {
  const clean = {};
  const problems = [];
  for (const [f, [label, cap, allowed]] of Object.entries(FIELDS)) {
    if (d[f] === undefined || d[f] === null) continue;
    const v = String(d[f]).trim();
    if (!v) continue;
    if (v.length > cap) problems.push(`${label} is longer than ${cap} characters.`);
    else if (allowed === "url" && !/^https?:\/\/[^\s<>"']+$/i.test(v)) problems.push(`${label} must be a web address starting with http:// or https://.`);
    else if (Array.isArray(allowed) && !allowed.includes(v)) problems.push(`${label} has a value the form does not offer.`);
    else clean[f] = v;
  }
  for (const f of REQUIRED) {
    if (!clean[f] && !problems.some((p) => p.startsWith(FIELDS[f][0] + " "))) problems.push(`${FIELDS[f][0]} is required.`);
  }
  return problems.length ? { problems } : { clean };
}

// The inputs analyze.js reads, under the names it reads them.
export function reportInput(c) {
  return {
    client_name: c.client_name,
    client_designation: c.client_designation,
    company_name: c.company_name,
    industry: c.industry,
    company_description: c.company_description,
    gtm_challenge: c.gtm_challenge,
    business_stage: c.business_stage,
    team_size: c.team_size,
    budget_range: c.monthly_budget,
    specific_focus: c.primary_focus || "",
    company_website: c.company_website || "",
    linkedin_url: c.linkedin_url || "",
    acv_band: c.acv_band || "",
    deal_cycle_band: c.deal_cycle_band || "",
    nrr_band: c.nrr_band || "",
    tam_band: c.tam_band || "",
    deal_source: c.deal_source || "",
    geography: c.geography || "",
    self_serve: c.self_serve || ""
  };
}

export default async (req) => {
  if (req.method !== "POST") {
    return messagePage(405, "Use the form", ["Open the free audit form and press the button to get your report."]);
  }
  const got = await readInput(req);
  if (got.error === "too_large") return messagePage(413, "Your answers are too long", ["Please shorten them and try again."]);
  if (got.error) return messagePage(400, "The request could not be processed", ["Please use the form and try again."]);
  const d = got.data;
  if (d[HONEYPOT] !== undefined && String(d[HONEYPOT]).trim() !== "") {
    return messagePage(400, "The request could not be processed", ["Please use the form and try again."]);
  }
  const checked = checkAnswers(d);
  if (checked.problems) return messagePage(400, "Please check your answers", checked.problems);

  let report = null;
  try {
    const res = await analyze({ method: "POST", json: async () => reportInput(checked.clean) }, {});
    const out = await res.json();
    report = out && out.analysis && out.analysis.html_report;
  } catch {
    report = null;
  }
  if (!report) return messagePage(500, "The report could not be built", ["Please try again in a minute. If it keeps failing, email shashwat@gtmhelix.com."]);

  // The report has one inline script (the PDF button): the policy allows exactly that script, by its hash, and the
  // PDF library from cdnjs (loaded with a Subresource Integrity hash). Styles are inline; fonts come from this site.
  const hashes = [...report.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => "'sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
  const csp = ["default-src 'none'", `script-src ${hashes.join(" ")} https://cdnjs.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'", "font-src 'self'",
    "img-src 'self' data: blob:", "connect-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'"].join("; ");
  return new Response(report, { status: 200, headers: { ...PAGE_HEADERS, "Content-Security-Policy": csp } });
};
