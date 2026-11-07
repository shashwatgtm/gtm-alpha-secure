import test from 'node:test';
import assert from 'node:assert/strict';
import { asksForSoftware } from '../netlify/lib/software-policy.js';
import { detectVertical } from '../netlify/lib/legacy-sector-notes.js';
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

test('RC-02: a question about which GTM motion or pain stays a GTM question even when it mentions a CRM', () => {
  assert.equal(asksForSoftware({ gtm_challenge: 'Our CRM data is messy, so how do we decide which GTM motion to run first?' }), false);
  assert.equal(asksForSoftware({ gtm_challenge: 'Which operational pain do our CRM users feel most?' }), false);
  // A plain software buying question is still routed.
  assert.equal(asksForSoftware({ gtm_challenge: 'Which CRM and marketing automation tool should we buy, HubSpot or Salesforce?' }), true);
  assert.equal(asksForSoftware({ gtm_challenge: 'Which account-based marketing platform should we buy?' }), true);
});

test('RC-04: an industry typed with underscores reads the same as with spaces; a generic industry word does not override a clear sector', () => {
  assert.equal(detectVertical('logistics_tech', 'Expand enterprise fleet pipeline across North America')?.id, 'logistics-tech');
  assert.equal(detectVertical('Software', 'EDR and SOC threat detection for CISOs; security operations')?.id, 'cybersecurity');
});

test('RC-04: gtm_consultation uses investment notes only when business_model is investment', async () => {
  const chosen = await call('gtm_consultation', {
    gtm_challenge: 'AI agents and LLM copilots for institutional allocators; machine learning models',
    industry: 'AI native',
    business_model: 'investment',
  });
  assert.match(chosen.content[0].text, /AI native, investment management/);

  const notChosen = await call('gtm_consultation', {
    gtm_challenge: 'We sell route optimisation software to 3PL fleets; our product portfolio is broad and we raised funds last year',
    industry: 'Logistics tech',
  });
  assert.doesNotMatch(notChosen.content[0].text, /investment management/);
});
