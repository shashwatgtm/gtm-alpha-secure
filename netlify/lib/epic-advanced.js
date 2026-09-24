// netlify/lib/epic-advanced.js
// EPIC motion scoring, advanced version: the documented rubric from the epic-motion-diagnostic skill
// (Scoring Logic, Signal-based overrides, Tie-Breaking and Score Clustering) and the GTM Alpha system
// reference section 1.1. Scale 1 to 10 per motion. Deterministic: no model call, never scored on the
// company name. Order: stage default, additive adjustments (ACV, deal cycle, NRR, TAM, self-serve, deal
// source, geography), industry cap on P, bounds, signal overrides, bounds again, then lead selection with
// the tie-break order E, P, C, I. An absent input means no adjustment for that rule and marks the result
// as preliminary. Thresholds use the skill's exact comparisons: ACV above 50,000 or below 5,000 US dollars,
// deal cycle above 90 or below 14 days, NRR below 100 or above 120 percent, TAM below 500 or above 10,000
// accounts; values on a boundary get no adjustment.

export const MOTIONS = {
  E: "Ecosystem and ABM",
  P: "Product-Led Growth",
  I: "Inbound and Outbound Demand Generation",
  C: "Community-Led Advocacy"
};

const STAGE_DEFAULTS = {
  seed: { label: "Pre-seed or Seed", scores: { E: 3, P: 4, I: 5, C: 2 } },
  series_a: { label: "Series A", scores: { E: 5, P: 5, I: 6, C: 4 } },
  series_b: { label: "Series B", scores: { E: 7, P: 5, I: 6, C: 6 } },
  series_c: { label: "Series C or later", scores: { E: 8, P: 4, I: 5, C: 7 } },
  bootstrapped: { label: "Bootstrapped", scores: { E: 4, P: 5, I: 6, C: 3 } }
};

// Stage wording used by GTM Alpha's forms and tools, mapped to the documented stage rows.
// Consultation form: Pre-launch, MVP (Seed row); Early Traction (Series A); Growth (Series B);
// Scale, Mature (Series C+). "growth" maps to Series B, as in the advanced actor.
export function stageRow(stage) {
  const s = String(stage == null ? "" : stage).toLowerCase().trim();
  if (!s) return null;
  if (/bootstrap/.test(s)) return "bootstrapped";
  if (/pre[\s_-]?seed|preseed|\bseed\b|\bidea\b|pre[\s_-]?launch|\bmvp\b|pre[\s_-]?revenue/.test(s)) return "seed";
  if (/series[\s_-]?a\b|early[\s_-]?traction/.test(s)) return "series_a";
  if (/series[\s_-]?[c-z]\b|series[\s_-]?c\+|\bscale|enterprise|mature|late[\s_-]?stage|\bipo\b|public/.test(s)) return "series_c";
  if (/series[\s_-]?b\b|\bgrowth\b/.test(s)) return "series_b";
  return null;
}

// Industries where the skill caps P at 4 (Logistics, Procurement, Manufacturing, Healthcare IT, Government).
// "Healthcare" is included, as in the advanced actor, because GTM Alpha's form offers only "Healthcare".
const P_CAP_INDUSTRY = /logistic|procurement|manufactur|health\s*care|health\s*it|healthtech|government|govt|public\s*sector/i;

function parseAmount(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && isFinite(v)) return v;
  const m = String(v).toLowerCase().replace(/[,\s$]/g, "").match(/^(\d+(?:\.\d+)?)(k|m)?/);
  if (!m) return null;
  return parseFloat(m[1]) * (m[2] === "k" ? 1000 : m[2] === "m" ? 1000000 : 1);
}

// Each reader returns { band: "low" | "mid" | "high" | null, raw }.
function readAcv(v) {
  const b = String(v == null ? "" : v).toLowerCase();
  if (/under[_\s-]?5k|less[_\s-]?than[_\s-]?5k/.test(b)) return "low";
  if (/5k[_\s-]?to[_\s-]?50k/.test(b)) return "mid";
  if (/over[_\s-]?50k|above[_\s-]?50k|50k[_\s-]?to[_\s-]?250k|over[_\s-]?250k/.test(b)) return "high";
  const n = parseAmount(v);
  if (n === null) return null;
  return n > 50000 ? "high" : n < 5000 ? "low" : "mid";
}

function readCycle(v) {
  const b = String(v == null ? "" : v).toLowerCase();
  if (/under[_\s-]?14|less[_\s-]?than[_\s-]?14/.test(b)) return "low";
  if (/14[_\s-]?to[_\s-]?90/.test(b)) return "mid";
  if (/over[_\s-]?90|more[_\s-]?than[_\s-]?90/.test(b)) return "high";
  const n = parseAmount(v);
  if (n === null) return null;
  const days = /month/.test(b) ? n * 30 : /week/.test(b) ? n * 7 : n;
  return days > 90 ? "high" : days < 14 ? "low" : "mid";
}

