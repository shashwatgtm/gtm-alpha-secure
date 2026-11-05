const labels = {
  E: 'Ecosystem led growth', P: 'Product led growth', I: 'Inbound and outbound', C: 'Community led growth',
  epic_scores: 'EPIC rubric scores', consultation_output: 'Consultation', primaryFocus: 'First motion to test',
  primary_focus: 'First motion to test', sector_notes: 'Sector hypotheses to check', who_decides: 'Buying roles to confirm',
  what_it_measures: 'Possible measures', usual_objections: 'Questions to validate', proof_that_lands: 'Evidence to collect',
  sales_motion: 'Proposed sales motion', action_plan: 'Proposed actions', first_30_days: 'First month',
  scores: 'Rubric scores', recommendation: 'Suggested motion', notes: 'Limits and assumptions', preliminary_note: 'Evidence limit',
  source_classification: 'Source classification',
};
const label = key => labels[key] || key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c=>c.toUpperCase());
// Services need a delivery test, not a filtered software launch checklist.
export function serviceRoadmap(letter) {
  const first = {
    E: 'Ask a potential referral partner and the buyer to confirm the service problem, introduction owner and approval route.',
    P: 'Define a bounded service engagement with the buyer, including deliverable, exclusions and acceptance evidence.',
    I: 'Interview the intended service buyer and test one outreach message against an observed delivery problem.',
    C: 'Ask a willing customer to review a service outcome with peers; confirm permission before inviting anyone.'
  };
  return {
    days_30: [
      first[letter],
      'Have the delivery lead estimate staff hours and available capacity for the first engagement; finance checks the fee against that cost.',
      'Agree the buyer acceptance check, accountable service owner and review date before promising a start.'
    ],
    days_60: [
      'Run the agreed service engagement within the confirmed staffing and scope; record actual hours, exceptions and rework.',
      'Ask the buyer to accept or reject the deliverable using the agreed evidence; record unresolved concerns.',
      'Compare the actual acquisition and delivery cost with the agreed fee before accepting more work.'
    ],
    first_quarter: [
      'Repeat the engagement only if the buyer acceptance and margin checks pass; otherwise revise scope, fee or delivery method.',
      'Ask the delivery lead to confirm spare capacity before widening the account or referral list.',
      'Review buyer outcomes and repeat purchase intent before adding a sales team; dates remain proposed until owners agree.'
    ]
  };
}

