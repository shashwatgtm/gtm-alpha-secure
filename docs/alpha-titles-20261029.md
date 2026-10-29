# Alpha tool titles, 29 October 2026

Branch delivery complete. Full validation remains blocked by environment prerequisites.

Base: `dd570da2cffd1fd45198933fa507b9bc81ac2087`. Verified master again before delivery. Linux cloud executor, Node v24.22.1. Files retrieved through the GitHub connector at the exact base. No applicable AGENTS.md or GitHub workflows in the complete tree. The Windows backlog, LEDGER.md, SESSION-LOG.md, investigation and MORNING-REPORT.md were unavailable and could not be read or updated. No cloud dispatcher exposed. No worker assumed running.

No deployment, PR, merge, master write, force push, workflow dispatch, Netlify command, version, authentication, endpoint, challenge, headers, hosted video or privacy changes. No paid APIs or external test requests. Synthetic fixtures only. No dependency replacement or mock was used. The npm registry is outside this executor's supplied network allowlist, so dependencies were not installed or fetched through an alternative route.

| Tool | Before | After |
| --- | --- | --- |
| epic_audit | EPIC scores (in Claude) | EPIC scores |
| generate_roadmap | GTM Roadmap (in Claude) | GTM Roadmap |
| gtm_consultation | EPIC motion scores and first 30 days | EPIC motion scores and first 30 days |

Only the two requested title and annotations.title pairs change in netlify/functions/mcp-sse.js. Tool names, descriptions, inputs, other annotations and behavior are byte preserved. No existing test pinned these titles. Added tests/tool-titles.test.mjs to check both title fields for all three tools directly from the declaration without invoking a handler.

Commands from the cloud alpha-titles directory:

| Command | Exit | Pass | Fail | Skip |
| --- | --- | --- | --- | --- |
| `node --test --test-isolation=none --test-reporter=tap tests/tool-titles.test.mjs` | 0 | 3 | 0 | 0 |
| `node --test --test-isolation=none --test-reporter=tap tests/*.test.mjs` | 1 | 23 | 11 | 0 |

Ten full suite entries fail at import because @netlify/blobs is absent. The other failure is the version.json Git fallback test because this connector materialization has no Git HEAD. Totals include file import failures, not executed assertions from those files.

`COMMIT_REF=0123456789abcdef0123456789abcdef01234567 node scripts/build-site.mjs`: exit 0. Build generated 49 files and no new CSP hashes. The runtime file is hand maintained. No generated artifact change is needed for titles. Build outputs and unrelated generated report changes are excluded from the branch.

Next: run the full suite in a complete cloud checkout with dependencies. No host or browser test was performed.
