import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySoftwareQuestion, SOFTWARE_REFERRAL, SOFTWARE_OUTSIDE_SCOPE} from '../netlify/lib/software-policy.js';
const {default: handler} = await import('../netlify/functions/mcp-sse.js');

// Owner decision 13 Nov 2026: a plain "best analytics tool for us?" and
// marketing, sales, demand generation or customer success analytics tool
// questions go to the 45 minute booking. Data warehouse, SIEM, BI and other
// non-GTM tech keep the plain decline. GTM questions about the user's own
// analytics product are still answered. Exact, same-meaning and opposite
// sentences, across the nine verticals.
const verticals = ['logistics tech','fintech','vertical SaaS','AI native','ITeS','telecom','cybersecurity','software','SaaS'];

test('exact: a plain "best analytics tool for us?" goes to the booking', () => {
  assert.equal(classifySoftwareQuestion({gtm_challenge: 'What is the best analytics tool for us?'}), 'gtm');
  for (const v of verticals) {
    const q = `What is the best analytics tool for us? We are a ${v} company.`;
    assert.equal(classifySoftwareQuestion({gtm_challenge: q}), 'gtm', q);
  }
});

test('same meaning: plain, marketing, sales, demand generation and customer success analytics go to the booking, in every vertical', () => {
  for (const v of verticals) for (const q of [
    `Which analytics platform would you recommend for our ${v} business?`,
    `Should we buy an analytics tool for our ${v} startup?`,
    `Which demand generation analytics tool should our ${v} marketing team buy?`,
    `Recommend a customer success analytics platform for our ${v} CS team.`,
    `What is the best sales analytics software for a ${v} sales team?`,
    `Which marketing analytics tool fits our ${v} startup?`,
    `Which analytics tool should our ${v} team use for demand generation?`,
  ]) assert.equal(classifySoftwareQuestion({challenge: q}), 'gtm', q);
});

test('opposite: data warehouse, SIEM, BI and other non-GTM analytics keep the plain decline, in every vertical', () => {
  for (const v of verticals) for (const q of [
    `What is the best data warehouse for our ${v} company?`,
    `Which SIEM or security analytics tool should our ${v} SOC team buy?`,
    `Which BI tool should our ${v} finance team use?`,
    `What is the best product analytics tool for our ${v} startup?`,
    `What is the best analytics tool for our ${v} SOC team?`,
    `Which data warehouse should our ${v} team use for marketing analytics?`,
  ]) assert.equal(classifySoftwareQuestion({challenge: q}), 'outside', q);
});

test('own offering: GTM questions about the user\'s own analytics product are still answered, in every vertical', () => {
  for (const v of verticals) for (const q of [
    `Choose between partner-led and outbound for a ${v} analytics product.`,
    `Which channel should we lead with for our ${v} customer success analytics platform?`,
    `Choose between partner-led and outbound for our ${v} marketing analytics software.`,
  ]) assert.equal(classifySoftwareQuestion({gtm_challenge: q}), 'none', q);
  // A tool for the user's own analytics product names no category: decline.
  assert.equal(classifySoftwareQuestion({challenge: 'Recommend a tool for our analytics product.'}), 'outside');
});

const call = async (name, args) => {
  const r = await handler(new Request('https://local.invalid/mcp', {method:'POST', headers:{'content-type':'application/json', accept:'application/json, text/event-stream'}, body:JSON.stringify({jsonrpc:'2.0', id:1, method:'tools/call', params:{name, arguments:args}})}));
  const j = await r.json();
  return (j.result?.content || []).map(c => c.text).join('\n');
};
const argsFor = (q) => [['gtm_consultation', {gtm_challenge: q}], ['epic_audit', {challenge: q}], ['generate_roadmap', {primary_focus: 'I', timeframe: '90-day', context: q}]];

test('all three tools: plain analytics goes to the booking, a data warehouse is declined, the own product is answered', async () => {
  for (const [name, args] of argsFor('What is the best analytics tool for us?')) assert.equal(await call(name, args), SOFTWARE_REFERRAL, name);
  for (const [name, args] of argsFor('Which customer success analytics tool should we buy?')) assert.equal(await call(name, args), SOFTWARE_REFERRAL, name);
  for (const [name, args] of argsFor('What is the best data warehouse for our telecom company?')) assert.equal(await call(name, args), SOFTWARE_OUTSIDE_SCOPE, name);
  for (const [name, args] of argsFor('Choose between partner-led and outbound for a telecom analytics product.')) {
    const text = await call(name, args);
    assert.ok(!text.includes(SOFTWARE_OUTSIDE_SCOPE) && !text.includes(SOFTWARE_REFERRAL), name + ': ' + text.slice(0, 120));
  }
});
