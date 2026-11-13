// 13 Nov 2026 (owner decision): audits from the free EPIC audit form are kept for 90 days, then deleted; a later visitor
// from the same company domain sees only that an audit was run; the earlier GTM challenge only after a work email check.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  KEEP_DAYS, cutoffDay, domainOf, emailMatches, isFreeMail, findRecent, recordAudit, pruneAudits,
  colleagueCheckOn, startCheck, finishCheck, emailHash,
} from '../netlify/lib/audit-memory.js';
import { auditSeen, colleagueCheck } from '../netlify/lib/audit-seen.js';
import premiumAudit, { keepAudit } from '../netlify/lib/premium-audit.js';

const NOW = new Date('2026-11-13T10:00:00Z');
const SECRET = 'a'.repeat(40);
const ON = { AUDIT_COLLEAGUE_CHECK: 'on', AUDIT_CHECK_SECRET: SECRET };
const OFF = {};

function fakeStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    list: async (o = {}) => ({ blobs: [...data.keys()].filter((k) => !o.prefix || k.startsWith(o.prefix)).map((key) => ({ key, etag: 'e' })), directories: [] }),
    get: async (key) => (data.has(key) ? JSON.parse(data.get(key)) : null),
    setJSON: async (key, v) => { data.set(key, JSON.stringify(v)); },
    delete: async (key) => { data.delete(key); },
  };
}
const post = (path, body) => new Request('https://gtmalpha.gtmhelix.com' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const CHALLENGE = 'We sell to hospital groups and our outbound has stalled.';

test('audits: the 90 day cutoff keeps the 90th day and drops older records', async () => {
  assert.equal(KEEP_DAYS, 90);
  assert.equal(cutoffDay(NOW), '2026-08-15');
  const store = fakeStore({
    'acme.com/2026-08-14/a': JSON.stringify({ day: '2026-08-14', challenge: 'old' }),
    'acme.com/2026-08-15/b': JSON.stringify({ day: '2026-08-15', challenge: 'kept' }),
    'beta.io/2026-01-01/c': JSON.stringify({ day: '2026-01-01', challenge: 'old' }),
    'beta.io/2026-11-01/d': JSON.stringify({ day: '2026-11-01', challenge: 'new' }),
  });
  assert.deepEqual(await findRecent(store, 'acme.com', NOW), { key: 'acme.com/2026-08-15/b', day: '2026-08-15', days_ago: 90 });
  assert.equal(await findRecent(fakeStore({ 'acme.com/2026-08-14/a': '{}' }), 'acme.com', NOW), null);
  assert.deepEqual(await pruneAudits(store, NOW), { cutoff: '2026-08-15', deleted: 2 });
  assert.deepEqual([...store.data.keys()].sort(), ['acme.com/2026-08-15/b', 'beta.io/2026-11-01/d']);
});

test('audits: the record holds the day and the challenge only (no time, no name, no email)', async () => {
  const store = fakeStore();
  const key = await recordAudit(store, { domain: 'acme.com', challenge: CHALLENGE }, NOW);
  assert.match(key, /^acme\.com\/2026-11-13\/[0-9a-f-]{36}$/);
  assert.deepEqual(JSON.parse(store.data.get(key)), { day: '2026-11-13', challenge: CHALLENGE });
});

test('audits: the prune runs daily as a scheduled function', async () => {
  const { config } = await import('../netlify/functions/audit-prune.js');
  assert.equal(config.schedule, '@daily');
  const api = await import('../netlify/functions/api.js');
  for (const p of ['/api/audit-seen', '/api/colleague-check']) assert.ok(api.config.path.includes(p), p);
});

test('domain match: the company domain is the website host without www; the email domain must equal it', () => {
  assert.equal(domainOf('https://www.Acme.com/about?x=1'), 'acme.com');
  assert.equal(domainOf('http://acme.co.uk'), 'acme.co.uk');
  assert.equal(domainOf('https://app.acme.com'), 'app.acme.com');
  for (const bad of ['', 'acme.com', 'ftp://acme.com', 'https://192.168.1.1', 'https://localhost', 'https://linkedin.com/company/acme', 'https://example.com']) {
    assert.equal(domainOf(bad), null, bad);
  }
  assert.equal(emailMatches('Priya@ACME.com', 'acme.com'), true);
  assert.equal(emailMatches('priya@sales.acme.com', 'acme.com'), false);
  assert.equal(emailMatches('priya@acme.co', 'acme.com'), false);
  assert.equal(emailMatches('not an email', 'acme.com'), false);
});

test('free mail never counts: not as a company domain, not as a work email, never kept', async () => {
  for (const d of ['gmail.com', 'googlemail.com', 'yahoo.co.in', 'yahoo.com', 'outlook.com', 'hotmail.co.uk', 'live.com', 'icloud.com', 'proton.me', 'protonmail.com', 'zohomail.in', 'rediffmail.com', 'aol.com', 'gmx.de', 'yandex.ru', 'mail.ru']) {
    assert.equal(isFreeMail(d), true, d);
    assert.equal(domainOf('https://' + d), null, d);
    assert.equal(emailMatches('someone@' + d, d), false, d);
  }
  assert.equal(isFreeMail('acme.com'), false);
  assert.equal(isFreeMail('mailchimp.com'), false);
  const store = fakeStore();
  assert.equal(await keepAudit({ company_name: 'Acme', company_website: 'https://gmail.com', gtm_challenge: CHALLENGE }, '', { store, env: OFF, now: NOW }), null);
  assert.equal(await keepAudit({ company_name: 'CloudSEK (example company)', company_website: 'https://cloudsek.com', gtm_challenge: CHALLENGE }, '', { store, env: OFF, now: NOW }), null);
  assert.equal(await keepAudit({ company_name: 'Acme', gtm_challenge: CHALLENGE }, '', { store, env: OFF, now: NOW }), null);
  assert.equal(store.data.size, 0);
});

test('unverified view: everyone sees that an audit was run and how long ago, never the earlier text', async () => {
  const store = fakeStore({ 'acme.com/2026-11-01/x': JSON.stringify({ day: '2026-11-01', challenge: CHALLENGE }) });
  for (const env of [OFF, ON]) {
    const res = await auditSeen(post('/api/audit-seen', { website: 'https://www.acme.com' }), { store, env, send: async () => {}, now: NOW });
    const text = await res.text();
    assert.equal(res.status, 200);
    assert.doesNotMatch(text, /hospital|outbound|challenge/i);
    assert.deepEqual(JSON.parse(text), { seen: true, days_ago: 12, check: env === ON });
  }
  const none = await auditSeen(post('/api/audit-seen', { website: 'https://other.com' }), { store, env: OFF, now: NOW });
  assert.deepEqual(await none.json(), { seen: false });
  const free = await auditSeen(post('/api/audit-seen', { website: 'https://gmail.com' }), { store: fakeStore({ 'gmail.com/2026-11-01/x': '{}' }), env: OFF, now: NOW });
  assert.deepEqual(await free.json(), { seen: false });
  // With the check off (no email sender), the colleague check answers 404 and shows nothing.
  assert.equal(colleagueCheckOn(OFF), false);
  assert.equal(colleagueCheckOn({ ...ON }), false, 'no email sender is set up, so the check stays off in production');
  const off = await colleagueCheck(post('/api/colleague-check', { step: 'send', website: 'https://acme.com', email: 'a@acme.com' }), { store, env: ON, send: null, now: NOW });
  assert.equal(off.status, 404);
  assert.doesNotMatch(await off.text(), /hospital/);
});

test('verified view (flag on in tests): a work email at the same domain sees the earlier challenge; the email is kept only as a hash', async () => {
  const store = fakeStore({ 'acme.com/2026-11-10/x': JSON.stringify({ day: '2026-11-10', challenge: CHALLENGE }) });
  const sent = [];
  const deps = { store, env: ON, send: async (m) => { sent.push(m); }, now: NOW };
  assert.equal(colleagueCheckOn(ON, deps.send), true);
  // Refused: free mail, another domain, a domain with no earlier audit.
  assert.match((await startCheck(deps, { website: 'https://acme.com', email: 'a@gmail.com' })).error, /work email at acme\.com/);
  assert.match((await startCheck(deps, { website: 'https://acme.com', email: 'a@rival.com' })).error, /work email/);
  assert.match((await startCheck(deps, { website: 'https://new.com', email: 'a@new.com' })).error, /no earlier audit/);
  assert.equal(sent.length, 0);
  // Through the endpoint: send a code, a wrong code fails, the right code shows the challenge.
  const r1 = await colleagueCheck(post('/api/colleague-check', { step: 'send', website: 'https://www.acme.com', email: 'Priya@acme.com' }), deps);
  const { token } = await r1.json();
  assert.equal(r1.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'Priya@acme.com');
  const code = /(\d{6})/.exec(sent[0].text)[1];
  assert.doesNotMatch(Buffer.from(token.split('.')[0], 'base64url').toString(), /priya|@/i, 'the token holds no email address');
  const wrong = await colleagueCheck(post('/api/colleague-check', { step: 'code', token, code: code === '000000' ? '111111' : '000000' }), deps);
  assert.equal(wrong.status, 400);
  assert.doesNotMatch(await wrong.text(), /hospital/);
  const right = await finishCheck(deps, { token, code });
  assert.equal(right.challenge, CHALLENGE);
  assert.equal(right.days_ago, 3);
  // An expired check fails.
  assert.match((await finishCheck({ ...deps, now: new Date(NOW.getTime() + 11 * 60000) }, { token, code })).error, /expired/);
  // The colleague's own audit keeps the email hash, never the address, and the prune deletes it with the audit.
  const key = await keepAudit({ company_name: 'Acme', company_website: 'https://acme.com', gtm_challenge: 'Edited: ' + CHALLENGE }, right.verified, { store, env: ON, now: NOW });
  const rec = JSON.parse(store.data.get(key));
  assert.equal(rec.email_hash, emailHash(SECRET, 'priya@acme.com'));
  assert.doesNotMatch(store.data.get(key), /priya|@/i);
  // A verified token for another domain adds no hash.
  const other = await keepAudit({ company_name: 'B', company_website: 'https://beta.io', gtm_challenge: 'x' }, right.verified, { store, env: ON, now: NOW });
  assert.equal(JSON.parse(store.data.get(other)).email_hash, undefined);
  await pruneAudits(store, new Date(NOW.getTime() + 91 * 86400000));
  assert.equal(store.data.size, 0);
});

test('the audit form keeps the challenge under the company domain, and only that', async () => {
  const store = fakeStore();
  const form = new URLSearchParams({ client_name: 'Test', client_designation: 'CMO', company_name: 'Acme', industry: 'SaaS',
    company_description: 'We sell scheduling software to hospital groups.', gtm_challenge: CHALLENGE, business_stage: 'Growth',
    team_size: '20', monthly_budget: '5000', company_website: 'https://www.acme.com', confirm_consultation: 'on', colleague_token: 'forged.token' });
  const req = new Request('https://gtmalpha.gtmhelix.com/api/premium-audit', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() });
  const res = await premiumAudit(req, {}, { store, env: OFF, now: NOW });
  assert.equal(res.status, 200);
  assert.equal(store.data.size, 1);
  const [key, value] = [...store.data.entries()][0];
  assert.match(key, /^acme\.com\/2026-11-13\//);
  assert.deepEqual(JSON.parse(value), { day: '2026-11-13', challenge: CHALLENGE });
});

test('form notice and privacy page state the 90 day rule', () => {
  const form = readFileSync(new URL('../consultation.html', import.meta.url), 'utf8');
  assert.match(form, /<p class="hx-keep-note" id="challenge-note">If you give a company website, we keep your GTM challenge for 90 days and may show it to verified colleagues from the same company domain \(see <a href="\/privacy#audits">privacy<\/a>\)\. Anyone who later enters the same company website will see that an audit was run from it and how many days ago, never the text\.<\/p>/);
  assert.doesNotMatch(form, /answers are not stored|They are not stored, logged or emailed/);
  const owner = 'Audits are kept for 90 days, then deleted automatically. On request we delete them within 30 days. Anyone who enters the same company website sees only that an audit was run and how many days ago; the GTM challenge itself is shown only after a work email check at that company.';
  for (const file of ['../privacy.html', '../PRIVACY.md']) {
    const page = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.ok(page.includes(owner), file);
    assert.doesNotMatch(page, /Free EPIC audit form answers and reports<\/td><td>Not kept|keep nothing you type\. New audits are not kept/, file);
  }
  const privacy = readFileSync(new URL('../privacy.html', import.meta.url), 'utf8');
  assert.match(privacy, /<h3 id="audits">2\.7 Audits from the same company<\/h3>/);
  assert.match(privacy, /Last updated <time datetime="2026-11-14">14 November 2026<\/time>/);
  assert.match(privacy, /<td>Audits are kept for 90 days, then deleted automatically\. On request we delete them within 30 days<\/td>/);
});
