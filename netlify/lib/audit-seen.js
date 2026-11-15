import { readLimitedText } from "./read-limited-text.js";
import { getStore } from "@netlify/blobs";
import { STORE, mailSender, colleagueCheckOn, startCheck, finishCheck } from "./audit-memory.js";
import { jsonInert } from "./escape-inputs.js";

const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000" };
const reply = (status, obj) => new Response(jsonInert(JSON.stringify(obj)), { status, headers: HEADERS });

async function body(req) {
  const text = await readLimitedText(req, 2000);
  if (text === null) return null;
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
  // Offer the same verification flow regardless of past audit activity.
  return reply(200, { seen: false, check: colleagueCheckOn(deps.env, deps.send) });
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