function readNrr(v) {
  const b = String(v == null ? "" : v).toLowerCase();
  if (/under[_\s-]?100|below[_\s-]?100|shrink/.test(b)) return "low";
  if (/100[_\s-]?to[_\s-]?120|flat/.test(b)) return "mid";
  if (/over[_\s-]?120|above[_\s-]?120/.test(b)) return "high";
  const n = parseAmount(v);
  if (n === null) return null;
  return n < 100 ? "low" : n > 120 ? "high" : "mid";
}

function readTam(v) {
  const b = String(v == null ? "" : v).toLowerCase();
  if (/under[_\s-]?500|less[_\s-]?than[_\s-]?500/.test(b)) return "low";
  if (/500[_\s-]?to[_\s-]?10[,]?000/.test(b)) return "mid";
  if (/over[_\s-]?10[,]?000|above[_\s-]?10[,]?000/.test(b)) return "high";
  const n = parseAmount(v);
  if (n === null) return null;
  return n < 500 ? "low" : n > 10000 ? "high" : "mid";
}

function readSelfServe(v) {
  if (v === true || v === false) return v;
  const s = String(v == null ? "" : v).toLowerCase().trim();
  if (["yes", "true", "y", "1"].includes(s)) return true;
  if (["no", "false", "n", "0"].includes(s)) return false;
  return null;
}

function readSource(v) {
  const s = String(v == null ? "" : v).toLowerCase();
  if (!s.trim()) return null;
  if (/referr/.test(s)) return "referrals";
  if (/partner|channel|reseller|alliance/.test(s)) return "partnerships";
  if (/outbound/.test(s)) return "outbound";
  if (/inbound/.test(s)) return "inbound";
  if (/mix|unclear|unknown|none/.test(s)) return "mixed";
  return null;
}

function readGeo(v) {
  const s = String(v == null ? "" : v).toLowerCase();
  if (!s.trim()) return null;
  if (/global|multi/.test(s)) return "global";
  if (/india/.test(s)) return "india";
  if (/middle[\s_-]?east|\bgcc\b|\buae\b|saudi/.test(s)) return "middle_east";
  if (/apac|asia|singapore|australia|japan|sea\b/.test(s)) return "apac";
  if (/\bus\b|usa|united states|north america|\beu\b|europe|\buk\b|us_eu|us[\s_-]?europe/.test(s)) return "us_eu";
  return null;
}

const clamp = (n) => Math.max(1, Math.min(10, n));
const LEAKY = /pipeline|new\s*logo|acquisition|top\s*of\s*(the\s*)?funnel|more\s*leads/i;
const AEO = /organic\s*(traffic|search).{0,30}(drop|declin|down|fall|plateau)|ai\s*search|zero.?click|chatgpt.{0,20}(traffic|search|answer)|llm.{0,20}(cite|search|answer)|ai\s*overview/i;
const UPMARKET = /enterprise|upmarket|up[\s-]market|move\s*up/i;
const TIE_ORDER = ["E", "P", "C", "I"];

