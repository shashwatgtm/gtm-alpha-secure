// netlify/lib/company-read.js
// Run 22 (writer alpha-w1): what the three GTM Alpha tools read from ALL the text a user gave (the challenge or product description, the
// industry, the company name, the channels and the numbers), and where each fact was read from. Pure text work: no network, no file, no
// environment, no logging. The answer says what it read in one short line each and says plainly what it could not tell.
//
// What is read here: the product (what is sold and its use cases), who buys (segments, roles, teams), the problem described, the business
// model (and from which words), the country or region, and the sector and kind of company (all product words counted together; a close
// call names both readings). Nothing is invented: every phrase comes from the user's own text or from the shared sector file
// (netlify/lib/verticals.js). The EPIC scores are not decided here (D80): a country read from the text is only shown, with what setting
// the input would do, never applied.

import { VERTICALS, SUBTYPES, explainSector, detectModel, MODEL_NAME, SECTOR_MODEL } from "./verticals.js";

const clean = (t) => (typeof t === "string" ? t.trim() : "");
const lc = (t) => String(t || "").toLowerCase();
const stripEnd = (t) => String(t || "").replace(/[\s.;:,]+$/, "");
const lowerFirst = (t) => (t && !/^[A-Z]{2,}/.test(t) && !/^[A-Z][a-z]+[A-Z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

export function joinList(items) {
  const a = (items || []).filter(Boolean);
  if (a.length <= 1) return a.join("");
  if (a.length === 2) return a[0] + " and " + a[1];
  return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
}

// ---------------------------------------------------------------- text structure
// The safeguard at the entry point wraps a whole text in curly quotes when it looks like an instruction. Such a text is the user's own words,
// shown as typed, and nothing is built from its parts.
const isQuoted = (t) => /[“”\[\]‹›]/.test(t);

// Depth of round and square brackets at each character, so a comma inside "(ocean, air, rail)" is never a list break.
function depths(s) {
  const out = new Array(s.length);
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(" || ch === "[") d++;
    out[i] = d;
    if ((ch === ")" || ch === "]") && d > 0) d--;
  }
  return out;
}
function splitTop(s, re) {
  const d = depths(s);
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  const parts = [];
  let last = 0;
  for (const m of s.matchAll(g)) {
    if (d[m.index] === 0) { parts.push(s.slice(last, m.index)); last = m.index + m[0].length; }
  }
  parts.push(s.slice(last));
  return parts;
}
function lastTop(s, re) {
  const d = depths(s);
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let hit = null;
  for (const m of s.matchAll(g)) { if (d[m.index] === 0) hit = { index: m.index, end: m.index + m[0].length, text: m[0] }; }
  return hit;
}
function firstTop(s, re) {
  const d = depths(s);
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  for (const m of s.matchAll(g)) { if (d[m.index] === 0) return { index: m.index, end: m.index + m[0].length, text: m[0] }; }
  return null;
}
const dropParens = (t) => t.replace(/\s*\((?:page claim|page claims|about page|home page|the page[^)]*|implied[^)]*)\)/gi, "");
const sentencesOf = (t) => t.split(/(?<=[.!?])\s+(?=[A-Z“"(0-9])/).map((s) => s.trim()).filter(Boolean);

const PAIN_START = /^(?:our\s+)?(?:buyers|customers|clients|users)['’]?\s+(?:pain|problem|challenge)s?\s*(?:is|are)?\s*[:\-]?\s*/i;
const PAIN_WORDS = /\b(?:pain|problems?|struggl\w+|challenge|trouble|stuck|too slow|cannot|can't|unable)\b/i;
const ASK_WORDS = /\b(?:we want|we need|we'd like|we would like|help us|help me|looking for|please|an epic view|want help|need help)\b/i;
const SELL_LEAD = /^(?:(?:we|our company|the company|[A-Z][\w.&'-]*(?:\s+[A-Z][\w.&'-]*){0,3})\s+)?(?:sells?|offers?|provides?|builds?|makes?|runs?|operates?|delivers?|supplies|is|are|helps?|enables?)\s+/;
// " to X" is the buyer marker unless the next word starts a verb phrase ("a way to save time") or a number ("10 to 10,000 parcels").
const NOT_BUYER_AFTER = /^(?:be|help|get|make|ship|manage|keep|run|build|use|reduce|increase|improve|move|grow|find|connect|turn|do|see|handle|scale|work|send|save|cut|win|close|start|accept|pay|take|bring|let|give|put|set|stop|avoid|track|check|plan|create|launch|sell|buy|go|reach|power|serve|support|empower|enable|deliver|ensure|offer|provide|simplify|transform|streamline|automate|optimi[sz]e|replace|combine|unify|centrali[sz]e|lower|boost|drive|speed|accelerate|protect|secure|detect|prevent|monitor|analy[sz]e|understand|learn|train|test|deploy|operate|process|collect|verify|integrate|safeguard|defend|simplif\w+|\d)\b/i;
const NOT_BUYER_BEFORE = /(?:want|wants|need|needs|able|how|way|ways|help|helps|helping|aim|aims|designed|used|so|order|ready|right|time|lets|let)$/i;
// "split payouts to sellers": a noun that something is sent to. The phrase after "to" is read as buyers only when it is a real noun group ending in a buyer word.
const TRANSFER_NOUN = /(?:payouts?|payments?|messages?|emails?|notifications?|access|alerts?|reports?|updates?|loans?|refunds?|transfers?|credits?|discounts?|links?|answers?|routes?|orders?|invoices?|statements?|connections?|integrations?|delivery|deliveries|data|content|information|insights?|recommendations?|offers?|quotes?|bills?|funds?|money|requests?|tickets?)$/i;
const FEATURE_NOUN = /\b(?:payouts?|payments?|messages?|emails?|notifications?|reports?|updates?|loans?|refunds?|transfers?|credits?|discounts?|links?|answers?|routes?|orders?|invoices?|statements?|settlements?|data|content|insights?|recommendations?|alerts?|quotes?|bills?|funds?|money|requests?|tickets?)\b/i;
const nounGroupEndsInBuyer = (t) => {
  const g = t.split(/\s(?:in|at|with|across|that|who|which|from)\s|[,;.(:]/)[0].trim();
  return g.split(/\s+/).length >= 2 && BUYER_LEX.test(g) && !FEATURE_NOUN.test(g);
};

// A buyer phrase must name somebody who buys: one of these words within its first eight words. Anything else is not read as a buyer.
const BUYER_LEX = /\b(?:merchants?|marketplaces?|retailers?|brands?|compan(?:y|ies)|businesses|business|enterprises?|banks?|insurers?|lenders?|fintechs?|teams?|developers?|engineers?|operators?|providers?|shippers?|carriers?|fleets?|manufacturers?|sellers?|startups?|scale-?ups?|organi[sz]ations?|agencies|institutions?|customers?|clients?|leaders?|heads?|CIOs?|CTOs?|CFOs?|COOs?|CISOs?|CMOs?|CROs?|professionals?|owners?|managers?|directors?|founders?|consumers?|shoppers?|students?|schools?|farmers?|drivers?|hotels?|restaurants?|stores?|shops?|outlets?|distributors?|wholesalers?|dealers?|contractors?|builders?|landlords?|publishers?|creators?|firms?|studios?|factories|utilities|telcos?|governments?|ministries|SMBs?|SMEs?|mid-market|Fortune \d+|users?|people|accounts?|individuals?|freelancers?|partners?|resellers?|integrators?|vendors?|suppliers?|buyers?|practitioners?|specialists?|analysts?|marketers?|recruiters?|employers?|workers?|staff|organisations?|institutions?)\b/i;
const looksLikeBuyers = (t) => !/^(?:company|the company|your company|the tools|its|their|our|your|each|every|all|any)\b/i.test(t) && BUYER_LEX.test(t.split(/\s+/).slice(0, 11).join(" "));
const cleanPhrase = (t) => !/\b(?:so|that|which|who|whose|can|will|where|when|while|because|using|by|via|with)\b/i.test(t);
function candidatesTo(s) {
  const d = depths(s);
  const out = [];
  const toRe = /\s(to)\s+(?=\S)/gi;
  for (const m of s.matchAll(toRe)) {
    if (d[m.index] !== 0) continue;
    const next = s.slice(m.index + m[0].length);
    const before = s.slice(0, m.index);
    const prev = before.split(/\s+/).pop() || "";
    if (NOT_BUYER_AFTER.test(next) || NOT_BUYER_BEFORE.test(prev) || /\bfrom\s+(?!(?:the|a|an|your|our|its|one)\b)[^,;:]{1,40}$/i.test(before) || !looksLikeBuyers(next)) continue;
    if (TRANSFER_NOUN.test(prev) && !nounGroupEndsInBuyer(next)) continue;
    out.push({ index: m.index, end: m.index + m[0].length });
  }
  return out;
}
const lastCandidate = (s) => { const c = candidatesTo(s); return c.length ? c[c.length - 1] : null; };
function otherMarker(s) {
  const alt = lastTop(s, /\s(?:serving|serves|used by|sold to|aimed at|targeting|popular with|adopted by)\s+/i);
  if (alt && looksLikeBuyers(s.slice(alt.end))) return alt;
  return null;
}
function forMarker(s) {
  const d = depths(s);
  const forRe = /\sfor\s+(?=(\S+))/gi;
  for (const m of s.matchAll(forRe)) {
    if (d[m.index] !== 0) continue;
    if (/^[a-z]{3,}ing$/i.test(m[1]) || /^(?:growing|scaling)$/i.test(m[1])) continue;
    if (!looksLikeBuyers(s.slice(m.index + m[0].length))) continue;
    return { index: m.index, end: m.index + m[0].length };
  }
  return null;
}
// "X to buyers: features" (the buyers come before the colon), "X: features to buyers" (after the list) or "X for buyers".
function splitSell(sentence, company) {
  let s = stripEnd(dropParens(sentence));
  if (company && company.length > 1) s = s.replace(new RegExp("(?<![\\w])" + company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w])", "g"), " ").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/(?:^|\s)(?:from|by|of|at)\s*(?=[,.;:]|$)/gi, "").trim();
  s = s.replace(/^[,;:\s]+/, "").replace(SELL_LEAD, "").replace(/^[,;:\s]+/, "");
  const colon = firstTop(s, /:\s*/);
  let head, features = "", buyers = "";
  if (colon) {
    const a = s.slice(0, colon.index), b = s.slice(colon.end);
    const ma0 = lastCandidate(a);
    const ma = ma0 && cleanPhrase(a.slice(ma0.end)) ? ma0 : null;
    const mb = lastCandidate(b) || otherMarker(b);
    if (ma) { head = a.slice(0, ma.index); buyers = a.slice(ma.end); features = b; }
    else if (mb) { head = a; features = b.slice(0, mb.index); buyers = b.slice(mb.end); }
    else {
      head = a; features = b;
      const mf = forMarker(a) || otherMarker(a);
      if (mf) buyers = a.slice(mf.end);
    }
  } else {
    const m = lastCandidate(s) || otherMarker(s) || forMarker(s);
    const left = m ? s.slice(0, m.index) : s;
    buyers = m ? s.slice(m.end) : "";
    // "a cloud platform for testing apps, with test automation and visual testing": what follows the first top-level "with" or "including" lists the parts
    const w = left.length > 70 ? firstTop(left, /\s(?:with|including|plus)\s+/i) : null;
    head = w ? left.slice(0, w.index) : left;
    features = w ? left.slice(w.end) : "";
  }
  const semi = firstTop(buyers, /;/);
  if (semi) buyers = buyers.slice(0, semi.index);
  return { head: stripEnd(head), features: stripEnd(features), buyers: stripEnd(buyers) };
}

function chunkList(text) {
  const raw = splitTop(text, /\s*[,;]\s*/).map((x) => stripEnd(x).trim()).filter(Boolean);
  const withs = raw.map((x) => /^with\s/i.test(x));
  const parts = raw.map((x) => x.replace(/^(?:and|or|plus|including|with)\s+/i, "").trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i];
    const nx = parts[i + 1];
    // "speech, translation and document models": a one word stub followed by a part that continues the coordination is one phrase
    if (nx !== undefined && /^[a-z]+$/.test(p) && /^[a-z]+\s+and\s+\S+\s+\S/i.test(nx)) { p = p + ", " + nx; i++; }
    out.push(withs[i] ? Object.assign(new String(p), { rawWith: true }) : p);
  }
  return out;
}

const HOW_DELIVERED = /^(?:delivered|run|sold|available|powered|built|deployed|offered|priced|billed|hosted)\b/i;
const goodChunk = (c) => c.length >= 3 && c.length <= 90 && !/[“”<>{}\[\]]/.test(c) && (c.match(/\(/g) || []).length === (c.match(/\)/g) || []).length;

// ---------------------------------------------------------------- roles and teams named in the text
const ROLE_ABBR = /\b(?:CIOs?|CTOs?|CFOs?|COOs?|CISOs?|CMOs?|CROs?|CEOs?|CPOs?|CDOs?|CHROs?|CCOs?)\b/g;
const ROLE_HEAD = /\b(?:heads?|directors?|leaders?|vice presidents?|VPs?) of [a-z][a-z &-]{2,34}?(?=\s+(?:at|in|who|that|across|of|for|to|and|or)\b|[,.;:)]|$)/gi;
const ROLE_PLAIN = /\b(?:chief [a-z]+ officers?|founders?|developers?|software engineers?|engineering (?:leaders?|managers?)|product (?:managers?|leaders?)|security (?:leaders?|engineers?)|platform (?:owners?|engineers?)|finance (?:leaders?)|operations (?:leaders?|heads?)|procurement (?:leaders?|heads?)|business leaders?|technology leaders?)\b/gi;
function rolesIn(text) {
  const found = new Map();
  for (const re of [ROLE_ABBR, ROLE_HEAD, ROLE_PLAIN]) {
    const g = new RegExp(re.source, re.flags);
    for (const m of text.matchAll(g)) { const k = lc(m[0]); if (!found.has(k)) found.set(k, m[0]); }
  }
  return [...found.values()].slice(0, 6);
}
const TEAM_LIST = /\b(?:across|in|between|for)\s+((?:(?!\b(?:across|in|between|for|with)\b)[A-Za-z &\/,-])+?)\s+(?:teams|departments|functions|groups)\b/i;
function teamsIn(text) {
  const m = text.match(TEAM_LIST);
  if (!m) return null;
  const list = m[1].trim().replace(/,\s*$/, "");
  const items = list.split(/\s*,\s*|\s+and\s+/).map((x) => x.trim()).filter(Boolean);
  const ok = items.length >= 2 && items.length <= 7 && items.every((x) => x.split(/\s+/).length <= 3 && !/\b(?:that|which|so|to|the|did|not|from|with|their|its|our|of)\b/i.test(x));
  return ok ? list : null;
}

// ---------------------------------------------------------------- geography
// The five regions the scorecard knows (epic-advanced.js readGeo) and the words that name them. Other regions are named but not scored.
const GEO = [
  { code: "india", label: "India", re: /\b(?:India|Indian|Bharat|Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|UPI)\b/ },
  { code: "us_eu", label: "the United States", re: /\b(?:U\.?S\.?A?\b(?!\s+(?:dollars?|\$))|United States|North America|Silicon Valley)/, key: "us" },
  { code: "us_eu", label: "Europe", re: /\b(?:EU|Europe\w*|U\.?K\.?|United Kingdom|Britain|British|Germany|German|France|French|DACH|Nordics?|Netherlands|Spain)\b/, key: "eu" },
  { code: "middle_east", label: "the Middle East", re: /\b(?:Middle East|MENA|GCC|UAE|Dubai|Saudi\w*|Gulf|Qatar|Kuwait|Bahrain|Oman)\b/ },
  { code: "apac", label: "Asia Pacific", re: /\b(?:APAC|Asia[- ]Pacific|Southeast Asia|South-East Asia|ASEAN|Singapore|Australia\w*|Japan\w*|Indonesia\w*|Philippines|Vietnam|Malaysia|Korea\w*)\b/ },
  { code: null, label: "Africa", re: /\b(?:Africa\w*|Nigeria\w*|Kenya\w*|South Africa)\b/ },
  { code: null, label: "Latin America", re: /\b(?:Latin America\w*|LATAM|Brazil\w*|Mexic\w+)\b/ },
];
const GLOBAL_RE = /\b(?:global|worldwide|around the world|across the world|in \d{2,3}\+? countries)\b/i;
export const GEO_LABEL = { india: "India", us_eu: "the US or EU", middle_east: "the Middle East", apac: "Asia Pacific", global: "global" };

function readGeography(args, fields) {
  const given = clean(args.geography);
  const hits = [];
  for (const [field, text] of fields) {
    for (const g of GEO) {
      const m = text.match(g.re);
      if (m && !hits.some((h) => h.label === g.label)) hits.push({ label: g.label, code: g.code, word: m[0], field });
    }
  }
  // the same code reached through two labels (the US and Europe both score as US or EU) is two places named, one scored region
  const globalHit = fields.map(([field, text]) => ({ field, m: text.match(GLOBAL_RE) })).find((x) => x.m);
  return { given: given || null, hits, global: globalHit ? { word: globalHit.m[0], field: globalHit.field } : null };
}

// ---------------------------------------------------------------- business model
const PRICED = [
  { model: "saas", re: /\b(?:per[- ]seat|per[- ]user|seat[- ]based|monthly plans?|annual plans?)\b/i, weak: /\b(?:subscriptions?|saas|licen[cs]es?)\b/i },
  { model: "transactions", re: /\b(?:per[- ]transaction|transaction fees?|per[- ]message|per[- ]sms|per[- ]api call|merchant discount rate|interchange)\b/i },
  { model: "services", re: /\b(?:per[- ]fte|per[- ]ticket|fixed[- ]price|time and materials|statements? of work|retainers?)\b/i },
  { model: "connectivity", re: /\b(?:per[- ]site|per[- ]link|per[- ]mbps|bandwidth plans?)\b/i },
  { model: "marketplace", re: /\b(?:take rate|commission on)\b/i },
  { model: "investment", re: /\b(?:management fees?|performance fees?|assets under management)\b/i },
];
// What is sold, for the models whose words the shared reader blocks too easily (its "not" lists stop a payments seller that also mentions
// payroll, reconciliation or security). Only the product sentence is read, never the buyers' problem.
const CATEGORY = [
  { model: "connectivity", over: ["saas", "hardware_software"], re: /\b(?:iot (?:sim|connectivity|esim)|esims?|sim cards?|connectivity (?:platform|management|service)s?|business internet|leased lines?|mpls)\b/i },
  { model: "transactions", re: /\b(?:payment gateways?|payments? (?:platform|processing|processor|acceptance|infrastructure|stack|apis?|orchestration)|payments and banking|accept(?:s|ing)? (?:online |in-store |card |digital )?payments?|payouts?|merchant acquiring|remittances?|upi|card acceptance|disburs\w+)\b/i },
  { model: "marketplace", re: /\b(?:marketplaces? (?:where|that|for|connecting)|two-sided|connects? (?:buyers|shippers|sellers) (?:and|with) )\b/i },
];

function readModel(args, product, sentence, whole, v) {
  const explicit = clean(args.business_model);
  if (explicit) return { model: explicit, how: "input", words: null };
  // a per-unit price word anywhere in the text names the model; "subscription", "SaaS" or "licence" count only in the words about what is sold
  // (a billing seller's buyers are subscription businesses, which says nothing about how the seller charges)
  for (const p of PRICED) { const m = whole.match(p.re); if (m) return { model: p.model, how: "priced", words: m[0] }; }
  for (const p of PRICED) { const m = p.weak && product.match(p.weak); if (m) return { model: p.model, how: "priced", words: m[0] }; }
  const base = detectModel(undefined, { seller: [sentence || product, args.industry] });
  const cat = CATEGORY.map((c) => ({ c, m: (sentence || product).match(c.re) })).find((x) => x.m);
  if (cat && base.model !== "investment" && (base.model === "saas" || base.model === null || base.how === "sector" || (cat.c.over || []).includes(base.model)) && !(v && v.id === "ites")) return { model: cat.c.model, how: "product", words: cat.m[0] };
  if (base.how === "read") {
    const w = (sentence || product).match(/\b(?:software|platform|apps?|apis?|cloud|analytics|tools?|saas)\b/i);
    if (base.model === "saas") return { model: "saas", how: "assumed", words: w ? w[0] : null };
    const ev = (sentence || product).match(REASON[base.model] || /$^/);
    return { model: base.model, how: "product", words: ev ? ev[0] : null };
  }
  if (base.how === "sector") return { model: base.model, how: "sector", words: null };
  if (v) return { model: SECTOR_MODEL[v.id] || null, how: "sector", words: null };
  return { model: null, how: "unknown", words: null };
}
const REASON = {
  services: /\b(?:managed (?:(?:it|network|cloud|security) )?services?|consulting|consultancy|outsourc\w*|bpo|bpm|it services|business services?|contact cent(?:re|er)s?|engineering services|services)\b/i,
  connectivity: /\b(?:connectivity|sd-?wan|mpls|leased lines?|bandwidth|broadband|network)\b/i,
  transactions: /\b(?:per[- ]transaction|payments?|sms|messaging|payouts?|checkout)\b/i,
  marketplace: /\bmarketplace\b/i,
  hardware_software: /\b(?:hardware|devices?|sensors?|scanners?|robots?|terminals?)\b/i,
  investment: /\b(?:investment|funds?|portfolio|strategies|wealth|asset)\b/i,
  saas: /\b(?:software|platform|saas|subscription)\b/i,
};

// ---------------------------------------------------------------- sector and kind
// Extra words that point at a kind of company, counted beside the shared sector file's own match words (half weight). They are reading cues only: no
// roles, objections or figures are kept here (rule B82). Proposed for the shared file in the run report.
const KIND_CUES = {
  "enterprise-search": /\b(?:search|assistant|answers?|company (?:knowledge|tools|data)|knowledge|connectors?|find what|enterprise context|permissions?)\b/gi,
  "agents-copilots": /\b(?:agents?|copilots?|co-?workers?|automat\w+|workflows?)\b/gi,
  "voice-language-models": /\b(?:speech|voice|languages?|transcri\w+|text to speech|accents?)\b/gi,
  "crm-marketing": /\b(?:crm|leads?|pipeline|campaigns?|lead scoring|opportunit\w+)\b/gi,
  "customer-service": /\b(?:help ?desk|tickets?|customer support|customer service|support suite|service crm|contact cent\w+)\b/gi,
  "freight-visibility": /\b(?:visibility|tracking|shipments?|control tower|carrier network)\b/gi,
  "warehousing": /\b(?:warehouse\w*|inventory|pick(?:ing)?|slotting|fulfil\w+|distribution cent\w+)\b/gi,
  "operators-connectivity": /\b(?:vpn|sd-?wan|sase|networking|connectivity|leased lines?|mpls|broadband|wan|sim)\b/gi,
  "business-voice-ucaas": /\b(?:ucaas|ccaas|telephony|pbx|contact cent\w+|unified communications|video meetings)\b/gi,
  "cpaas-messaging": /\b(?:sms|whatsapp|rcs|messaging|otp|sender ids?|voice apis?|two-way)\b/gi,
  "testing": /\b(?:test automation|visual testing|accessibility testing|test management|real devices|test suites?|flaky tests?|qa teams?)\b/gi,
  "cloud-security": /\b(?:cnapp|cspm|cwpp|posture|workload protection|runtime|cloud security)\b/gi,
  "identity-security": /\b(?:sso|single sign on|mfa|directory|identity|access governance|privileged access|provisioning)\b/gi,
  "email-security": /\b(?:phishing|email|awareness training|inbox)\b/gi,
  "appsec": /\b(?:sast|dast|sca|code scanning|application security|mobile application security|binaries)\b/gi,
  "payments-banking": /\b(?:payments?|payouts?|cards?|banking|upi|settlement|gateway)\b/gi,
  "lending": /\b(?:loans?|lending|credit|underwriting|borrowers?)\b/gi,
  "spend-expense": /\b(?:expenses?|reimburse\w*|spend|corporate cards?)\b/gi,
  "last-mile": /\b(?:last[- ]mile|route (?:planning|optimi[sz]\w+)|dispatch\w*|driver app|proof of delivery|delivery fleets?|couriers?)\b/gi,
};
const distinct = (re, text) => {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  const seen = new Set();
  for (const m of text.matchAll(g)) seen.add(lc(m[0]).replace(/\s+/g, " "));
  return [...seen];
};
const withSubtype = (v, st) => ({ ...v, ...st.notes, name: v.name.replace(/,.*$/, "") + ", " + st.name, subtype: st.id });
const baseOf = (v) => VERTICALS.find((x) => x.id === v.id) || v;

function voteKinds(v, productText) {
  const rows = [];
  for (const st of SUBTYPES) {
    if (st.vertical !== v.id) continue;
    const strong = distinct(st.match, productText);
    const cues = KIND_CUES[st.id] ? distinct(KIND_CUES[st.id], productText).filter((w) => !strong.some((s) => s.includes(w))) : [];
    const score = strong.length + 0.5 * cues.length;
    if (score > 0) rows.push({ st, strong, cues, score, first: Math.min(...[...strong, ...cues].map((w) => lc(productText).indexOf(w)).filter((i) => i >= 0), 1e9) });
  }
  return rows.sort((a, b) => b.score - a.score || a.first - b.first);
}
const wordsText = (r) => joinList((r.strong.length ? r.strong : r.cues).slice(0, 3));

function readSector(args, name, texts, product, pain, buyers, whole) {
  const plain = (t) => (typeof t === "string" && name.length > 1 ? t.split(name).join(" ") : t);
  const industry = clean(args.industry);
  const challenge = plain(texts.challenge);
  const channels = clean(args.current_channels);
  const sectorByName = (t) => { const x = lc(clean(t)); return x ? VERTICALS.find((v) => lc(v.name) === x) || null : null; };
  // R1: the reading the tools always made (the industry first, then the free text). R2: the same with the product sentence as the seller's own words.
  let r1;
  if (texts.isRoadmap) { const v = industry ? explainSector({ seller: [industry] }).vertical || sectorByName(industry) : null; r1 = v ? { vertical: v, source: "industry", strong: [] } : null; }
  else { const e = explainSector({ seller: [plain(args.company_description), industry], context: [challenge, channels] }); r1 = e.vertical ? e : (sectorByName(industry) ? { vertical: sectorByName(industry), source: "industry", strong: [] } : null); }
  const r2e = product ? explainSector({ seller: [plain(product), industry], context: [pain, buyers, channels] }) : { vertical: null };
  const r2 = r2e.vertical ? r2e : null;
  let pick = null, from = null;
  // an industry typed as one of the nine sector names is the user's own statement of the sector: the text then decides only the kind of company
  const named = sectorByName(industry);
  if (named) { const same = [r2, r1].find((x) => x && x.vertical.id === named.id); pick = same ? same.vertical : named; from = "industry"; }
  else if (r1 && r2 && r1.vertical.id === r2.vertical.id) { pick = r2.vertical; from = r2.source; }
  else if (r1) { pick = r1.vertical; from = r1.source; }
  else if (r2) { pick = r2.vertical; from = r2.source; }
  if (!pick) return { v: null, source: null, words: [], close: null, why: null };
  const strong = (r1 && r1.vertical.id === pick.id ? r1.strong : []).concat(r2 && r2.vertical.id === pick.id ? r2.strong : []);
  let close = null;
  const base = baseOf(pick);
  // kinds: the product words as a whole decide, not one keyword; a profile (support automation, billing, investment) is kept
  const profile = !pick.subtype && (/investment management|billing/.test(pick.name));
  const supportProfile = !pick.subtype && !profile && pick.buyerRoles !== base.buyerRoles;
  let v = pick, why = null;
  if (!profile) {
    const votes = voteKinds(base, product || whole);
    const cur = pick.subtype ? votes.find((r) => r.st.id === pick.subtype) : null;
    const top = votes[0];
    const qualifies = top && (top.strong.length >= 1 || top.cues.length >= 3);
    const mayOverride = qualifies && (!supportProfile || (top.strong.length >= 1 && top.st.id !== "agents-copilots"));
    if (top && mayOverride && (!cur || (top.st.id !== cur.st.id && top.score >= cur.score + 1))) {
      v = withSubtype(base, top.st);
      why = cur ? "more of your product words (" + wordsText(top) + ") point to " + top.st.name + " than to " + cur.st.name : "the product words (" + wordsText(top) + ") point to " + top.st.name;
    }
    const chosen = v.subtype ? votes.find((r) => r.st.id === v.subtype) : null;
    const second = votes.find((r) => !chosen || r.st.id !== chosen.st.id);
    if (chosen && second && second.score >= 0.5 * chosen.score) {
      close = { chosen: chosen.st.name, other: second.st.name, chosenWords: wordsText(chosen), otherWords: wordsText(second), reason: chosen.score > second.score ? "more of your product words point to it" : "its words come first in your description" };
    } else if (!chosen && votes.length >= 2 && votes[1].score >= 0.5 * votes[0].score) {
      close = { chosen: base.name, other: votes[0].st.name, chosenWords: joinList(strong.filter((w) => !GENERIC_WORD.test(w)).slice(0, 2)) || base.name, otherWords: wordsText(votes[0]), reason: "the sector you named fits the description as a whole and neither kind of company stands out" };
    }
  }
  // a second vertical: its own match words in the product sentence against the chosen one's
  let otherVertical = null;
  if (product) {
    const mine = distinct(base.match, product);
    for (const o of VERTICALS) {
      if (o.id === base.id || o.id === "saas") continue;
      const w = distinct(o.match, product);
      if (w.length >= 2 && mine.length >= 1 && w.length >= 0.7 * mine.length && w.length >= (otherVertical ? otherVertical.words.length : 0)) otherVertical = { v: o, words: w };
    }
  }
  return { v, source: from, words: [...new Set(strong)].slice(0, 4), close, why, otherVertical, mine: distinct(base.match, product || whole) };
}

// ---------------------------------------------------------------- the whole reading
/** Reads everything the tools need from the user's text. `args` are the tool arguments after the entry safeguard. */
export function readCompany(args, tool) {
  const name = clean(args.company_name);
  const isRoadmap = tool === "generate_roadmap";
  const challenge = clean(args.gtm_challenge) || clean(args.challenge);
  const desc = clean(args.product_description);
  const mainField = desc ? "product_description" : challenge ? (isRoadmap ? "product_description" : tool === "epic_audit" ? "challenge" : "gtm_challenge") : null;
  const mainText = desc || challenge;
  const out = { name, tool, field: mainField, segmentsText: null, painShort: null, quoted: false, head: null, uses: [], how: [], buyers: null, buyersShort: null, roles: [], teams: null, pain: null, asked: null };
  const industry = clean(args.industry);
  const channels = clean(args.current_channels);
  if (mainText) {
    if (isQuoted(mainText)) {
      out.quoted = true;
      const cutAt = mainText.length > 400 ? mainText.slice(0, 400).replace(/\s+\S*$/, "") : mainText;
      out.raw = /^“/.test(cutAt) ? (/”$/.test(cutAt) ? cutAt : cutAt + "”") : "“" + cutAt + "”";
    }
    else {
      const sents = sentencesOf(mainText);
      let sell = null;
      for (const s of sents) {
        if (PAIN_START.test(s)) { out.pain = stripEnd(s.replace(PAIN_START, "")); continue; }
        if (ASK_WORDS.test(s) && !/\b(?:sell|sells|offer|offers|provide|provides)\b/i.test(s)) { out.asked = s; continue; }
        if (!sell && !PAIN_WORDS.test(s)) sell = s;
        else if (!out.pain && PAIN_WORDS.test(s) && sell) out.pain = stripEnd(s);
      }
      if (!sell && sents.length) { const f = sents.find((s) => !PAIN_START.test(s) && !ASK_WORDS.test(s)); if (f) sell = f; }
      // a text that only asks ("We need more pipeline from mid-market freight buyers") holds no product statement
      const looksLikeProduct = sell && (/\b(?:sells?|offers?|provides?|builds?|makes?|delivers?|platform|software|service|services|app|api|tool|product|solution|system)\b/i.test(sell) || desc);
      if (sell && looksLikeProduct) {
        const sp = splitSell(sell, name);
        let head = sp.head.trim();
        let moreFeatures = "";
        if (head.length > 40 && / (?:that|which) /.test(head) && !/[“”]/.test(head)) {
          const c2 = firstTop(head, /\s(?:that|which)\s+/i);
          if (c2 && c2.index >= 12) { const rest = head.slice(c2.end); head = head.slice(0, c2.index); moreFeatures = /^(?:joins|combines|covers|includes|offers)\s/i.test(rest) ? rest.replace(/^\w+\s+/, "") : ""; }
        }
        if (head.length > 90) {
          const cut = firstTop(head, /\s(?:that|which|joins|combines|covers|covering|including|with|built|powered|made of|and its)\s+(?:(?:joins|combines|covers|connects|offers|includes)\s+)?/i);
          if (cut && cut.index >= 12) { moreFeatures = head.slice(cut.end); head = head.slice(0, cut.index); } else head = "";
        }
        out.head = head && goodChunk(head) ? stripEnd(head) : null;
        let featureText = [moreFeatures, sp.features].filter(Boolean).join(", ");
        // a head that is itself a comma list of short phrases ("UPI and card acceptance, split payouts, refunds") holds the use cases
        if (out.head && !sp.features && !moreFeatures) {
          const pieces = splitTop(out.head, /\s*,\s*/);
          if (pieces.length >= 2 && !/^[A-Z][\w.'-]*$/.test(pieces[0].trim()) && pieces.every((x) => x.trim().split(/\s+/).length <= 9)) { featureText = out.head; out.head = null; }
        }
        const chunks = featureText ? chunkList(featureText) : [];
        const extraBuyers = [];
        for (const c0 of chunks) {
          const c = stripEnd(String(c0));
          if (/^to\s+/i.test(c) && looksLikeBuyers(c.replace(/^to\s+/i, ""))) { extraBuyers.push(c.replace(/^to\s+/i, "")); continue; }
          if (!goodChunk(c) || /^(?:in|on|at|by|from|under|across|over|as|it|its|that|which|where|when|via|so|but|moves|runs|connects|offers|provides|helps|lets|gives|makes|handles|covers|joins|builds|delivers|automates|designs)\b/i.test(c)) continue;
          if (HOW_DELIVERED.test(c) || c0.rawWith) { out.how.push(c); continue; }
          if (!out.uses.includes(c)) out.uses.push(c);
        }
        out.uses = out.uses.slice(0, 6);
        out.how = out.how.slice(0, 2);
        if (sp.buyers && extraBuyers.length) sp.buyers = sp.buyers + " and " + extraBuyers.join(" and ");
        if (!sp.buyers && extraBuyers.length) sp.buyers = extraBuyers.join(" and ");
        if (sp.buyers) {
          const bc = firstTop(sp.buyers, /:\s*/);
          if (bc) { const seg = stripEnd(sp.buyers.slice(bc.end)); if (seg.length >= 6 && seg.length <= 170 && !/[“”<>{}\[\]]/.test(seg)) out.segmentsText = seg; sp.buyers = sp.buyers.slice(0, bc.index); }
          const b0 = stripEnd(sp.buyers.trim().split(/,\s+(?:from|including|especially|such as|plus)\s/i)[0]);
          const cut = b0.match(/\s+(?:that|whose|which|where|including|especially)\s+/i);
          const b = stripEnd((cut && cut.index >= 6 && b0.length > 120 ? b0.slice(0, cut.index) : b0).replace(/\s*\([^)]*\)?\s*$/, ""));
          if (b && b.length <= 160 && !/[“”<>{}]/.test(b)) {
            out.buyers = b;
            const short = cut && cut.index >= 6 && b0.startsWith(b.slice(0, 6)) ? b0.slice(0, cut.index) : b;
            out.buyersShort = stripEnd(short.replace(/\s*\([^)]*\)?/g, "").replace(/\s+(?:at|in|across)\s+(?:the\s+)?(?:companies|enterprises|organi[sz]ations|businesses|firms|large enterprises|India|\w+)\b.*$/i, (m) => (/\b(?:companies|enterprises|organi[sz]ations|businesses|firms)\b/i.test(m) ? "" : m)));
            if (out.buyersShort.length < 4) out.buyersShort = b;
          }
        }
      }
      const pool = [out.buyers || "", mainText].join(" ");
      out.roles = rolesIn(out.buyers || "");
      out.teams = teamsIn(mainText);
      if (out.pain && (out.pain.length > 170 || /[“”<>{}]/.test(out.pain))) out.pain = null;
      if (out.pain) { const first = stripEnd(out.pain.split(/;\s*/)[0]); out.painShort = first.length <= 110 ? first : null; }
    }
  }
  const product = out.quoted ? "" : [out.head, ...out.uses, ...out.how].filter(Boolean).join(", ") || "";
  const productForReader = out.quoted ? "" : (mainText ? (sentencesOf(mainText).find((s) => !PAIN_START.test(s) && !ASK_WORDS.test(s)) || mainText) : "");
  const whole = [mainText, industry, channels].filter(Boolean).join(" \n ");
  // sector
  const sec = readSector(args, name, { challenge: mainText, isRoadmap }, productForReader, out.pain || "", out.buyers || "", whole);
  out.sector = sec;
  out.v = sec.v;
  // model
  const mtext = out.quoted ? "" : whole;
  const sellText = [out.head, ...out.uses, ...out.how].filter(Boolean).join(", ") || productForReader;
  const sentence = out.quoted ? "" : productForReader.split(/;\s*(?=\d|[a-z]+\s+\([^)]*claim)/)[0];
  out.model = readModel(args, out.quoted ? "" : sellText, sentence, mtext, sec.v);
  if (!out.model.model && sec.v) out.model = { model: SECTOR_MODEL[sec.v.id] || null, how: "sector", words: null };
  // the usual model of the kind of company (a messaging API is per message, a marketplace takes a rate) beats the generic software reading unless the seller says subscription, SaaS, per seat, per user or licence
  const stm = sec.v && sec.v.subtype ? SUBTYPES.find((x) => x.id === sec.v.subtype) : null;
  if (stm && stm.model && stm.model !== out.model.model && (out.model.how === "assumed" || out.model.how === "sector") && !clean(args.business_model) && (stm.model === "marketplace" || !/\b(?:saas|software|subscriptions?|per seat|per user|licen[cs]es?)\b/i.test(sellText))) out.model = { model: stm.model, how: "sector", words: null };
  // geography
  out.geo = readGeography(args, [[mainField || "text", out.quoted ? "" : mainText || ""], ["industry", industry], ["current_channels", channels], ["company_name", ""]]);
  out.fields = { main: mainField };
  return out;
}

// ---------------------------------------------------------------- words for the answer
export function modelLabel(read, nameOf) {
  const m = read.model;
  if (!m.model) return "not clear from your inputs; set business_model";
  const n = nameOf(m.model);
  if (m.how === "input") return n;
  if (m.how === "priced") return n + " (read from your text: \"" + m.words + "\")";
  if (m.how === "product") return n + (m.words ? " (read from your product words: \"" + m.words + "\")" : " (read from your product words)");
  if (m.how === "assumed") return n + " (assumed: your text describes a software product but does not say how you charge; set business_model to change it)";
  return n + " (the usual model in this sector, assumed; set business_model to change it)";
}

// ---------------------------------------------------------------- the lines the answers print
const fieldNote = (f) => (f ? " (from " + f + ")" : "");
const quoted = (t) => "\"" + t + "\"";
const semi = (items) => items.join("; ");

function geoLine(read, args) {
  const g = read.geo;
  if (g.given) return "Geography: you set " + (GEO_LABEL[g.given] || g.given) + "; the scores use it.";
  const labels = [...new Set(g.hits.map((h) => h.label))];
  const codes = new Set(g.hits.map((h) => h.code || h.label));
  const where = g.hits[0] ? " (from " + g.hits[0].field + ")" : "";
  if (labels.length === 1 || (codes.size === 1 && g.hits.every((h) => h.code))) return "Geography: the text says " + joinList(labels) + where + ".";
  if (labels.length > 1) return "Geography: the text names " + joinList(labels) + where + ", which is more than one region, so no single geography is read.";
  if (g.global) return "Geography: the text says " + quoted(g.global.word) + fieldNote(g.global.field) + ", which reads as global; no single country is read.";
  return "Geography: the text names no country or region.";
}

function modelLine(read, nameOf, field) {
  const m = read.model;
  if (!m.model) return "Business model: I could not tell how you charge from the text.";
  const n = nameOf(m.model);
  if (m.how === "input") return "Business model: " + n + ", as you set it.";
  if (m.how === "priced") return "Business model: " + n + ", read from " + quoted(m.words) + fieldNote(field) + ".";
  if (m.how === "product") return "Business model: " + n + ", read from the product words " + quoted(m.words) + fieldNote(field) + ".";
  if (m.how === "assumed") return "Business model: " + n + ", assumed: the text describes a software product but does not say how you charge.";
  return "Business model: " + n + ", the usual model in this sector, assumed: the text does not say how you charge.";
}

const GENERIC_WORD = /^(?:ai|ai native|ai platform|platform|api|apis|cloud|software|saas|fintech|telecom|ites|logistics tech|vertical saas|cybersecurity)$/;
function sectorLine(read, args) {
  const sec = read.sector;
  if (!read.v) return "Sector: I could not tell the sector from the text given.";
  const ind = clean(args.industry);
  const own = sec.words.filter((w) => !GENERIC_WORD.test(w));
  let t = "Sector: " + read.v.name + " (read from " + [ind ? "industry" : null, read.field].filter(Boolean).join(" and ") + (own.length ? ": " + own.join(", ") : "") + ").";
  const reason = sec.why ? sec.why.replace(/^more of your product words/, "more of your product words") : null;
  if (sec.close) t += " Close call: your words fit " + sec.close.chosen + " (" + sec.close.chosenWords + ") and " + sec.close.other + " (" + sec.close.otherWords + "); I chose " + sec.close.chosen + " because " + sec.close.reason + ".";
  else if (reason) t += " I chose the kind of company because " + reason + ".";
  else if (sec.otherVertical) t += " Your words also fit " + sec.otherVertical.v.name + " (" + joinList(sec.otherVertical.words.slice(0, 3)) + "); I kept " + (ind ? "the sector you named in industry" : read.v.name.replace(/,.*$/, "")) + ".";
  return t;
}

/** The short lines that say what was read, from where, and what could not be told. `nameOf` turns a model id into its printed name. */
export function readLines(read, args, nameOf) {
  const lines = [];
  const f = read.field;
  if (read.quoted) {
    lines.push("Product and buyers: not read from your text, which is shown as you typed it: " + read.raw);
  } else {
    if (read.head || read.uses.length) lines.push("Product: " + [read.head, read.uses.length ? "use cases named: " + semi(read.uses.slice(0, 4)) : null].filter(Boolean).join("; ") + fieldNote(f) + ".");
    else lines.push("Product: I could not tell what you sell from the text given" + (f ? "" : " (no product text was given)") + ".");
    if (read.buyersShort) lines.push("Buyers: " + [read.buyersShort, read.segmentsText ? "segments named: " + read.segmentsText : null, read.roles.length ? "roles named: " + joinList(read.roles) : null, read.teams ? "teams named: " + read.teams : null].filter(Boolean).join("; ") + fieldNote(f) + ".");
    else lines.push("Buyers: I could not tell who buys; the text has no phrase such as \"to <buyers>\" or \"for <buyers>\"" + (read.roles.length ? ", but it names " + joinList(read.roles) : "") + ".");
    if (read.pain) lines.push("Problem you describe: " + read.pain + fieldNote(f) + ".");
  }
  lines.push(modelLine(read, nameOf, f));
  lines.push(geoLine(read, args));
  lines.push(sectorLine(read, args));
  return lines;
}

/** The inputs not given, each with what giving it would change; named once, at the end of an answer. `extra` holds computed effects. */
export function sharpenLines(read, args, extra) {
  const out = [];
  const given = (k) => args[k] !== undefined && args[k] !== null && args[k] !== "";
  const tool = read.tool;
  if (tool !== "generate_roadmap") {
    if (!given("business_stage")) out.push("Give business_stage: it would change the starting row of all four scores; the Series B row in use now is a neutral default, not a claim about you.");
    if (!given("acv_usd")) out.push("Give acv_usd: above 50,000 US dollars it would change the lead toward Ecosystem and ABM, below 5,000 toward Product-Led.");
    if (!given("deal_cycle_days")) out.push("Give deal_cycle_days: above 90 days it would change the lead toward Ecosystem and ABM, below 14 toward Product-Led.");
    if (!given("nrr_percent")) out.push("Give nrr_percent: below 100 it would change the score toward Community-Led (fix retention first), above 120 it would add to Community-Led and Product-Led.");
    if (!given("tam_accounts")) out.push("Give tam_accounts: below 500 accounts it would change the score toward Ecosystem and ABM, above 10,000 toward Inbound and Outbound.");
    if (extra.selfServe) out.push("Give self_serve: " + extra.selfServe);
    if (!given("deal_source")) out.push("Give deal_source: referrals would add 3 to Community-Led, outbound 2 to Inbound and Outbound and partnerships 2 to Ecosystem and ABM, so it can change the lead.");
    if (!given("geography")) out.push("Give geography: " + (extra.geography || "India, the Middle East and APAC lift Ecosystem and ABM and the US or EU lifts Inbound and Outbound, so it would change the scores."));
  }
  if (!given("current_channels")) out.push("Give current_channels: it would change the first steps, which would start from what you do today instead of from a general list.");
  if (read.model.how === "assumed" || read.model.how === "sector" || read.model.how === "unknown") out.push("Give business_model: it would change the pilot and trial wording (a services business gets a paid assessment, not a sign-up trial).");
  if (!read.v) out.push("Give industry (one of logistics tech, fintech, SaaS, vertical SaaS, AI native, ITeS, telecom, software, cybersecurity, or your own words): it would change the buyer roles, partner types, reviews and measures in every step, which are written for any sector now.");
  if (tool === "generate_roadmap") {
    if (!given("product_description") && !read.head && !read.uses.length) out.push("Give product_description: it would change the steps, which would name your use cases, buyers and problem instead of a general pilot.");
    if (!given("deal_cycle_days")) out.push("Give deal_cycle_days: it would change whether the review steps are booked early (a long cycle) or kept light.");
    if (!given("acv_usd")) out.push("Give acv_usd: it would change how much research each account gets and whether partner-led steps lead.");
    if (!given("tam_accounts")) out.push("Give tam_accounts: it would change how many accounts the list ranks and whether the community steps run at scale.");
    if (!given("nrr_percent")) out.push("Give nrr_percent: it would add a retention check to the last month of the plan.");
  }
  return out;
}
