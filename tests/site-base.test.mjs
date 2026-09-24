// PayPal return and cancel addresses: the buyer goes back to the address they paid from, only on this site's own hosts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { siteBase } from '../netlify/functions/create-payment.js';

const req = (url) => new Request(url, { method: 'POST' });

test('old and new site addresses are kept', () => {
  assert.equal(siteBase(req('https://gtmalpha.netlify.app/api/create-payment')), 'https://gtmalpha.netlify.app');
  assert.equal(siteBase(req('https://gtmalpha.gtmhelix.com/api/create-payment')), 'https://gtmalpha.gtmhelix.com');
});

test('any other host falls back to the site URL', () => {
  const expected = process.env.URL || 'https://gtmalpha.netlify.app';
  assert.equal(siteBase(req('https://evil.example.com/api/create-payment')), expected);
  assert.equal(siteBase(req('https://abc123--gtmalpha.netlify.app/api/create-payment')), expected);
  assert.equal(siteBase({ url: 'not a url' }), expected);
});
