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

// Run 12 R12-20 (D1 proposal 1): one set of motion names in the report, the Claude answers and tools/list (the tools/list names).
export const MOTIONS = {
  E: "Ecosystem and ABM",
  P: "Product-Led Growth",
  I: "Inbound and Outbound",
  C: "Community-Led"
};

// Run 12 R12-20 (D1 proposal 1): what leading with each motion means, word for word from https://gtmhelix.com/epic/
// (read live on 29 September 2026). Shown in the browser report under "What leading with <motion> means".
export const MOTION_MEANS = {
  E: "Win large, multi-stakeholder deals through target accounts, partners and analysts. It tends to lead when deal cycles run past 90 days, deals are large, the market has few accounts, or partners bring revenue.",
  P: "Let users reach value on their own, then turn that usage into revenue. It tends to lead when people can get value without talking to sales and the product can be tried on its own.",
  I: "Build a steady pipeline with content, search, campaigns and outbound teams. It tends to lead when the market is large, pipeline is the main constraint, or a new category needs educating.",
  C: "Grow through customers who vouch for you: references, reviews and peer groups. It tends to lead when net revenue retention is the north star and buyers trust peers over vendors."
};

// The per-motion plan steps of the browser report (moved here from netlify/lib/analyze.js in run 12, words unchanged), so the
// report and the generate_roadmap tool in Claude use the same steps. days_30, days_60 and first_quarter are the Claude
// roadmap's immediate, short-term and medium-term steps; second_quarter is used by the 180 day browser report only.
export const ROADMAP_STEPS = {
  P: {
    days_30: [
      'Audit current user onboarding flow and identify friction points',
      'Implement product usage analytics and user tracking',
      'Create self-service trial experience design'
    ],
    days_60: [
      'Launch optimized onboarding flow with progressive disclosure',
      'Implement usage-based engagement triggers and expansion prompts',
      'A/B test pricing page and conversion funnel optimization'
    ],
    first_quarter: [
      'Scale successful PLG motions with automated user journey optimization',
      'Launch referral program and viral growth mechanisms',
      'Measure and optimize product-qualified lead (PQL) conversion'
    ],
    second_quarter: [
      'Implement advanced product-led sales (PLS) hybrid model',
      'Launch enterprise PLG features with white-glove onboarding',
      'Optimize product-market fit based on comprehensive usage analytics'
    ]
  },
  E: {
    days_30: [
      'Map current partner ecosystem and identify strategic gaps',
      'Develop ideal customer profile (ICP) for ABM targeting',
      'Research and prioritize top 50 enterprise prospects'
    ],
    days_60: [
      'Launch pilot ABM campaigns for top 20 enterprise accounts',
      'Establish strategic partnerships with complementary solution providers',
      'Implement relationship intelligence tools and account mapping'
    ],
    first_quarter: [
      'Scale ABM approach with personalized account journeys',
      'Expand partner ecosystem with joint go-to-market initiatives',
      'Launch partner enablement program with co-marketing materials'
    ],
    second_quarter: [
      'Develop enterprise channel partner program with certification',
      'Launch strategic alliance partnerships with technology integrations',
      'Measure partnership-driven pipeline and optimize ROI'
    ]
  },
  I: {
    days_30: [
      'Complete buyer persona research and journey mapping',
      'Audit content strategy and identify high-intent keywords',
      'Create editorial calendar aligned with sales cycles'
    ],
    days_60: [
      'Launch thought leadership content series targeting decision makers',
      'Implement lead scoring and marketing automation workflows',
      'Begin hyper-personalized outbound campaigns based on content engagement'
    ],
    first_quarter: [
      'Scale content distribution across multiple channels and platforms',
      'Optimize conversion paths with A/B tested landing pages',
      'Implement attribution modeling for content-driven pipeline'
    ],
    second_quarter: [
      'Launch account-based content strategy for enterprise prospects',
      'Implement advanced marketing automation with predictive scoring',
      'Develop thought leadership speaking and industry recognition strategy'
    ]
  },
  C: {
    days_30: [
      'Define community vision and core value proposition',
      'Research community platforms and engagement strategies',
      'Create founding member outreach and onboarding process'
    ],
    days_60: [
      'Launch community with high-value content and expert positioning',
      'Implement community engagement and moderation workflows',
      'Begin thought leadership content creation from community insights'
    ],
    first_quarter: [
      'Scale community growth with member-driven content and advocacy',
      'Launch community-driven product feedback and development cycles',
      'Measure community engagement impact on sales and retention metrics'
    ],
    second_quarter: [
      'Develop community-led customer success and expansion programs',
      'Launch industry events and community-driven thought leadership',
      'Implement community influence on product roadmap and strategy'
    ]
  }
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
  if (/series[\s_-]?[c-z]\b|series[\s_-]?c\+|\bscale|enterprise|mature|late[\s_-]?stage|\bipo\b|public|\blisted\b|\bnasdaq\b|\bnyse\b/.test(s)) return "series_c";
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

  const stageGiven = String(inp.business_stage || inp.stage || "").trim() !== "";
  const row = stageRow(inp.business_stage || inp.stage);
  let stageLabel;
  let sc;
  if (row) {
    sc = { ...STAGE_DEFAULTS[row].scores };
    stageLabel = STAGE_DEFAULTS[row].label;
  } else {
    // Run 20 round 1b (D92): before, a missing or unreadable stage was scored as Series B (E 7, P 5, I 6, C 6) and called Series B,
    // which is wrong for a listed company or a bootstrapped one. Now no stage is assumed: every motion starts at the middle of the
    // scale (5) and only the inputs given move it. The answer says the stage was not given.
    sc = { E: 5, P: 5, I: 5, C: 5 };
    stageLabel = stageGiven ? "Stage not recognised (no stage assumed; every motion starts at 5 of 10)" : "Stage not given (no stage assumed; every motion starts at 5 of 10)";
    skipped.push("business stage");
  }
  // Run 14 D31a: `applied` (returned as adjustments_applied, and used by the browser report's "why these scores"
  // list) is unchanged by this fix: same entries, same order, same words, as before. `reasonTimeline` is a second,
  // internal record of the same entries plus the 1 to 10 clamp events (see clampAndRecord, below), in the exact
  // order things happened; only reasonFor (further down) reads it, to build the per-motion reason line.
  const reasonTimeline = [];
  const record = (entry) => { applied.push(entry); reasonTimeline.push(entry); };
  record({ rule: "Stage starting point: " + stageLabel, change: { ...sc } });
  const add = (rule, d) => { for (const k of Object.keys(d)) sc[k] += d[k]; record({ rule, change: d }); };
  // When the 1 to 10 clamp actually moves a motion's running total, record it in reasonTimeline only (never in
  // `applied`), in the order it happens, so the reason line can say so in plain words instead of silently dropping
  // the adjustment that caused it. No effect on the scores themselves: sc[k] ends at the same clamped value as before.
  const clampAndRecord = () => {
    for (const k of Object.keys(sc)) {
      const before = sc[k];
      const after = clamp(before);
      if (after !== before) reasonTimeline.push({ rule: "Held at the scale limit", change: { [k]: after - before }, isClamp: true, clampValue: after });
      sc[k] = after;
    }
  };

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
    record({ rule: "Industry cap: P capped at 4 (" + inp.industry + "; self-serve is structurally unlikely)", change: { P: 4 - sc.P } });
    sc.P = 4;
  }

  clampAndRecord();

  const text = [inp.gtm_challenge, inp.challenge, inp.company_description, inp.current_channels].filter(Boolean).join(" ");
  if (nrr === "low" && LEAKY.test(text)) {
    sc.I -= 1;
    record({ rule: "Override: leaky bucket (NRR below 100 percent and an acquisition-framed challenge)", change: { I: -1 } });
    warnings.push("Adding top of funnel while NRR is below 100% fills and empties simultaneously. Fix retention first.");
  }
  if (AEO.test(text)) {
    sc.I -= 2; sc.C += 2;
    record({ rule: "Override: AEO and GEO inbound disruption", change: { I: -2, C: 2 } });
    warnings.push("Inbound SEO is structurally disrupted by AI search. The fix is not more content. It is becoming the source that LLMs cite: G2 reviews, community threads, analyst mentions, peer recommendations.");
  }
  if (sc.P > 6 && sc.E > 6 && UPMARKET.test(text)) {
    warnings.push("Hybrid motion detected. PLG for land, Ecosystem for expand. Sequence matters: build self-serve conversion infrastructure first, then layer ABM on accounts with 10+ active free users (Example figure: replace with your own).");
  }
  clampAndRecord();

  // Run 19 (D80, problem 4): a motion the inputs rule out never wins a tie. When self_serve is false, Product-Led Growth moves
  // to the end of the tie-break order (E, C, I, P); its score is unchanged. Before run 19 the order was always E, P, C, I.
  // Run 20 round 1b (D92): the same holds when self_serve is not given. Product-Led Growth needs a product people can use alone, which
  // is the one thing the inputs have not shown, so it wins a tie only when self_serve is true. Scores are unchanged.
  const tieOrder = selfServe === true ? TIE_ORDER : ["E", "C", "I", "P"];
  const ranked = ["E", "P", "I", "C"].sort((a, b) => (sc[b] - sc[a]) || (tieOrder.indexOf(a) - tieOrder.indexOf(b)));
  const vals = Object.values(sc);
  if (Math.max(...vals) - Math.min(...vals) <= 2) {
    // Run 12 R12-20 and R12-43: the note never calls the company early stage (the input may say Series B) and makes no prediction;
    // the rule and the scores are unchanged.
    notes.push("Your scores are evenly distributed. " + "This usually means no motion has pulled ahead yet." + " Pick one motion to test for 90 days with 60% of your GTM effort (Example figure: replace with your own). Measure pipeline contribution, then score again after a quarter to see whether that motion pulls ahead.");
  }
  // Run 14 D31a: list every adjustment applied to this motion after the starting point, raises and cuts alike, in the
  // order they happened (the industry cap and the two overrides are already in `reasonTimeline` in that order;
  // clampAndRecord adds a "Held at the scale limit" entry exactly where the 1 to 10 clamp changed a value). Starting
  // point plus every listed part, in order, always equals the score shown. `applied` itself (adjustments_applied,
  // read by the browser report's "why these scores" list) is untouched by this.
  const reasonFor = (m) => {
    const parts = [];
    for (let i = 1; i < reasonTimeline.length; i++) {
      const a = reasonTimeline[i];
      if (!a.change || typeof a.change[m] !== "number" || a.change[m] === 0) continue;
      if (a.isClamp) parts.push("held at " + a.clampValue + ", the " + (a.clampValue === 10 ? "top" : "bottom") + " of the scale");
      else parts.push(a.rule + " (" + m + " " + (a.change[m] > 0 ? "+" : "") + a.change[m] + ")");
    }
    const start = row ? stageLabel + " starting point " + reasonTimeline[0].change[m]
      : (stageGiven ? "stage not recognised, so no stage is assumed: starting point " : "stage not given, so no stage is assumed: starting point ") + reasonTimeline[0].change[m];
    return MOTIONS[m] + " scores " + sc[m] + " of 10: " + start + (parts.length ? "; " + parts.join("; ") : "; no further adjustment changed it") + ".";
  };
  if (sc[ranked[0]] === sc[ranked[1]]) {
    const tied = ranked.filter((k) => sc[k] === sc[ranked[0]]);
    const tiedText = tied.length === 2 ? tied[0] + " and " + tied[1] : tied.slice(0, -1).join(", ") + " and " + tied[tied.length - 1];
    notes.push("Tie at the top between " + tiedText + (tied.length === 4 ? " (all four motions tie, so nothing in the inputs given separated them)" : "") + ": the lead goes to the motion with lower execution complexity, in the order " + tieOrder.join(", ") + "." + (selfServe === false ? " Product-Led Growth comes last in that order because you said there is no self-serve product." : selfServe === null ? " The product-led motion comes last in that order because self_serve was not given." : ""));
  }
  const preliminary = skipped.length > 0;
  // Run 20 round 1b (D92): every input is read back with the band it fell in and what it did to the scores (or why it did nothing),
  // so no input given is silently unused. Wording only: the scores above are not touched by this.
  const shown = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : String(v).trim());
  const given = (v) => v !== null && v !== undefined && v !== "";
  const acvRaw = inp.acv_usd != null ? inp.acv_usd : inp.acv;
  const cycRaw = inp.deal_cycle_days != null ? inp.deal_cycle_days : inp.deal_cycle;
  const nrrRaw = inp.nrr_percent != null ? inp.nrr_percent : inp.nrr;
  const tamRaw = inp.tam_accounts != null ? inp.tam_accounts : inp.tam;
  const inputsRead = [];
  inputsRead.push(row ? "Stage: " + stageLabel + ", the documented starting row." : stageGiven ? "Stage not recognised: no stage is assumed and every motion starts at 5 of 10. Use pre-seed, seed, series-a, series-b, series-c, bootstrapped or a word such as listed to set it." : "Stage not given: no stage is assumed and every motion starts at 5 of 10. Giving it (pre-seed, seed, series-a, series-b, series-c, bootstrapped) sets the documented starting row.");
  inputsRead.push(!given(acvRaw) ? "ACV: not given, no adjustment. Above 50,000 US dollars adds 2 to Ecosystem and ABM; below 5,000 adds 2 to Product-Led."
    : acv === "high" ? "ACV " + shown(acvRaw) + " US dollars is above 50,000: Ecosystem and ABM +2, Product-Led -1 (applied)."
    : acv === "low" ? "ACV " + shown(acvRaw) + " US dollars is below 5,000: Product-Led +2, Ecosystem and ABM -1 (applied)."
    : acv === "mid" ? "ACV " + shown(acvRaw) + " US dollars is between 5,000 and 50,000: no adjustment (the rubric moves scores only above 50,000 or below 5,000)."
    : "ACV: \"" + shown(acvRaw) + "\" could not be read as an amount, no adjustment.");
  inputsRead.push(!given(cycRaw) ? "Deal cycle: not given, no adjustment. Above 90 days adds 2 to Ecosystem and ABM; below 14 days adds 2 to Product-Led."
    : cyc === "high" ? "Deal cycle " + shown(cycRaw) + " days is above 90: Ecosystem and ABM +2, Inbound and Outbound -1 (applied)."
    : cyc === "low" ? "Deal cycle " + shown(cycRaw) + " days is below 14: Product-Led +2, Ecosystem and ABM -1 (applied)."
    : cyc === "mid" ? "Deal cycle " + shown(cycRaw) + " days is between 14 and 90: no adjustment (the rubric moves scores only above 90 or below 14 days)."
    : "Deal cycle: \"" + shown(cycRaw) + "\" could not be read as days, no adjustment.");
  inputsRead.push(!given(nrrRaw) ? "NRR: not given, no adjustment. Below 100 percent adds 2 to Community-Led; above 120 adds 1 each to Community-Led and Product-Led."
    : nrr === "low" ? "NRR " + shown(nrrRaw) + " percent is below 100: Community-Led +2, Inbound and Outbound -1 (applied; fix retention before scaling acquisition)."
    : nrr === "high" ? "NRR " + shown(nrrRaw) + " percent is above 120: Community-Led +1, Product-Led +1 (applied; expansion is working)."
    : nrr === "mid" ? "NRR " + shown(nrrRaw) + " percent is between 100 and 120: no adjustment (the rubric moves scores only below 100 or above 120)."
    : "NRR: \"" + shown(nrrRaw) + "\" could not be read as a percent, no adjustment.");
  inputsRead.push(!given(tamRaw) ? "TAM: not given, no adjustment. Below 500 accounts adds 2 to Ecosystem and ABM; above 10,000 adds 2 to Inbound and Outbound."
    : tam === "high" ? "TAM " + shown(tamRaw) + " accounts is above 10,000: Inbound and Outbound +2, Ecosystem and ABM -1 (applied)."
    : tam === "low" ? "TAM " + shown(tamRaw) + " accounts is below 500: Ecosystem and ABM +2, Inbound and Outbound -1 (applied)."
    : tam === "mid" ? "TAM " + shown(tamRaw) + " accounts is between 500 and 10,000: no adjustment (the rubric moves scores only below 500 or above 10,000 accounts)."
    : "TAM: \"" + shown(tamRaw) + "\" could not be read as a count, no adjustment.");
  inputsRead.push(selfServe === true ? "Self-serve: yes, Product-Led +2 (applied)." : selfServe === false ? "Self-serve: no, no adjustment, and Product-Led comes last in the tie-break." : "Self-serve: not given, no adjustment. True adds 2 to Product-Led.");
  inputsRead.push(source === null ? "Deal source: not given, no adjustment. Referrals add 3 to Community-Led, outbound 2 to Inbound and Outbound, partnerships 2 to Ecosystem and ABM." : source === "mixed" ? "Deal source: mixed, no adjustment (no dominant channel)." : "Deal source: " + source + " (applied, see the reasons).");
  inputsRead.push(geo === null ? "Geography: not given, no adjustment. India, the Middle East and APAC lift Ecosystem and ABM; the US or EU lifts Inbound and Outbound by 1." : geo === "global" ? "Geography: global, no adjustment." : "Geography: " + geo.replace("_", " or ").replace("us or eu", "US or EU") + " (applied, see the reasons).");
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
    inputs_read: inputsRead,
    adjustments_applied: applied
  };
}
