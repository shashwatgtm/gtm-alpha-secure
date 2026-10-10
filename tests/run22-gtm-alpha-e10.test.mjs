// Run 22 round 6 (writer alpha-w1): the lead's check E10 (content that belongs to another kind of company, work/run21/eval/e10_21.mjs) over the answers
// of the three tools for the companies of the tuning pools T, H, P and Q. The pool inputs and the check live in the lead's private evidence folder, so the
// test runs only where that folder and the shared sector file are present (HELIX_WORK, E10_VERTICALS) and is skipped elsewhere. It expects 0 flagged answers.
// Run: node --test tests/run22-gtm-alpha-e10.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const WORK = process.env.HELIX_WORK || "/home/user/directory-submission-work";
const E10 = WORK + "/work/run21/eval/e10_21.mjs";
const POOL = WORK + "/evidence/run22/m-final1/gtm-alpha.json";
const VERT = process.env.E10_VERTICALS || "/home/user/revenue-enablement-mcp/src/verticals.ts";
const here = [E10, POOL, VERT].every((p) => existsSync(p));

test("E10: no answer of the three tools prints a phrase that belongs to another kind of company (pools T, H, P, Q)", { skip: here ? false : "the lead's evidence folder or the shared sector file is not here" }, async () => {
  process.env.E10_VERTICALS = VERT;
  const { e10 } = await import(E10);
  const mcp = (await import("../netlify/functions/mcp-sse.js")).default;
  const rows = JSON.parse(readFileSync(POOL, "utf8")).filter((r) => ["T", "H", "P", "Q"].includes(r.set) && r.args);
  assert.ok(rows.length >= 100, "the pool rows are there: " + rows.length);
  const flagged = [];
  let id = 1;
  for (const r of rows) {
    const res = await mcp(new Request("https://gtmalpha.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name: r.tool, arguments: r.args } }) }), {});
    const j = await res.json();
    assert.ok(j.result && !j.result.isError, r.tool + " answered " + r.sid);
    const out = j.result.content.map((c) => c.text || "").join("\n");
    const hits = e10(out, JSON.stringify(r.args), r.company, r.vertical) || [];
    if (hits.length) flagged.push(r.set + ":" + r.sid + " " + r.tool + " " + hits.map((h) => h.phrase + " (" + h.owner + ")").join(", "));
  }
  assert.deepEqual(flagged, [], "answers flagged by E10: " + flagged.join(" | "));
});
