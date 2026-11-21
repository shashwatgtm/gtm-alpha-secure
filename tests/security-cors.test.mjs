import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp-sse.js';
test('hostile preflight receives no cross-origin grant',async()=>{
 const r=await handler(new Request('https://example.invalid/mcp',{method:'OPTIONS',headers:{Origin:'https://evil.example'}}));
 assert.equal(r.headers.get('access-control-allow-origin'),null);
});
test('non-browser tools/list remains available without CORS',async()=>{
 const r=await handler(new Request('https://example.invalid/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{}})}));
 assert.equal(r.status,200);assert.equal(r.headers.get('access-control-allow-origin'),null);
 const data=await r.json();assert.ok(data.result.tools.length>0);
});
