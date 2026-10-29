# Alpha timing tests, 29 October 2026

Branch delivery with validation failures still open. This receipt supersedes the historical HOLD and test results in timing-tests-review-20261029.md for this delivery. The historical document is retained exactly from the supplied patch.

Base: `dd570da2cffd1fd45198933fa507b9bc81ac2087`. Verified master again before delivery. Linux cloud executor, Node v24.22.1. Files retrieved through the GitHub connector at the exact base. No applicable AGENTS.md or GitHub workflows in the complete tree. The Windows backlog, LEDGER.md, SESSION-LOG.md, investigation and MORNING-REPORT.md were unavailable and could not be read or updated. No cloud dispatcher exposed. No worker assumed running.

No deployment, PR, merge, master write, force push, workflow dispatch, Netlify command, version, authentication, endpoint, challenge, headers, hosted video or privacy changes. No paid APIs or external test requests. Synthetic fixtures only. No dependency replacement or mock was used. The npm registry is outside this executor's supplied network allowlist, so dependencies were not installed or fetched through an alternative route.

Applied `docs/alpha-timing-tests-20261029.patch` from craft-gtm-mcp branch `codex/timing-tests-20261029`, blob `074a5dcc1197543a0ad9af90b40aca2c9c251967`, using `git apply --check ../timing.patch` and `git apply ../timing.patch`. Both exit 0. Original hostile values, legacy fixtures, inertness assertions and large inputs remain intact. No timing threshold was weakened.

Commands from the cloud alpha-timing directory:

| Command | Exit | Pass | Fail | Skip |
| --- | --- | --- | --- | --- |
| `node --test --test-isolation=none --test-reporter=tap tests/run40s-escape.test.mjs` | 1 | 0 | 1 | 0 |
| `node --test --test-isolation=none --test-reporter=tap tests/*.test.mjs` | 1 | 20 | 11 | 0 |
| `node --test --test-isolation=none --test-reporter=tap tests/isolated-escape.scratch.mjs` | 1 | 1 | 1 | 0 |
| `taskset -c 0 node --test --test-isolation=none --test-reporter=tap tests/isolated-escape.scratch.mjs` | 0 | 2 | 0 | 0 |

The targeted file fails to import @netlify/blobs. Ten suite entries are file import failures for this missing dependency. The other failure is the version.json git fallback test: this is a connector materialization without a Git HEAD. These runner totals do not imply that all contained assertions ran.

The scratch isolated harness is the supplied file through its first two tests, with only MCP and API imports and the tool listing setup removed. It retains the original VALUES, LIVE matcher, OLD fixtures, correctness test, large input test and helper unchanged. It is not a full handler test. It is excluded from delivery. The unpinned run failed the growth assertion on input 0. The busy run passed. Both results are retained; there was no best of retry selection.

Busy setup: two `taskset -c 0 python -c 'import time; ...'` processes each looping on `time.monotonic()` for at most 30 seconds, with the test pinned to CPU 0. The parent enforced a 25 second test timeout and terminated and waited for both load processes in a finally block.

`COMMIT_REF=0123456789abcdef0123456789abcdef01234567 node scripts/build-site.mjs`: exit 0. Build generated 49 files and no new CSP hashes. Generated outputs are excluded from delivery; no build artifact changes are required for a test patch.

Next: validate with installed dependencies in a complete cloud checkout and investigate the observed growth failure. Do not treat this branch as passing.

## Isolated receipt

```text
TAP version 13
# Subtest: the escape pass: every escaped value is inert by itself (unit)
ok 1 - the escape pass: every escaped value is inert by itself (unit)
  ---
  duration_ms: 77.042758
  type: 'test'
  ...
# Subtest: the escape pass: large adversarial inputs stay within the CPU budget
not ok 2 - the escape pass: large adversarial inputs stay within the CPU budget
  ---
  duration_ms: 1952.461011
  type: 'test'
  location: '/workspace/scratch/04a03a5b1fb2/alpha-timing/tests/isolated-escape.scratch.mjs:66:1'
  failureType: 'testCodeFailure'
  error: 'superlinear CPU growth on input 0: 13.64 -> 121.38 ms'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: '=='
  stack: |-
    assertCpuBudget (file:///workspace/scratch/04a03a5b1fb2/alpha-timing/tests/helpers/cpu-budget.mjs:57:12)
    process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    async TestContext.<anonymous> (file:///workspace/scratch/04a03a5b1fb2/alpha-timing/tests/isolated-escape.scratch.mjs:68:3)
    async Test.run (node:internal/test_runner/test:1409:7)
    async Test.processPendingSubtests (node:internal/test_runner/test:974:7)
  ...
1..2
# tests 2
# suites 0
# pass 1
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2084.697099
```

## Busy receipt

```text
TAP version 13
# Subtest: the escape pass: every escaped value is inert by itself (unit)
ok 1 - the escape pass: every escaped value is inert by itself (unit)
  ---
  duration_ms: 253.112939
  type: 'test'
  ...
timing CPU ms [quarter, full]: [[14.502,60.843],[5.248,32.03],[6.491,20.627],[13.77,63.385],[14.592,49.89],[1.763,6.186],[3.918,11.265],[26.026,44.915],[8.222,48.29],[11.172,28.189],[11.813,15.662],[4.628,8.102],[11.962,20.766],[10.986,29.464]]
# Subtest: the escape pass: large adversarial inputs stay within the CPU budget
ok 2 - the escape pass: large adversarial inputs stay within the CPU budget
  ---
  duration_ms: 8075.211038
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8552.939781
```
