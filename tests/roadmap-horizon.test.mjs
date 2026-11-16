import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../netlify/functions/mcp-sse.js';

async function roadmap(args) {
  const response = await handler(new Request('https://local.invalid/mcp', {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: {name: 'generate_roadmap', arguments: args}})
  }));
  return (await response.json()).result;
}

test('a supplied unsupported horizon cannot produce the default schedule', async () => {
  for (const horizon of [{timeframe: '120-day'}, {horizon_days: 120}, {timeframe: -30}, {timeframe: ['60-day']}]) {
    const result = await roadmap({primary_focus: 'I', ...horizon});
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /30-day.*60-day.*90-day/);
    assert.doesNotMatch(result.content[0].text, /not supplied|## Schedule/);
    assert.equal(result.structuredContent, undefined);
  }
});

const cases = [
  ['B2B SaaS', 'P', 'saas', 30], ['fintech', 'E', 'transactions', 60],
  ['HR tech', 'I', 'saas', 90], ['sales tech', 'P', 'saas', 60],
  ['ops tech', 'E', 'hardware_software', 30], ['ITeS', 'I', 'services', 60],
  ['AI-native', 'C', 'saas', 30], ['cybersecurity', 'E', 'saas', 90],
  ['martech', 'I', 'saas', 30]
];
for (const [vertical, focus, model, days] of cases) {
  test(vertical + ' uses the supplied horizon on both calls', async () => {
    const args = {primary_focus: focus, business_model: model, timeframe: days + ' days'};
    const first = await roadmap(args);
    assert.deepEqual(await roadmap(args), first);
    assert.ok(!first.isError);
    assert.equal(first.structuredContent.timeframe, days + '-day');
    assert.equal(first.structuredContent.schedule.medium_term, 'Days ' + (2 * days / 3 + 1) + ' to ' + days);
    assert.doesNotMatch(first.content[0].text, /90 day default|default, not supplied/);
  });
}
test('supported day count, conflicting horizons and omitted timeframe', async () => {
  const result = await roadmap({primary_focus: 'I', horizon_days: 60});
  assert.equal(result.structuredContent.timeframe, '60-day');
  assert.equal((await roadmap({primary_focus: 'I', timeframe: '30-day', horizon_days: 60})).isError, true);
  assert.match((await roadmap({primary_focus: 'I'})).structuredContent.timeframe, /90-day \(default, not supplied/);
});
