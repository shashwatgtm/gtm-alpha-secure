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

test('gtm_consultation asks for a known deal source before scoring', async () => {
  const r = await call({ ...base, deal_source: 'events' });
  assert.ok(r.isError);
  assert.match(r.content[0].text, /choose deal_source from/);
});

test('gtm_consultation reads arguments sent as a JSON string', async () => {
  const r = await call(JSON.stringify(base));
  assert.ok(!r.isError, r.content[0].text);
});

test('gtm_consultation still refuses a missing challenge and a negative amount; an unreadable optional value is left out with a note', async () => {
  assert.ok((await call({ gtm_challenge: '' })).isError);
  assert.ok((await call({ ...base, acv_usd: -5 })).isError);
  assert.ok((await call({ ...base, acv_usd: '-5' })).isError);
  const r = await call({ ...base, self_serve: 'maybe' });
  assert.ok(!r.isError);
  assert.match(r.content[0].text, /Input note: self_serve was left out/);
});

// Round 2 (12 Nov 2026): the same reading for epic_audit and generate_roadmap.
const eb = { challenge: 'We sell billing software to mid-market retailers.', business_stage: 'series-a', acv_usd: 20000 };
for (const [tool, near, exact] of [
  ['epic_audit', { ...eb, geography: 'India' }, { ...eb, geography: 'india' }],
  ['epic_audit', { ...eb, deal_source: 'Partners', self_serve: 'no' }, { ...eb, deal_source: 'partnerships', self_serve: false }],
  ['epic_audit', { ...eb, nrr_percent: '108%', geography: '' }, { ...eb, nrr_percent: 108 }],
  ['generate_roadmap', { primary_focus: 'p' }, { primary_focus: 'P' }],
  ['generate_roadmap', { primary_focus: 'Product-Led Growth', timeframe: '30 days' }, { primary_focus: 'P', timeframe: '30-day' }],
  ['generate_roadmap', { primary_focus: 'I', timeframe: '3 months', business_model: 'SaaS' }, { primary_focus: 'I', timeframe: '90-day', business_model: 'saas' }],
  ['generate_roadmap', { primary_focus: 'E', timeframe: '', business_model: '' }, { primary_focus: 'E' }],
]) test(tool + ' reads ' + JSON.stringify(near) + ' as the exact value', async () => {
  const a = await call(near, tool), b = await call(exact, tool);
  assert.ok(!a.isError, a.content[0].text);
  assert.deepEqual(a.structuredContent, b.structuredContent);
});

test('generate_roadmap refuses an unsupported timeframe and an unknown or missing motion', async () => {
  const r = await call({ primary_focus: 'I', timeframe: '6 months' }, 'generate_roadmap');
  assert.ok(r.isError);
  assert.match(r.content[0].text, /30-day.*60-day.*90-day/);
  assert.ok((await call({ primary_focus: 'Z' }, 'generate_roadmap')).isError);
  assert.ok((await call({ timeframe: '90-day' }, 'generate_roadmap')).isError);
});

test('epic_audit still refuses a missing challenge and a negative amount', async () => {
  assert.ok((await call({ challenge: '' }, 'epic_audit')).isError);
  assert.ok((await call({ ...eb, acv_usd: -5 }, 'epic_audit')).isError);
});

for (const [name, input] of [['gtm_consultation', base], ['epic_audit', eb]]) {
  for (const [field, value, choices] of [
    ['geography', 'South America', /india.*us_eu.*middle_east.*apac.*global/],
    ['deal_source', 'trade fairs', /referrals.*outbound.*partnerships.*inbound.*mixed/]
  ]) test(name + ' asks for a valid ' + field + ' before scoring', async () => {
    const response = await call({...input, [field]: value}, name);
    assert.equal(response.isError, true);
    assert.match(response.content[0].text, choices);
    assert.match(response.content[0].text, /choose|which/i);
    assert.equal(response.structuredContent, undefined);
  });
}

const scoringCases = [
  ['B2B SaaS', 'Subscription billing software'], ['fintech', 'Payment reconciliation'],
  ['HR tech', 'Shift scheduling software'], ['sales tech', 'Call coaching software'],
  ['ops tech', 'Equipment maintenance planning'], ['ITeS', 'Managed application support'],
  ['AI-native', 'Support agent with human escalation'], ['cybersecurity', 'Cloud exposure management'],
  ['martech', 'Consent measurement software']
];
for (const [vertical, product] of scoringCases) {
  test(vertical + ' verifies scoring and clarification twice on both tools', async () => {
    for (const [name, challenge] of [['gtm_consultation', 'gtm_challenge'], ['epic_audit', 'challenge']]) {
      const valid = {...eb, [challenge]: 'We sell ' + product + ' to regional operators.', industry: vertical,
        geography: 'india', deal_source: 'referrals'};
      if (challenge !== 'challenge') delete valid.challenge;
      for (const fields of [{}, {geography: 'South America'}, {deal_source: 'trade fairs'}]) {
        const args = {...valid, ...fields};
        const response = await call(args, name);
        assert.deepEqual(await call(args, name), response);
        assert.equal(Boolean(response.isError), Object.keys(fields).length > 0);
        if (response.isError) assert.equal(response.structuredContent, undefined);
      }
    }
  });
}
