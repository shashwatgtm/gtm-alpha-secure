// Fill absent structured inputs only from explicit, observed challenge facts.
export function epicInputs(input) {
  const out = {...input}, text = String(input.challenge || ''), inferred = {}, issues = [];
  const empty = key => out[key] === undefined || out[key] === null || (typeof out[key] === 'string' && !out[key].trim());
  const put = (key,value) => { if(empty(key) && value !== undefined) {out[key]=value;inferred[key]=value;} };
  const observed = match => !/\b(?:not|was|previously|target|aim|plan|hope|raise)\b/i.test(text.slice(0,match.index).split(/[.;\n]/).pop().slice(-35));
  const stages = [...text.matchAll(/\b(?:pre[ -]?seed|seed|series[ -]?[a-d](?:\+|\s+or\s+(?:later|higher))?|growth(?=[ -](?:stage|phase|company))|public(?:ly listed)?|bootstrapped)\b/gi)].filter(observed);
  const uniqueStages = [...new Set(stages.map(m=>m[0].replace(/[- ]+/g,' ').toLowerCase()))];
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
  const regions=[['india',/\bIndia\b/i],['us_eu',/\b(?:US|USA|United States|North America|UK|United Kingdom|(?:Western )?Europe|EU)\b/i],['apac',/\b(?:Southeast Asia|South East Asia|APAC|Singapore|Australia|Japan)\b/i],['middle_east',/\b(?:Middle East|GCC|UAE|Saudi Arabia)\b/i]].filter(([,r])=>r.test(text)).map(([r])=>r);
  put('geography',/\bglobal\b/i.test(text)||regions.length>1?'global':regions[0]);
  return {args:out,inferred,issues};
}
