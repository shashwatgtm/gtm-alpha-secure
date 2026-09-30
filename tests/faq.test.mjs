// Run 15 L3: in the FAQ's visible list the Fonts item ends without a full stop ("served from this site"); the FAQPage JSON-LD
// answer text is not changed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "faq.html"), "utf8");

test("the visible Fonts item has no full stop, and the JSON-LD answer keeps its text", () => {
  assert.ok(html.includes("<li><strong>Fonts:</strong> served from this site</li>"));
  assert.ok(!html.includes("served from this site.</li>"));
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const text = JSON.stringify(ld);
  assert.ok(text.includes("ad tracking. Fonts: served from this site.\""), "the JSON-LD text is as it was");
});
