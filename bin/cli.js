#!/usr/bin/env node
// GTM Alpha MCP server over stdio (the npm package @shashwatgtmalpha/gtm-alpha-mcp-server).
// Since version 1.3.0 it answers with the SAME code as the hosted server at https://gtmalpha.gtmhelix.com/mcp:
// tools/list and tools/call are passed, in this process, to netlify/functions/mcp-sse.js. So the npm package and the
// hosted address give the same answer for the same input, including the labels on example figures and the input checks.
// Nothing is sent over the network and nothing is stored.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'node:module';
import handler from '../netlify/functions/mcp-sse.js';

const pkg = createRequire(import.meta.url)('../package.json');
let seq = 0;

async function rpc(method, params) {
  const res = await handler(new Request('http://localhost/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++seq, method, params })
  }));
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body.result;
}

const server = new Server({ name: 'gtm-alpha-mcp-server', version: pkg.version }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => rpc('tools/list', {}));
server.setRequestHandler(CallToolRequestSchema, async (request) =>
  rpc('tools/call', { name: request.params.name, arguments: request.params.arguments || {} }));

await server.connect(new StdioServerTransport());
