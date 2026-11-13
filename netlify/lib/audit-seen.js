// netlify/lib/audit-seen.js (served by netlify/functions/api.js at POST /api/audit-seen and POST /api/colleague-check)
// 13 Nov 2026 (owner decision): the free EPIC audit form asks /api/audit-seen when the visitor types a company website.
// The answer says only whether someone from that company domain ran an audit in the last 90 days, and how many days ago.
// It never holds the earlier text. /api/colleague-check shows the earlier GTM challenge only after a work email check at
// that domain; it answers 404 while the check is off (no email sender is set up yet).
import { getStore } from "@netlify/blobs";
import { STORE, domainOf, findRecent, mailSender, colleagueCheckOn, startCheck, finishCheck } from "./audit-memory.js";
import { jsonInert } from "./escape-inputs.js";

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000" };
const reply = (status, obj) => new Response(jsonInert(JSON.stringify(obj)), { status, headers: HEADERS });

async function body(req) {
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > 2000) return null;
  try {
    const j = JSON.parse(text);
    return j && typeof j === "object" && !Array.isArray(j) ? j : null;
  } catch {
    return null;
  }
}

export function defaults() {
  const env = process.env;
  let store = null;
  try {
    store = getStore(STORE);
  } catch {
    store = null;  // outside Netlify (local runs): no store, so nothing is found and nothing is shown
  }
  return { store, env, send: mailSender(env), now: new Date() };
}

export async function auditSeen(req, deps) {
  deps = deps || defaults();
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  const b = await body(req);
  if (!b) return reply(400, { error: "Send a JSON object" });
  const domain = domainOf(b.website);
  if (!domain) return reply(200, { seen: false });
  let recent = null;
  try {
    recent = await findRecent(deps.store, domain, deps.now);
  } catch {
    recent = null;
  }
  if (!recent) return reply(200, { seen: false });
  return reply(200, { seen: true, days_ago: recent.days_ago, check: colleagueCheckOn(deps.env, deps.send) });
}

export async function colleagueCheck(req, deps) {
  deps = deps || defaults();
  if (!colleagueCheckOn(deps.env, deps.send)) return reply(404, { error: "The work email check is not switched on." });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  const b = await body(req);
  if (!b) return reply(400, { error: "Send a JSON object" });
  try {
    const out = b.step === "code" ? await finishCheck(deps, { token: b.token, code: b.code })
      : await startCheck(deps, { website: b.website, email: b.email });
    return reply(out.error ? 400 : 200, out);
  } catch {
    return reply(500, { error: "The check could not be completed. Please try again." });
  }
}
