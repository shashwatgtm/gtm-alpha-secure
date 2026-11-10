# Discovery report: gtm-alpha-secure

Source work is closed on codex/discovery-20261111. Nothing was deployed or published.

Before: ChatGPT users were sent away from the home page for setup.

Why it matters: A supported app can look unsupported without usable steps.

Now in the draft: Three current ChatGPT connection steps and exact MCP address on home, corrected integration copy and public workshop route. Pricing and roadmap durations were retained.

Checks: build passed; changed HTML has one h1, valid JSON-LD, titles at most 65 characters, extensionless canonicals, full raw text and resolving local targets. Browser source review passed at 375 and 1280 px with JavaScript disabled. Exact, same meaning and opposite buyer questions are retained in the hub acceptance cases. Runtime tool code, descriptions, schemas, tests and assistant JSON were left untouched.

Full suite: 5167 tests, 5161 passed, 2 failed, 4 skipped. The suite is not clean.

Already failing on main:

- `report chrome: one company name in the header, footer, aria labels and structured data`
- `the example is a real company used only as an example, with hypothetical figures, and no made-up company is left`

Files changed:

- `discovery-20261111/REPORT.md`
- `discovery-20261111/state.json`
- `index.html`
- `integration.html`
- `llms.txt`

Owner questions: no additional question for this source branch. Cross-site blockers and the release sequence are in the hub discovery-20261111/OWNER-QUESTIONS.md and REPORT.md. Claude reviews the assembled draft, the owner approves release, then Fable checks the live result.