export function alphaReading(name, args, result = "") {
  const short = (v, fallback) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= 150 && !/[\r\n]/.test(v) ? v.trim() : fallback;
  const amount = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? v.toLocaleString("en-US", {maximumFractionDigits: 6}) : fallback;
  const company = short(args.company_name, "this business");
  const focus = result.match(/\*\*Suggested motion:\*\* ([^\n]+)/)?.[1] || result.match(/\*\*First motion to test:\*\* ([^\n]+)/)?.[1] || "the leading motion";
  if (name === "gtm_consultation") {
    const channels=short(args.current_channels,"the stated acquisition channels"), challenge=short(args.gtm_challenge,"the supplied growth challenge");
    return `\n\n## Reading the answer\n\nFor ${company}, the rubric supports a first test of ${focus}. It does not establish that hiring another sales team will pay back. Acquisition cost, buyer acceptance and delivery capacity need direct evidence. The conclusion needs review if a comparable buyer cannot complete the proposed first step, delivery misses acceptance, or measured acquisition and delivery costs exceed the agreed budget.\n\n## Decisions by role\n\nProposed owners. Confirm the named person before acting.\n\nFounder: ask a buyer to test the assumption behind "${challenge}" before endorsing ${focus}; record the buyer observation that would reverse the choice.\n\nCEO: have finance and the delivery lead cost a small ${focus} test for ${company} before adding staff; agree a spending limit and stop if accepted work cannot cover acquisition and delivery cost.\n\nCMO: separate the supplied channel description "${channels}" from measured results; check source, period and buyer acceptance before claiming the channel works.\n\nCRO: compare the supplied annual value of USD ${amount(args.acv_usd,"not stated")} and ${amount(args.deal_cycle_days,"unstated")} day cycle with closed and lost deals before expanding ${focus}; record scope and cycle differences.\n\nDemand generation head: choose a small, dated account sample from the ${amount(args.tam_accounts,"unstated number of")} addressable accounts; record reach, qualified conversations and acquisition effort before widening ${focus}.\n`;
  }
  if (name === 'epic_audit') {
    const source=short(args.deal_source,"unstated source"), channels=short(args.current_channels,"the stated channels");
    return `\n\n## Reading the answer\n\nFor ${company}, the EPIC score supports comparing motion hypotheses under the published rubric. ${focus} is the rubric's lead, not observed commercial fit or a growth forecast. Missing inputs retain the report's preliminary status. The conclusion needs review if verified economics change the score bands or a buyer test contradicts the lead motion.\n\n## Decisions by role\n\nProposed owners. Confirm the named person before acting.\n\nFounder: compare ${focus} with the runner up using the same buyer problem at ${company}; record one observation that would make the lower scoring motion preferable.\n\nCEO: ask finance to verify the supplied USD ${amount(args.acv_usd,"unstated")} annual value and ${typeof args.nrr_percent === "number" ? amount(args.nrr_percent,"")+"% retention" : "retention, which is not supplied"}, including cohort and period, before using the score to allocate budget; agree a spending limit and stop condition before the buyer test.\n\nCMO: verify the source and outcomes behind "${channels}" before treating the channel description as proof of fit for ${focus}; distinguish activity from accepted customer value.\n\nCRO: check the supplied ${amount(args.deal_cycle_days,"unstated")} day sales cycle and majority source "${source}" against comparable won and lost deals before changing the motion; retain outliers and approval delays.\n\nDemand generation head: verify a dated sample of the ${amount(args.tam_accounts,"unstated number of")} addressable accounts before scaling ${focus}; measure contactability and fit separately from the rubric score.\n`;
  }
  if (name !== 'generate_roadmap') return '';
  const roadmapFocus = {E:'partner and account',P:'Product Led Growth',I:'inbound and outbound',C:'community'}[args.primary_focus] || 'selected';
  const duration = {'30-day':'30 day','60-day':'60 day','90-day':'90 day'}[args.timeframe] || '90 day default';
  const service = args.business_model === 'services';
  const work = service ? 'service engagement' : 'first buyer test';
  return `\n\n## Reading the answer\n\nThis ${duration} ${roadmapFocus} sequence supports planning ${work === 'service engagement' ? 'a bounded service engagement' : 'a buyer test'}. Team capacity, budget and an agreed start are not supplied by this tool. ${service && args.primary_focus === 'P' ? 'The selected P label is a framework choice, not evidence that a people delivered service can grow through self service. The steps test delivery and acceptance.' : 'Treat dates and example account counts as proposals.'} Review the conclusion if the buyer rejects the acceptance check or acquisition and delivery costs exceed the agreed resource limit.\n\n## Decisions by role\n\nProposed owners. Confirm the named person before acting.\n\nFounder: ask a buyer to agree the outcome and exclusions for the ${work} before accepting the ${roadmapFocus} sequence; record what would make them reject it.\n\nCEO: have the delivery lead cost the ${work} against available staff time before approving the ${duration} schedule; reduce scope if capacity is insufficient.\n\nCMO: check the claim used in the ${roadmapFocus} approach against the accepted ${work} evidence before publishing it; keep unmeasured benefits labelled as hypotheses.\n\nCRO: ask the buyer to confirm an approver, acceptance check and feasible start for the ${work} before treating the ${duration} dates as mutual commitments.\n\nDemand generation head: cap the ${roadmapFocus} outreach sample at the team's confirmed follow up capacity; compare accepted engagements and acquisition effort before increasing volume.\n`;
}
export function readableAlpha(value, depth=2) {
  if (value === null || value === undefined) return 'Not supplied';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(item=>readableAlpha(item,depth)).join('\n\n');
  return Object.entries(value).map(([key,item])=>{
    if(item===null||item===undefined)return '';
    if(typeof item!=='object'){const shown=key==='rule'?String(item).replace(/\b(logistics_tech|vertical_saas|ai_native|cybersecurity|ites|saas)\b/g, x=>({logistics_tech:'logistics technology',vertical_saas:'vertical SaaS',ai_native:'AI native',cybersecurity:'cybersecurity',ites:'IT services',saas:'SaaS'}[x])):String(item);return `**${label(key)}:** ${shown}`;}
    return `${'#'.repeat(Math.min(depth,5))} ${label(key)}\n\n${readableAlpha(item,depth+1)}`;
  }).filter(Boolean).join('\n\n');
}
