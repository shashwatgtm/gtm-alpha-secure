import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../netlify/functions/mcp-sse.js', import.meta.url), 'utf8');
const declaration = source.match(/var TOOLS = (\[[\s\S]*?\n\]);/);
assert.ok(declaration, 'tool declarations exist');
const tools = vm.runInNewContext('(' + declaration[1] + ')', Object.create(null), { timeout: 1000 });
for (const [name, expected] of Object.entries({gtm_consultation: 'EPIC motion scores and first 30 days', epic_audit: 'EPIC scores', generate_roadmap: 'GTM Roadmap'})) {
  test(name + ' has the exact public and annotation titles', () => {
    const tool = tools.find(t => t.name === name);
    assert.ok(tool);
    assert.equal(tool.title, expected);
    assert.equal(tool.annotations.title, expected);
  });
}
