// Public retention wording and verified access to activity from the same domain.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('finding 4: privacy and FAQ state the 90 day exception instead of "never stored"', () => {
  const privacy = read('privacy.html'), faq = read('faq.html');
  for (const page of [privacy, faq]) assert.doesNotMatch(page, /never stored or logged|do not store or log any of your inputs/);
  assert.ok(privacy.includes('Tool inputs and answers are not stored on our servers, apart from the GTM challenge the audit form keeps for 90 days (section 2.7)'));
  const line = 'The free EPIC audit form keeps only your GTM challenge, for 90 days; GTM Alpha in Claude stores no inputs or results';
  assert.equal(faq.split(line).length - 1, 2, 'FAQ JSON-LD and visible answer');
  assert.match(faq, /"dateModified": "2026-11-14"/);
  assert.match(faq, /Last updated <time datetime="2026-11-14">14 November 2026<\/time>/);
});

test('the form and privacy notices reserve earlier audit activity for a verified colleague', () => {
  const js = read('assets/js/consultation.js');
  const publicCheck = js.slice(js.indexOf('function ask()'));
  assert.match(publicCheck, /r\.check\) offerCheck\(website\)/);
  assert.doesNotMatch(publicCheck, /days_ago|showChallenge|seen\.hidden = false/);
  assert.match(js, /step: 'code'[\s\S]*?typeof v\.challenge === 'string'[\s\S]*?ago\(v\.days_ago\)[\s\S]*?showChallenge\(v\.challenge, v\.verified\)/);
  assert.ok(read('consultation.html').includes('Only verified colleagues can see whether an earlier audit exists and how many days ago it ran.'));
  const rule = 'Only someone who verifies a work email at the same domain can see whether an earlier audit exists, how many days ago it ran and the earlier GTM challenge.';
  for (const f of ['privacy.html', 'PRIVACY.md']) {
    assert.ok(read(f).includes(rule), f);
    assert.doesNotMatch(read(f), /Anyone who enters the same company website sees|A later visitor from the same company sees only/, f);
  }
});
