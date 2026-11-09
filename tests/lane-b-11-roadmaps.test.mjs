import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import handler from '../netlify/functions/mcp-sse.js';
const hashes=JSON.parse(readFileSync(new URL('./fixtures/lane-b-11-roadmap-hashes.json',import.meta.url)));
const facts=JSON.parse(readFileSync(new URL('./fixtures/release-field-facts.json',import.meta.url)));
async function call(model,focus,timeframe){
 const r=await handler(new Request('https://local.invalid/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'generate_roadmap',arguments:{primary_focus:focus,timeframe,business_model:model}}})}));const b=await r.json();assert.ok(b.result&&!b.result.isError);return b.result;
}
for(const f of facts.filter(f=>['saas','ites','telecom'].includes(f.id)))test(`${f.id}: roadmap follows the supplied model`,async()=>{
 // This tool takes a model enum, not prose. Test the field facts using the available schema.
 for(const timeframe of ['30-day','60-day','90-day'])for(const focus of ['E','P','I','C']){
  const r=await call(f.model,focus,timeframe);
  if(f.model!=='saas')assert.doesNotMatch(JSON.stringify(r),/PLG motions|automated user journey/);
  if(hashes[`${f.model}/${focus}/${timeframe}`])assert.equal(createHash('sha256').update(JSON.stringify(r)).digest('hex'),hashes[`${f.model}/${focus}/${timeframe}`]);
  assert.deepEqual(r,await call(f.model,focus,timeframe));
 }
});
for(const model of ['connectivity','transactions','marketplace','hardware_software','investment'])test(`${model}: P steps use a buyer acceptance test`,async()=>{
 const r=await call(model,'P','90-day');assert.doesNotMatch(JSON.stringify(r),/PLG motions|automated user journey/);assert.match(JSON.stringify(r),/Repeat the agreed buyer test only after acceptance and acquisition cost checks pass/);
});
