// Run 15 R15-13 (C-GA-01): the 32 KB body limit of the REST API (netlify/lib/epic-audit.js) and of the free audit form
// (netlify/lib/premium-audit.js) counts UTF-8 bytes, as netlify/functions/mcp-sse.js does for its 64 KB limit. The limit
// stays 32,000 bytes and the messages keep saying 32 KB. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import api from "../netlify/functions/api.js";

const BASE = "https://gtmalpha.gtmhelix.com";
const LIMIT = 32000;
const FORM = {
  client_name: "Test Person", client_designation: "Founder", company_name: "TEST Company", industry: "SaaS",
  company_description: "TEST data: a B2B tool for finance teams.", gtm_challenge: "TEST data: long sales cycles.",
  business_stage: "Growth", team_size: "20", monthly_budget: "5000", confirm_consultation: "on", leave_this_empty: ""
};
const HINDI = "क"; // one Hindi letter: 3 bytes in UTF-8, 1 character

// Pads `pad` so the whole body is exactly `bytes` UTF-8 bytes: as many of `unit` as fit, then plain "x" for the rest.
function bodyOfBytes(bytes, unit, make) {
  const overhead = Buffer.byteLength(make(""), "utf8");
  const room = bytes - overhead;
  const size = Buffer.byteLength(unit, "utf8");
  const n = Math.floor(room / size);
  const body = make(unit.repeat(n) + "x".repeat(room - n * size));
  assert.equal(Buffer.byteLength(body, "utf8"), bytes, "the test body has exactly the wanted byte size");
  return body;
}
const post = (path, body, type) => api(new Request(BASE + path, { method: "POST", headers: { "content-type": type }, body }), {});

const epicJson = (pad) => JSON.stringify({ company: "TEST Co", pad });
const formJson = (pad) => JSON.stringify({ ...FORM, pad });
const formUrl = (pad) => new URLSearchParams(FORM).toString() + "&pad=" + pad; // pad is raw text here, decoded by the handler

const KINDS = [["ASCII", "x"], ["multi-byte (Hindi)", HINDI]];

for (const [kind, unit] of KINDS) {
  test(`REST API: a ${kind} body of exactly 32,000 bytes is accepted, 32,001 bytes is refused with the 32 KB message`, async () => {
    const ok = await post("/api/epic-audit", bodyOfBytes(LIMIT, unit, epicJson), "application/json");
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).status, "success");
    const big = await post("/api/epic-audit", bodyOfBytes(LIMIT + 1, unit, epicJson), "application/json");
    assert.equal(big.status, 413);
    assert.deepEqual(await big.json(), { error: "Request body too large (limit 32 KB)" });
  });

  test(`free audit form (JSON post): a ${kind} body of exactly 32,000 bytes is accepted, 32,001 bytes is refused`, async () => {
    const ok = await post("/api/premium-audit", bodyOfBytes(LIMIT, unit, formJson), "application/json");
    assert.equal(ok.status, 200);
    assert.ok((await ok.text()).includes("Your free EPIC audit report"));
    const big = await post("/api/premium-audit", bodyOfBytes(LIMIT + 1, unit, formJson), "application/json");
    assert.equal(big.status, 413);
    const html = await big.text();
    assert.ok(html.includes("Your answers are too long") && html.includes("Please shorten them and try again."));
    assert.ok(!html.includes("Your free EPIC audit report"));
  });

  test(`free audit form (form post): a ${kind} body of exactly 32,000 bytes is accepted, 32,001 bytes is refused`, async () => {
    const type = "application/x-www-form-urlencoded";
    const ok = await post("/api/premium-audit", bodyOfBytes(LIMIT, unit, formUrl), type);
    assert.equal(ok.status, 200);
    const big = await post("/api/premium-audit", bodyOfBytes(LIMIT + 1, unit, formUrl), type);
    assert.equal(big.status, 413);
    assert.ok((await big.text()).includes("Your answers are too long"));
  });
}

test("a multi-byte body of fewer than 32,000 characters but more than 32,000 bytes is refused (the old count let it through)", async () => {
  const body = epicJson(HINDI.repeat(20000)); // 20,000 characters, 60,000 bytes
  assert.ok(body.length < LIMIT && Buffer.byteLength(body, "utf8") > LIMIT);
  assert.equal((await post("/api/epic-audit", body, "application/json")).status, 413);
  assert.equal((await post("/api/premium-audit", formJson(HINDI.repeat(20000)), "application/json")).status, 413);
});

test("malformed bodies fail safely with today's errors: no crash, no stack trace", async () => {
  const noStack = (t) => assert.ok(!/\n\s+at .*(\.js|\.mjs|node:)|SyntaxError|node_modules|file:\/\//.test(t), "no stack trace or error class in the answer");
  // invalid JSON
  const a = await post("/api/epic-audit", "{", "application/json");
  assert.equal(a.status, 400);
  const at = await a.text();
  assert.deepEqual(JSON.parse(at), { error: "The body is not valid JSON" });
  noStack(at);
  // bytes that are not valid UTF-8
  const bad = new Uint8Array([0x7b, 0xff, 0xfe, 0xc3, 0x28, 0x7d]);
  const b = await post("/api/epic-audit", bad, "application/json");
  assert.equal(b.status, 400);
  assert.deepEqual(await b.json(), { error: "The body is not valid JSON" });
  // the form: invalid JSON, and bytes that are not valid UTF-8, in both content types
  const c = await post("/api/premium-audit", "{", "application/json");
  assert.equal(c.status, 400);
  const ct = await c.text();
  assert.ok(ct.includes("The request could not be processed"));
  noStack(ct);
  const d = await post("/api/premium-audit", bad, "application/json");
  assert.equal(d.status, 400);
  assert.ok((await d.text()).includes("The request could not be processed"));
  const e = await post("/api/premium-audit", bad, "application/x-www-form-urlencoded");
  assert.equal(e.status, 400);
  assert.ok((await e.text()).includes("Please check your answers"));
  // an empty body
  assert.equal((await post("/api/epic-audit", "", "application/json")).status, 400);
  assert.equal((await post("/api/premium-audit", "", "application/x-www-form-urlencoded")).status, 400);
});
