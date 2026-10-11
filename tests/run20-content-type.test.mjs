// Run 20 round 1 (ledger item): /mcp refuses a request whose Content-Type is missing or is not application/json, as the
// other five connectors do (their SDK transport answers 415, code -32000, "Unsupported Media Type: Content-Type must be
// application/json"). Written before the fix. A normal JSON POST, GET and OPTIONS behave as before.
// Run: node --test tests/run20-content-type.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
const MSG = "Unsupported Media Type: Content-Type must be application/json";
const list = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" });
const call = JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "generate_roadmap", arguments: { primary_focus: "I" } } });
const post = (body, headers, path = "/mcp") => mcp(new Request("https://gtmalpha.gtmhelix.com" + path, { method: "POST", headers, body }), {});
// A Uint8Array body makes fetch add no Content-Type of its own (a string body would add text/plain).
const bytes = (s) => new TextEncoder().encode(s);

const refused = async (res, why) => {
  assert.equal(res.status, 415, why);
  const j = await res.json();
  assert.deepEqual(j, { jsonrpc: "2.0", id: null, error: { code: -32000, message: MSG } }, why);
  assert.match(res.headers.get("content-type"), /^application\/json/);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
};

test("a POST with no Content-Type is refused with 415", async () => {
  await refused(await post(bytes(list), {}), "no content type");
});

test("a POST with a wrong Content-Type is refused with 415", async () => {
  for (const type of ["text/plain", "text/plain;charset=UTF-8", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", "application/xml", "application/jsonx", "application/json-patch+json", "text/plain; a=application/json", "application/json, text/plain", ""]) {
    await refused(await post(list, { "content-type": type }), "type " + JSON.stringify(type));
  }
});

test("a tools/call and a notification with a wrong Content-Type are refused too, and run nothing", async () => {
  await refused(await post(call, { "content-type": "text/plain" }), "tools/call");
  await refused(await post(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }), { "content-type": "text/plain" }), "notification");
});

test("the older address /mcp-sse refuses it the same way", async () => {
  await refused(await post(list, { "content-type": "text/plain" }, "/mcp-sse"), "mcp-sse");
});

test("a normal JSON POST still works, with parameters or other letter case", async () => {
  for (const type of ["application/json", "application/json; charset=utf-8", "application/json;charset=UTF-8", "APPLICATION/JSON", "Application/Json ; charset=utf-8", "application/json;"]) {
    const res = await post(list, { "content-type": type });
    assert.equal(res.status, 200, type);
    const j = await res.json();
    assert.equal(j.result.tools.length, 3, type);
  }
  const res = await post(call, { "content-type": "application/json", accept: "application/json, text/event-stream" });
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(!!j.result.isError, false);
  assert.match(j.result.content[0].text, /Inbound and Outbound/);
});

test("an Accept header of any kind does not matter (not part of this change)", async () => {
  for (const accept of [undefined, "*/*", "application/json"]) {
    const res = await post(list, accept ? { "content-type": "application/json", accept } : { "content-type": "application/json" });
    assert.equal(res.status, 200, String(accept));
  }
});

test("GET and OPTIONS behave as before, with or without a Content-Type", async () => {
  const get = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "GET" }), {});
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST, OPTIONS");
  assert.equal((await get.json()).error.code, -32000);
  const getTyped = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "GET", headers: { "content-type": "text/plain" } }), {});
  assert.equal(getTyped.status, 405);
  for (const headers of [{}, { "content-type": "text/plain" }]) {
    const opt = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "OPTIONS", headers }), {});
    assert.equal(opt.status, 204);
    assert.equal(opt.headers.get("access-control-allow-methods"), "POST, OPTIONS");
    assert.match(opt.headers.get("access-control-allow-headers"), /Content-Type/);
  }
});

test("the size and JSON checks still answer as before for a JSON content type", async () => {
  const bad = await post("{not json", { "content-type": "application/json" });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, -32700);
  const big = await post("{" + " ".repeat(70000) + "}", { "content-type": "application/json" });
  assert.equal(big.status, 413);
});

test("tools/list is the same list of three tools, byte for byte, whatever the Content-Type spelling", async () => {
  const shas = [];
  for (const type of ["application/json", "application/json; charset=utf-8", "APPLICATION/JSON"]) {
    const j = await (await post(list, { "content-type": type })).json();
    assert.deepEqual(j.result.tools.map((t) => t.name), ["gtm_consultation", "epic_audit", "generate_roadmap"]);
    shas.push(createHash("sha256").update(JSON.stringify(j.result.tools)).digest("hex"));
  }
  assert.equal(new Set(shas).size, 1);
});
