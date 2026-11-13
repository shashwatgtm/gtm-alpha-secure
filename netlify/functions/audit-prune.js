// 13 Nov 2026 (owner): audits from the free EPIC audit form are deleted after 90 days. Netlify runs this once a day on
// the published site. It reads the record keys (company domain, day) and deletes records older than 90 days, with the
// GTM challenge and any email hash they hold.
import { getStore } from "@netlify/blobs";
import { pruneAudits, STORE } from "../lib/audit-memory.js";

export default async () => {
  try {
    const { cutoff, deleted } = await pruneAudits(getStore(STORE));
    return new Response(`Deleted ${deleted} audit records dated before ${cutoff}.`, { status: 200 });
  } catch {
    return new Response("Audit prune failed; it runs again tomorrow.", { status: 500 });
  }
};

export const config = { schedule: "@daily" };
