// Red team round 1, 14 Nov 2026, findings 4 and 5 (wording only; the owner decision stands: the notice is shown to everyone).
// 4. /privacy and /faq no longer say inputs are never stored, which contradicted the 90 day GTM challenge.
// 5. The colleague notice and the text around it say plainly that anyone who enters the same company website sees that an audit
//    was run and when, never the text.
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

test('finding 5: the notice does not claim the visitor is a colleague, and the text says who sees what', () => {
  const js = read('assets/js/consultation.js');
  assert.match(js, /'Someone using this company\\'s website ran this audit ' \+ ago\(r\.days_ago\) \+ '\.'/);
  assert.doesNotMatch(js, /'Someone from your organisation/);
  assert.ok(read('consultation.html').includes('Anyone who later enters the same company website will see that an audit was run from it and how many days ago, never the text.'));
  const rule = 'Anyone who enters the same company website sees only that an audit was run and how many days ago; the GTM challenge itself is shown only after a work email check at that company.';
  for (const f of ['privacy.html', 'PRIVACY.md']) {
    assert.ok(read(f).includes(rule), f);
    assert.doesNotMatch(read(f), /A later visitor from the same company sees only/, f);
  }
});
