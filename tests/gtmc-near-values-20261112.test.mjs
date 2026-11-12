import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp-sse.js';

// Fix 12 Nov 2026: gtm_consultation answers, instead of refusing, when an optional value comes in a near form.
async function call(args, name = 'gtm_consultation') {
  const r = await handler(new Request('https://example.com/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }) }), { waitUntil() {} });
  return (await r.json()).result;
}
const base = { gtm_challenge: 'We sell billing software to mid-market retailers.', business_stage: 'series-a', acv_usd: 20000, deal_cycle_days: 60 };

for (const [near, exact] of [
  [{ geography: 'India' }, { geography: 'india' }],
  [{ geography: 'United States' }, { geography: 'us_eu' }],
  [{ deal_source: 'Outbound' }, { deal_source: 'outbound' }],
  [{ business_model: 'SaaS' }, { business_model: 'saas' }],
  [{ self_serve: 'yes' }, { self_serve: true }],
  [{ nrr_percent: '108%' }, { nrr_percent: 108 }],
  [{ acv_usd: '$24k' }, { acv_usd: 24000 }],
  [{ geography: '', deal_source: '', business_model: '', nrr_percent: '', self_serve: '' }, {}],
]) test('gtm_consultation reads ' + JSON.stringify(near) + ' as ' + JSON.stringify(exact), async () => {
  const a = await call({ ...base, ...near }), b = await call({ ...base, ...exact });
  assert.ok(!a.isError, a.content[0].text);
  assert.deepEqual(a.structuredContent, b.structuredContent);
});

test('gtm_consultation leaves out an unknown optional choice and says so', async () => {
  const r = await call({ ...base, deal_source: 'events' });
  assert.ok(!r.isError);
  assert.match(r.content[0].text, /Input note: deal_source was left out/);
});

test('gtm_consultation reads arguments sent as a JSON string', async () => {
  const r = await call(JSON.stringify(base));
  assert.ok(!r.isError, r.content[0].text);
});

test('gtm_consultation still refuses a missing challenge, a negative amount and a wrong type', async () => {
  assert.ok((await call({ gtm_challenge: '' })).isError);
  assert.ok((await call({ ...base, acv_usd: -5 })).isError);
  assert.ok((await call({ ...base, self_serve: 'maybe' })).isError);
});

test('the other tools are unchanged: epic_audit still refuses a near enum value', async () => {
  const r = await call({ challenge: 'We sell billing software.', geography: 'India' }, 'epic_audit');
  assert.ok(r.isError);
});
