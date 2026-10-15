// Run 33D round 4 for GTM Alpha /mcp (from the round 3 auditor), in-process (no network): the auditor's exact inputs.
// Run: node --test tests/run33-gtm-alpha-round4.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp-sse.js", import.meta.url));
let nextId = 1;
async function rpc(method, params) {
  const r = await handler(new Request("https://gtmalpha.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  }), {});
  return r.json();
}
const textOf = (j) => (j.result && j.result.content ? j.result.content.map((c) => c.text).join("\n") : JSON.stringify(j.error || j));
const LIVE_INLINE = /(?<!\\)\]\s*\(\s*https?:\/\/evil/;

test("gtm_consultation: a ] in a code span does not hide the open [ of a split image", async () => {
  const t = textOf(await rpc("tools/call", { name: "gtm_consultation", arguments: { company_name: "x ![a", gtm_challenge: "`]` b\nc](https://evil.example/c.png) B2B SaaS outbound" } }));
  const j = JSON.parse(t);
  assert.doesNotMatch(j.consultation_output, LIVE_INLINE, `live: ${JSON.stringify(j.consultation_output.slice(0, 300))}`);
});

test("gtm_consultation: a shortcut reference image split over a line break is inert", async () => {
  const t = textOf(await rpc("tools/call", { name: "gtm_consultation", arguments: { company_name: "x ![a", gtm_challenge: "b]\n\n[a Challenge: b]: https://evil.example/c.png" } }));
  const j = JSON.parse(t);
  assert.ok(/Challenge: b\\\]/.test(j.consultation_output), `closing bracket live: ${JSON.stringify(j.consultation_output.slice(0, 300))}`);
});

test("length refusal: three line field names and a destination on the next line are inert", async () => {
  for (const [ka, kb] of [["x ![a", "b\n`]`\nc](https://evil.example/c.png)"], ["x ![a](\nhttps://evil.example/c.png \"t", "u\")"]]) {
    const t = textOf(await rpc("tools/call", { name: "generate_roadmap", arguments: { primary_focus: "P", [ka]: "a".repeat(4001), [kb]: "a".repeat(4001) } }));
    assert.match(t, /longer than/);
    assert.doesNotMatch(t, LIVE_INLINE, `refusal live: ${JSON.stringify(t.slice(0, 300))}`);
  }
});
