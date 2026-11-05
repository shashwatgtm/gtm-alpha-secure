import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp-sse.js';
test('Audit role checks separate score bands from empirical motion fit',async()=>{
 const args={company_name:'Test service',challenge:'Choose an acquisition test before hiring',acv_usd:24000,nrr_percent:108,deal_cycle_days:90,tam_accounts:2500,deal_source:'referrals',current_channels:'Buyer introductions'};
 const r=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'epic_audit',arguments:args}})}));
 const data=(await r.json()).result;assert.ok(data&&!data.isError);const text=data.content[0].text;
 const lines=text.split('\n').filter(x=>/^(Founder|CEO|CMO|CRO|Demand generation head):/.test(x));assert.equal(lines.length,5);
 assert.match(lines[0],/runner up.*lower scoring/);assert.match(lines[1],/24,000.*108%.*cohort and period/);assert.match(lines[2],/Buyer introductions.*activity from accepted customer value/);
 assert.match(lines[3],/90 day.*referrals.*won and lost/);assert.match(lines[4],/2,500.*contactability and fit/);
 assert.match(text,/not observed commercial fit/);assert.match(text,/preliminary status/);assert.match(text,/buyer test contradicts the lead motion/);
});
