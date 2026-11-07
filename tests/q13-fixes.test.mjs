import test from 'node:test';
import assert from 'node:assert/strict';
import { softwareQuestions, SOFTWARE_REFERRAL } from '../netlify/lib/software-policy.js';
import { detectVertical, detectModel } from '../netlify/lib/legacy-sector-notes.js';
import { profileFor } from '../netlify/lib/verticals.js';
import { scoreEpic } from '../netlify/lib/epic-advanced.js';
import handler from '../netlify/functions/mcp-sse.js';

const call = async (name, args) => {
  const res = await handler(new Request('https://gtmalpha.gtmhelix.com/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  }), {});
  const json = await res.json();
  assert.ok(json.result && !json.result.isError, JSON.stringify(json));
  return json.result;
};

test('RC-01 and RC-02: softwareQuestions routes pure software stack asks and stays silent on CRM/tool mentions in normal GTM context', () => {
  assert.ok(softwareQuestions({ gtm_challenge: 'Which CRM and marketing automation tool should we buy, HubSpot or Salesforce?' }).includes(SOFTWARE_REFERRAL));
  assert.equal(softwareQuestions({ gtm_challenge: 'Pipeline stalled; Salesforce CRM shows 120-day cycles; HubSpot inbound leads do not convert.' }), '');
});

test('RC-05: detectVertical and profileFor resolve logistics_tech and ai_native investment management on gtm_consultation and epic_audit', async () => {
  assert.equal(detectVertical('logistics_tech')?.id, 'logistics-tech');
  const m = detectModel('investment', 'ai_native', 'Systematic equity strategies for institutional asset allocators');
  assert.equal(m.model, 'investment');
  assert.equal(profileFor(detectVertical('ai_native'), m.model)?.name, 'AI native, investment management');

  const consult = await call('gtm_consultation', {
    company_name: 'RoutePulse',
    gtm_challenge: 'Expand enterprise fleet pipeline across North America',
    industry: 'logistics_tech',
    business_stage: 'series-a',
  });
  assert.equal(consult.structuredContent.sector_notes.sector, 'logistics tech');

  const audit = await call('epic_audit', {
    company_name: 'AlphaQuant',
    challenge: 'Win institutional allocator mandates for AI systematic strategies with $500M AUM',
    industry: 'ai_native',
  });
  assert.equal(audit.structuredContent.sector_notes.sector, 'AI native, investment management');
});

test('RC-05 and RC-22: generate_roadmap replaces PLG/user-onboarding wording for connectivity and scoreEpic respects negated PLG in tie-breaking', async () => {
  const roadmap = await call('generate_roadmap', {
    primary_focus: 'P',
    timeframe: '90-day',
    business_model: 'connectivity',
  });
  const text = roadmap.content[0].text;
  assert.ok(!text.includes('PLG motions'));
  assert.ok(text.includes('site and customer onboarding flow'));

  const epic = scoreEpic({
    business_stage: 'series-a',
    gtm_challenge: 'We do not run PLG or self-serve trials; enterprise sales only.',
  });
  assert.notEqual(epic.primary.letter, 'P');
});
