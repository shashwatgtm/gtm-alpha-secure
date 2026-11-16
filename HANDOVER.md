# Job E handover

17 November 2026. GTM Alpha roadmap and scoring inputs.

Code and tests: `f5fe87643aca8dc9245c96cbc959518d32788421`. Base: `dea509e9f5ede33199c349acd1e39e488e09082c`. Branch: `codex/roadmap-horizon-fix-20261117`.

The roadmap accepts supported 30, 60 and 90 day durations, including existing synonyms, and checks the supplied day count for conflicts. An unsupported or conflicting horizon prompts the buyer to choose one of the three supported durations. An omitted horizon retains the labeled default. Both scoring tools ask for a supported geography or deal source before scoring. Recognized synonyms retain their existing meaning.

The nine vertical repeats passed. The full native base and candidate comparison remains open because the execution workspace disconnected. The release gate is a native run with the existing lockfile dependencies and a smoke check on the fully assembled coordinator draft. The production site and default branch were outside this run.

Resume at [Coordinator release steps](REPORT-E-20261117.md#coordinator-release-steps). The report includes the exact commands, expected output, changed files and rollback procedure.
