import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp-sse.js';
async function call(args){const r=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'gtm_consultation',arguments:args}})}));const data=(await r.json()).result;assert.ok(data&&!data.isError);return data.content[0].text;}
test('Consultation requires acquisition and delivery evidence before expanding the sales team',async()=>{
 const text=await call({company_name:'Test service',gtm_challenge:'Validate a second sales team',business_model:'services',acv_usd:24000,deal_cycle_days:90,tam_accounts:2500,current_channels:'Buyer referrals'});
 const lines=text.split('\n').filter(x=>/^(Founder|CEO|CMO|CRO|Demand generation head):/.test(x));assert.equal(lines.length,5);
 assert.match(lines[0],/Validate a second sales team.*reverse/);assert.match(lines[1],/finance and the delivery lead.*before adding staff/);
 assert.match(lines[2],/Buyer referrals.*measured results/);assert.match(lines[3],/24,000.*90 day.*closed and lost/);assert.match(lines[4],/2,500.*acquisition effort/);
 assert.match(text,/does not establish that hiring another sales team will pay back/);assert.match(text,/The conclusion needs review if/);
 const changed=await call({gtm_challenge:'Validate partner introductions',acv_usd:12000,deal_cycle_days:30,tam_accounts:100});
 assert.match(changed,/12,000.*30 day/);assert.doesNotMatch(changed,/24,000|Buyer referrals|2,500/);
});