export function scoreEpic(input) {
  const inp = input || {};
  const applied = [];
  const skipped = [];
  const notes = [];
  const warnings = [];

  const row = stageRow(inp.business_stage || inp.stage);
  let stageLabel;
  let sc;
  if (row) {
    sc = { ...STAGE_DEFAULTS[row].scores };
    stageLabel = STAGE_DEFAULTS[row].label;
  } else {
    sc = { ...STAGE_DEFAULTS.series_b.scores };
    stageLabel = "Series B (used because the stage was missing or not recognised)";
    skipped.push("business stage");
  }
  applied.push({ rule: "Stage starting point: " + stageLabel, change: { ...sc } });
  const add = (rule, d) => { for (const k of Object.keys(d)) sc[k] += d[k]; applied.push({ rule, change: d }); };

  const acv = readAcv(inp.acv_usd != null ? inp.acv_usd : inp.acv);
  if (acv === "high") add("ACV above 50,000 US dollars", { E: 2, P: -1 });
  else if (acv === "low") add("ACV below 5,000 US dollars", { P: 2, E: -1 });
  else if (acv === null) skipped.push("ACV");

  const cyc = readCycle(inp.deal_cycle_days != null ? inp.deal_cycle_days : inp.deal_cycle);
  if (cyc === "high") add("Deal cycle above 90 days", { E: 2, I: -1 });
  else if (cyc === "low") add("Deal cycle below 14 days", { P: 2, E: -1 });
  else if (cyc === null) skipped.push("deal cycle");

  const nrr = readNrr(inp.nrr_percent != null ? inp.nrr_percent : inp.nrr);
  if (nrr === "low") add("NRR below 100 percent (leaky bucket: fix retention before scaling acquisition)", { C: 2, I: -1 });
  else if (nrr === "high") add("NRR above 120 percent (expansion working, amplify it)", { C: 1, P: 1 });
  else if (nrr === null) skipped.push("NRR");

  const tam = readTam(inp.tam_accounts != null ? inp.tam_accounts : inp.tam);
  if (tam === "low") add("TAM below 500 accounts", { E: 2, I: -1 });
  else if (tam === "high") add("TAM above 10,000 accounts", { I: 2, E: -1 });
  else if (tam === null) skipped.push("TAM");

  const selfServe = readSelfServe(inp.self_serve);
  if (selfServe === true) add("Self-serve product exists", { P: 2 });

  const source = readSource(inp.deal_source);
  if (source === "referrals") add("Majority of deals from referrals (tracked as the primary signal)", { C: 3 });
  else if (source === "outbound") add("Majority of deals from outbound", { I: 2 });
  else if (source === "partnerships") add("Majority of deals from partnerships", { E: 2 });
  else if (source === "mixed") notes.push("No dominant acquisition channel detected. This usually means the company has not yet found its repeatable motion.");
  else if (source === null) skipped.push("deal source");

  const geo = readGeo(inp.geography || inp.region);
  if (geo === "india") add("India B2B", { E: 1, C: 1 });
  else if (geo === "us_eu") add("US or EU", { I: 1 });
  else if (geo === "middle_east") add("Middle East", { E: 2 });
  else if (geo === "apac") add("APAC excluding India", { E: 1 });
  else if (geo === "global") notes.push("Global or multi-geography: no geography adjustment applied. Different motions may lead in different regions.");
  else skipped.push("geography");

  if (P_CAP_INDUSTRY.test(String(inp.industry || "")) && sc.P > 4) {
    applied.push({ rule: "Industry cap: P capped at 4 (" + inp.industry + "; self-serve is structurally unlikely)", change: { P: 4 - sc.P } });
    sc.P = 4;
  }

  for (const k of Object.keys(sc)) sc[k] = clamp(sc[k]);

  const text = [inp.gtm_challenge, inp.challenge, inp.company_description, inp.current_channels].filter(Boolean).join(" ");
  if (nrr === "low" && LEAKY.test(text)) {
    sc.I -= 1;
    applied.push({ rule: "Override: leaky bucket (NRR below 100 percent and an acquisition-framed challenge)", change: { I: -1 } });
    warnings.push("Adding top of funnel while NRR is below 100% fills and empties simultaneously. Fix retention first.");
  }
  if (AEO.test(text)) {
    sc.I -= 2; sc.C += 2;
    applied.push({ rule: "Override: AEO and GEO inbound disruption", change: { I: -2, C: 2 } });
    warnings.push("Inbound SEO is structurally disrupted by AI search. The fix is not more content. It is becoming the source that LLMs cite: G2 reviews, community threads, analyst mentions, peer recommendations.");
  }
  if (sc.P > 6 && sc.E > 6 && UPMARKET.test(text)) {
    warnings.push("Hybrid motion detected. PLG for land, Ecosystem for expand. Sequence matters: build self-serve conversion infrastructure first, then layer ABM on accounts with 10+ active free users.");
  }
  for (const k of Object.keys(sc)) sc[k] = clamp(sc[k]);

  const ranked = ["E", "P", "I", "C"].sort((a, b) => (sc[b] - sc[a]) || (TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b)));
  const vals = Object.values(sc);
  if (Math.max(...vals) - Math.min(...vals) <= 2) {
    notes.push("Your scores are evenly distributed. This usually means you are early stage and have not yet found the motion that compounds. Pick one motion to test for 90 days with 60% of your GTM effort. Measure pipeline contribution. The scores will separate after one quarter of focused execution.");
  }
  const reasonFor = (m) => {
    const ups = applied.filter((a) => a.change && typeof a.change[m] === "number" && a.change[m] > 0 && !/^Stage starting point/.test(a.rule)).map((a) => a.rule + " (" + m + " +" + a.change[m] + ")");
    return MOTIONS[m] + " scores " + sc[m] + " of 10: " + stageLabel + " starting point " + applied[0].change[m] + (ups.length ? "; " + ups.join("; ") : "; no further adjustment raised it") + ".";
  };
  if (sc[ranked[0]] === sc[ranked[1]]) {
    notes.push("Tie at the top between " + ranked[0] + " and " + ranked[1] + ": the lead goes to the motion with lower execution complexity, in the order E, P, C, I.");
  }
  const preliminary = skipped.length > 0;
  return {
    method: "EPIC motion scoring, advanced version (epic-motion-diagnostic rubric, Helix GTM Consulting)",
    scale: "1 to 10 per motion",
    scores: { E: sc.E, P: sc.P, I: sc.I, C: sc.C },
    primary: { letter: ranked[0], motion: MOTIONS[ranked[0]], reason: reasonFor(ranked[0]) },
    secondary: { letter: ranked[1], motion: MOTIONS[ranked[1]], reason: reasonFor(ranked[1]) },
    warnings,
    notes,
    preliminary,
    skipped_adjustments: skipped,
    preliminary_note: preliminary ? "Preliminary: rerun when you have " + skipped.join(", ") + "." : null,
    stage_used: stageLabel,
    adjustments_applied: applied
  };
}
