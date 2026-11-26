// 13 Nov 2026 (owner decision, GTM Alpha audit): audits from the free EPIC audit form are kept for 90 days, then deleted
// automatically (netlify/functions/audit-prune.js runs pruneAudits daily). This file imports no store library, so the
// site build (scripts/build-site.mjs reads premium-audit.js) runs without node_modules; callers pass the store. Deletion on request stays within 30 days.
// A record is kept only when the visitor gives a company website whose domain is a company domain (never a free mail
// domain or a shared host). It holds the company domain (in the key), the day (never the time), the GTM challenge and,
// only when a colleague confirmed a work email, a keyed hash of that email. Nothing else from the form is kept.
// A later visitor from the same domain sees only that an audit was run N days ago. The earlier GTM challenge is shown only
// after a work email check at that domain (the colleague check), which is OFF until the owner picks an email sender.
import { randomUUID, randomInt, createHmac, timingSafeEqual } from "node:crypto";

export const KEEP_DAYS = 90;
export const STORE = "audit-memory";
const DAY = 86400000;

// Free mail domains never count as a company domain (any country ending for the big providers).
const FREE_MAIL = /^(?:gmail|googlemail|yahoo|ymail|rocketmail|hotmail|outlook|live|msn|windowslive|aol|icloud|me|mac|proton|protonmail|pm|zoho|zohomail|yandex|gmx|mail|email|inbox|rediffmail|rediff|tutanota|tuta|fastmail|hey|hushmail|qq|163|126|sina|naver|daum|web|t-online|orange|free|laposte|libero|virgilio|seznam|wp|o2|interia|onet|bigpond|btinternet|sky|comcast|verizon|att|sbcglobal|cox|earthlink|duck|skiff|mailfence|posteo|runbox|lycos|excite|juno|optonline|charter|shaw|rogers|telus|sympatico)(?:\.(?:com?|net|org))?\.[a-z]{2,3}$/;
// Shared hosts: many companies use the same host, so the host says nothing about which company it is.
const SHARED = new Set(["linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com", "github.com", "gitlab.com",
  "medium.com", "substack.com", "youtube.com", "google.com", "sites.google.com", "notion.site", "wordpress.com", "blogspot.com",
  "wixsite.com", "squarespace.com", "webflow.io", "netlify.app", "vercel.app", "github.io", "carrd.co", "linktr.ee",
  "example.com", "example.org", "example.net", "localhost", "crunchbase.com", "angel.co", "wellfound.com", "producthunt.com"]);

export function isFreeMail(domain) {
  return FREE_MAIL.test(String(domain || "").toLowerCase());
}

