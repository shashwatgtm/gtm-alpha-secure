// Fill absent structured inputs only from explicit, observed challenge facts.
export function epicInputs(input) {
  const out = {...input}, text = String(input.challenge || ''), inferred = {}, issues = [];
  const empty = key => out[key] === undefined || out[key] === null || (typeof out[key] === 'string' && !out[key].trim());
  const put = (key,value) => { if(empty(key) && value !== undefined) {out[key]=value;inferred[key]=value;} };
  const observed = match => !/\b(?:not|was|previously|target|aim|plan|hope|raise)\b/i.test(text.slice(0,match.index).split(/[.;\n]/).pop().slice(-35));
  const stages = [...text.matchAll(/\b(?:pre[ -]?seed|seed[ -](?:stage|round|funded)|series[ -]?[a-d](?:\+|\s+or\s+(?:later|higher))?|growth(?=[ -](?:stage|phase|company))|public company|publicly listed|listed company|bootstrapped)\b/gi)].filter(observed);
  const uniqueStages = [...new Set(stages.map(m=>m[0].replace(/[- ]+/g,' ').toLowerCase().replace(/^seed (?:stage|round|funded)$/,'seed').replace(/^(?:public company|publicly listed|listed company)$/,'public')))];
  if(empty('business_stage')) {if(uniqueStages.length===1)put('business_stage',uniqueStages[0]);else if(uniqueStages.length>1)issues.push('Confirm the current business stage; the challenge names more than one.');}
  const number = s => {const m=s.replace(/,/g,'').match(/(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?/i);return m?Number(m[1])*({k:1000,thousand:1000,m:1000000,million:1000000}[m[2]?.toLowerCase()]||1):undefined;};
  const amount='(?:USD|US\\$|(?<![A-Za-z])\\$)\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*(?:million|thousand|[km]\\b)?';
  const label='(?:acv|(?:average |annual )?(?:contract value|deal size))';
  const acv=text.match(new RegExp('\\b'+label+'\\s*(?:is|of|:|=)?\\s*('+amount+')','i')) || text.match(new RegExp('('+amount+')\\s*(?:annual )?'+label+'\\b','i'));
  if(acv && observed(acv))put('acv_usd',number(acv[1]));
  if(empty('acv_usd') && /\b(?:acv|deal size|contract value)\b/i.test(text))issues.push('Supply ACV in USD to apply the USD deal-size thresholds; no exchange rate is assumed.');
  const cycle=text.match(/\b(?:sales|deal)\s+cycle\s*(?:is|of|:|=)?\s*(\d+(?:\.\d+)?)\s*[- ]?\s*(days?|weeks?|months?)\b/i) || text.match(/\b(\d+(?:\.\d+)?)\s*[- ]?\s*(days?|weeks?|months?)\s+(?:sales|deal)\s+cycle\b/i);
  if(cycle && observed(cycle))put('deal_cycle_days',Number(cycle[1])*(/^week/i.test(cycle[2])?7:/^month/i.test(cycle[2])?30:1));
  const accounts=text.match(/\b(\d[\d,]*(?:\.\d+)?\s*[km]?)\s+(?:addressable|potential|target|total)\s+(?:accounts?|companies)\b/i) || text.match(/\b(?:tam|account count|addressable accounts)\s*(?:is|of|:|=)?\s*(\d[\d,]*(?:\.\d+)?\s*[km]?)/i);
  if(accounts && observed(accounts))put('tam_accounts',number(accounts[1]));
  // Region names need geographic context. Uppercase abbreviations never match the pronoun "us".
  const contexts = [...text.matchAll(/\b(?:in|across|from|within|serving|serve|selling to|sell to|markets?\s*(?:is|are|:)|regions?\s*(?:is|are|:)|geography\s*(?:is|:))\s+(?:the\s+)?([^.;\n]{1,140})/gi)].map(m=>m[1]);
  contexts.push(...[...text.matchAll(/\b(?:India|United States|North America|United Kingdom|Western Europe|Europe|Southeast Asia|Singapore|Australia|Japan|Middle East|UAE|Saudi Arabia|US|USA|UK|EU|APAC|GCC)\b(?=\s+(?:market|region|customers?|buyers?|teams?|B2B))/g)].map(m=>m[0]));
  const regionText=contexts.join('; ');
  const regions=[['india',/\bIndia\b/i.test(regionText)],['us_eu',/\b(?:US|USA|UK|EU)\b/.test(regionText)||/\b(?:United States|North America|United Kingdom|(?:Western )?Europe)\b/i.test(regionText)],['apac',/\bAPAC\b/.test(regionText)||/\b(?:Southeast Asia|South East Asia|Singapore|Australia|Japan)\b/i.test(regionText)],['middle_east',/\b(?:GCC|UAE)\b/.test(regionText)||/\b(?:Middle East|Saudi Arabia)\b/i.test(regionText)]].filter(([,yes])=>yes).map(([region])=>region);
  put('geography',/\bglobal(?:ly)?\s+(?:market|customers?|buyers?|company|presence|operations)|\b(?:operate|sell|serving|serve)\s+globally\b/i.test(text)||regions.length>1?'global':regions[0]);
  return {args:out,inferred,issues};
}

// Keep the existing preliminary/default-stage score when the caller has real business context.
export function hasEpicContext(input) {
  const fields=['industry','acv_usd','deal_cycle_days','tam_accounts','geography','nrr_percent','current_channels','business_model','deal_source','company_size','revenue_range','self_serve'];
  return fields.some(k=>input[k]!==undefined&&input[k]!==null&&String(input[k]).trim()!=='') || /\b(?:sell|selling|serve|serving|software|fintech|telecom|cybersecurity|services?|customers?|buyers?|pipeline|revenue|renewal|conversion|retention|onboarding|contract|sales cycle|deal size|ACV|accounts?)\b/i.test(String(input.challenge||''));
}
