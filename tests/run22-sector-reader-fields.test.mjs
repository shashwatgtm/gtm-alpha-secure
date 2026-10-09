// Run 22 sector reader job, GTM Alpha: the "Business model" line of gtm_consultation says which words of the product text it read. A model
// the shared reader found from words the line did not know (a freight forwarder, a SIM seller) printed the word "null". Invented companies.
// Run: node --test tests/run22-sector-reader-fields.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
let id = 1;
const call = async (name, args) => {
  const r = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }), {});
  const j = await r.json();
  assert.ok(!j.result.isError, "no error: " + JSON.stringify(j.result).slice(0, 300));
  return JSON.parse(j.result.content.map((c) => c.text).join("\n"));
};
const modelLines = (j) => JSON.stringify(j).match(/Business model: (?:[^"\\]|\\.)*/g) || [];

const CASES = [
  ["a tech enabled freight forwarder", "logistics tech", "the AI freight forwarder: Routewell moves freight by ocean, air, road and rail with customs and consolidation, and runs it on an AI-powered platform for purchase order management and shipment visibility, with an AI layer called Atlas", /services/i],
  ["an IoT connectivity seller", "telecom", "We sell a global IoT SIM that connects devices across many networks on one profile, as a physical SIM, an eSIM or a software SIM, with a connectivity platform and an API, to product teams that run fleets of devices. We want help choosing our go-to-market motion.", /connectivity/i],
  ["a professional services firm", "ITeS", "We are a professional services firm that designs, builds and runs business operations for global clients, with our own teams and some automation tools. We want help choosing our go-to-market motion.", /services/i],
];
for (const [label, industry, text, want] of CASES) {
  test(`the business model line never prints the word null (${label})`, async () => {
    const j = await call("gtm_consultation", { company_name: "Testco", industry, gtm_challenge: text, acv_usd: 50000, deal_cycle_days: 60, nrr_percent: 105, tam_accounts: 5000 });
    const lines = modelLines(j);
    assert.ok(lines.length > 0, "no business model line");
    for (const l of lines) { assert.doesNotMatch(l, /"null"|\bnull\b|undefined/, l); assert.match(l, want, l); }
  });
}
