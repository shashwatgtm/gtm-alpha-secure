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
