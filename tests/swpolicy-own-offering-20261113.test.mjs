import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySoftwareQuestion, SOFTWARE_REFERRAL, SOFTWARE_OUTSIDE_SCOPE} from '../netlify/lib/software-policy.js';
const {default: handler} = await import('../netlify/functions/mcp-sse.js');

// 13 Nov 2026: a GTM question about a product that is software or analytics is
// answered; a request to pick software for the user to buy is still referred
// (GTM stack) or declined (other technology). Exact, same-meaning, negated and
// opposite sentences, across the nine verticals.
const verticals = ['logistics tech','fintech','vertical SaaS','AI native','ITeS','telecom','cybersecurity','software','SaaS'];

test('own offering described as software or analytics is a GTM question, in every vertical', () => {
  for (const v of verticals) for (const q of [
    `Choose between partner-led and outbound for a ${v} analytics product.`,
    `Which route should we take for our ${v} analytics software: partners or outbound sales?`,
    `We are not asking which software to buy; choose partner-led or outbound for our ${v} analytics product.`,
    `Compare PLG and sales-led for our ${v} developer tools startup.`,
  ]) assert.equal(classifySoftwareQuestion({gtm_challenge: q}), 'none', q);
});

test('choosing software for the user to buy is still referred or declined, in every vertical', () => {
  for (const v of verticals) {
    for (const q of [
      `Choose between two CRM platforms for our ${v} analytics product.`,
      `Which CRM should we buy for our ${v} analytics product?`,
      `HubSpot or Salesforce for our ${v} startup?`,
      `For our ${v} product, recommend a sales engagement tool.`,
    ]) assert.equal(classifySoftwareQuestion({gtm_challenge: q}), 'gtm', q);
    for (const q of [
      `Which data warehouse should we buy for our ${v} analytics product?`,
      `Should we choose Snowflake or BigQuery for our ${v} analytics platform?`,
      `Choose between Datadog and New Relic for our ${v} SaaS platform.`,
    ]) assert.equal(classifySoftwareQuestion({gtm_challenge: q}), 'outside', q);
  }
});

test('GTM questions about software, analytics and AI products are answered', () => {
  for (const q of [
    'Which channel should we lead with for our AI analytics product sold to banks?',
    'Choose a pricing model for our cybersecurity software sold to mid-size banks.',
    'Which segment should we target first with our analytics platform: retail banks or insurers?',
    'What is the best go-to-market for analytics software sold to telcos?',
    'Pick inbound or outbound for our AI app that helps ITeS firms run service desks.',
    'Which is better for a cloud security platform: channel partners or direct sales?',
  ]) assert.equal(classifySoftwareQuestion({challenge: q}), 'none', q);
});

test('a buying word before "for" keeps the purchase in the sentence', () => {
  for (const q of ['We need recommendations for analytics software.', 'Which vendor for our analytics product?', 'Recommend a tool for our analytics product.', 'Which analytics tool is best for our SaaS product?'])
    assert.equal(classifySoftwareQuestion({challenge: q}), 'outside', q);
  assert.equal(classifySoftwareQuestion({challenge: 'What is the best marketing automation platform for a B2B SaaS company?'}), 'gtm');
  assert.equal(classifySoftwareQuestion({challenge: 'Should we use Segment or mParticle?'}), 'outside');
});

const call = async (name, args) => {
  const r = await handler(new Request('https://local.invalid/mcp', {method:'POST', headers:{'content-type':'application/json', accept:'application/json, text/event-stream'}, body:JSON.stringify({jsonrpc:'2.0', id:1, method:'tools/call', params:{name, arguments:args}})}));
  const j = await r.json();
  return (j.result?.content || []).map(c => c.text).join('\n');
};

test('the reported prompt gets a plan from all three tools; a CRM purchase is still referred', async () => {
  const q = 'Choose between partner-led and outbound for a telecom analytics product.';
  for (const [name, args] of [['gtm_consultation', {gtm_challenge: q}], ['epic_audit', {challenge: q}], ['generate_roadmap', {primary_focus: 'I', timeframe: '90-day', context: q}]]) {
    const text = await call(name, args);
    assert.ok(!text.includes(SOFTWARE_OUTSIDE_SCOPE) && !text.includes(SOFTWARE_REFERRAL), name + ': ' + text.slice(0, 120));
  }
  assert.equal(await call('gtm_consultation', {gtm_challenge: 'Which CRM should we buy for our telecom analytics product?'}), SOFTWARE_REFERRAL);
  assert.equal(await call('epic_audit', {challenge: 'Which data warehouse should we buy for our telecom analytics product?'}), SOFTWARE_OUTSIDE_SCOPE);
});