// The company domain of a website address: its host in lower case without "www.". null when it is not a usable company
// domain (not a web address, an IP address, a free mail domain or a shared host).
export function domainOf(website) {
  let host;
  try {
    const u = new URL(String(website || "").trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    host = u.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
  host = host.replace(/^www\d*\./, "");
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(host)) return null;  // also refuses IP addresses
  if (isFreeMail(host) || SHARED.has(host)) return null;
  return host;
}

// The domain of an email address, or null.
export function emailDomain(email) {
  const m = /^[^\s@<>"',;]{1,64}@([a-z0-9.-]{3,253})$/i.exec(String(email || "").trim());
  return m ? m[1].toLowerCase() : null;
}

// A work email qualifies only when its domain equals the company domain and is not a free mail domain.
export function emailMatches(email, domain) {
  const d = emailDomain(email);
  return Boolean(d && domain && d === domain && !isFreeMail(d) && !SHARED.has(d));
}

const dayOf = (now) => new Date(now).toISOString().slice(0, 10);
// The first day that is kept: records dated before it are older than KEEP_DAYS.
export function cutoffDay(now = new Date()) {
  return dayOf(new Date(now).getTime() - KEEP_DAYS * DAY);
}
const keyDay = (key) => String(key).split("/")[1] || "";
const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// The latest record for a domain from the last 90 days: { key, day, days_ago } (no text), or null.
export async function findRecent(store, domain, now = new Date()) {
  if (!domain) return null;
  const cutoff = cutoffDay(now);
  const { blobs } = await store.list({ prefix: domain + "/" });
  let best = null;
  for (const { key } of blobs) {
    const day = keyDay(key);
    if (!String(key).startsWith(domain + "/") || !isDay(day) || day < cutoff) continue;
    if (!best || day > best.day) best = { key, day };
  }
  if (!best) return null;
  return { ...best, days_ago: Math.max(0, Math.round((Date.parse(dayOf(now)) - Date.parse(best.day)) / DAY)) };
}

// The earlier GTM challenge of a record. Call this only after a work email check passed.
export async function challengeOf(store, key) {
  const rec = await store.get(key, { type: "json" });
  return rec && typeof rec.challenge === "string" ? rec.challenge : null;
}

// Keeps one audit: the day, the GTM challenge and, after a colleague check, the keyed email hash.
export async function recordAudit(store, { domain, challenge, emailHash }, now = new Date()) {
  if (!domain || !challenge) return null;
  const day = dayOf(now);
  const key = `${domain}/${day}/${randomUUID()}`;
  const rec = { day, challenge: String(challenge).slice(0, 4000) };
  if (emailHash) rec.email_hash = emailHash;
  await store.setJSON(key, rec);
  return key;
}

// Deletes every record dated more than 90 days ago (with the email hash it holds).
export async function pruneAudits(store, now = new Date()) {
  const cutoff = cutoffDay(now);
  const { blobs } = await store.list();
  let deleted = 0;
  for (const { key } of blobs) {
    const day = keyDay(key);
    if (isDay(day) && day < cutoff) {
      await store.delete(key);
      deleted += 1;
    }
  }
  return { cutoff, deleted };
}

// ---- Colleague check (step 3). OFF unless AUDIT_COLLEAGUE_CHECK is "on", AUDIT_CHECK_SECRET is set and an email sender
// exists. No email sender is set up for this site (13 Nov 2026), so mailSender returns null and the check stays off.
export function mailSender(/* env */) {
  return null;  // The owner picks an email sender; wire it here as async ({ to, subject, text }) => void.
}

export function colleagueCheckOn(env = process.env, send = mailSender(env)) {
  return env.AUDIT_COLLEAGUE_CHECK === "on" && typeof env.AUDIT_CHECK_SECRET === "string" &&
    env.AUDIT_CHECK_SECRET.length >= 32 && typeof send === "function";
}

const b64 = (s) => Buffer.from(s, "utf8").toString("base64url");
const mac = (secret, s) => createHmac("sha256", secret).update(s, "utf8").digest("base64url");

// A keyed hash of the email (the address itself is never kept).
export function emailHash(secret, email) {
  return mac(secret, "email|" + String(email).trim().toLowerCase());
}

export function sign(secret, payload) {
  const body = b64(JSON.stringify(payload));
  return body + "." + mac(secret, body);
}

export function unsign(secret, token, now = Date.now()) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(mac(secret, body));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return p && typeof p.exp === "number" && p.exp > now ? p : null;
  } catch {
    return null;
  }
}

// Step 1 of the check: email a six digit code. Returns { token } or { error }.
export async function startCheck({ store, env, send, now = new Date() }, { website, email }) {
  const domain = domainOf(website);
  if (!domain) return { error: "Give your company website first. Free mail and shared hosts cannot be checked." };
  if (!emailMatches(email, domain)) return { error: "Use your work email at " + domain + ". Free mail addresses do not qualify." };
  if (!(await findRecent(store, domain, now))) return { error: "There is no earlier audit to compare." };
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const h = emailHash(env.AUDIT_CHECK_SECRET, email);
  await send({ to: String(email).trim(), subject: "Your GTM Alpha check code",
    text: "Your code is " + code + ". It works for 10 minutes. If you did not ask for it, ignore this email." });
  const exp = new Date(now).getTime() + 10 * 60000;
  return { token: sign(env.AUDIT_CHECK_SECRET, { d: domain, h, c: mac(env.AUDIT_CHECK_SECRET, "code|" + code + "|" + domain + "|" + h), exp }) };
}

// Step 2 of the check: the code is right, so the earlier GTM challenge is returned with a token that lets the next
// audit keep the email hash. Returns { challenge, days_ago, verified } or { error }.
export async function finishCheck({ store, env, now = new Date() }, { token, code }) {
  const p = unsign(env.AUDIT_CHECK_SECRET, token, new Date(now).getTime());
  if (!p || p.v || typeof p.c !== "string") return { error: "The check has expired. Start again." };
  const want = Buffer.from(mac(env.AUDIT_CHECK_SECRET, "code|" + String(code || "").trim() + "|" + p.d + "|" + p.h));
  const got = Buffer.from(p.c);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return { error: "That code is not right." };
  const recent = await findRecent(store, p.d, now);
  const challenge = recent ? await challengeOf(store, recent.key) : null;
  if (!challenge) return { error: "There is no earlier audit to compare." };
  const verified = sign(env.AUDIT_CHECK_SECRET, { d: p.d, h: p.h, v: 1, exp: new Date(now).getTime() + 60 * 60000 });
  return { challenge, days_ago: recent.days_ago, verified };
}

// The email hash a finished check carries, when it matches the domain of this audit.
export function verifiedHash(env, token, domain, now = Date.now()) {
  if (!colleagueCheckOn(env, () => {}) || !token) return null;
  const p = unsign(env.AUDIT_CHECK_SECRET, token, now);
  return p && p.v === 1 && p.d === domain ? p.h : null;
}
