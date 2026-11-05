import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp-sse.js';
async function call(name,args){
 const r=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}));
 const body=await r.json();assert.ok(body.result&&!body.result.isError,JSON.stringify(body));return body.result;
}
for(const primary_focus of ['E','P','I','C'])test(`Services ${primary_focus} roadmap tests delivery and acceptance without product assumptions`,async()=>{
 const args={primary_focus,timeframe:'60-day',business_model:'services'};
 const runs=await Promise.all([call('generate_roadmap',args),call('generate_roadmap',args),call('generate_roadmap',args)]);
 assert.deepEqual(runs[0],runs[1]);assert.deepEqual(runs[0],runs[2]);
 const text=runs[0].content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
 assert.match(text,/staff hours|staff time/);assert.match(text,/actual acquisition and delivery cost/);assert.match(text,/accept or reject the deliverable/);
 assert.doesNotMatch(text,/product usage analytics|user tracking|progressive disclosure|automated user journey|product feedback and development|relationship intelligence tools/);
 assert.equal(text.split('\n').filter(x=>/^(Founder|CEO|CMO|CRO|Demand generation head):/.test(x)).length,5);
 assert.match(text,/capacity.*not supplied|capacity, budget.*not supplied/);assert.match(text,/Review the conclusion if/);
 if(primary_focus==='P')assert.match(text,/not evidence that a people delivered service can grow through self service/);
});
test('Software roadmap retains its original product steps',async()=>{
 const r=await call('generate_roadmap',{primary_focus:'P',timeframe:'90-day',business_model:'saas'});
 assert.match(JSON.stringify(r),/product usage analytics/);assert.doesNotMatch(JSON.stringify(r),/staff hours and available capacity for the first engagement/);
});
