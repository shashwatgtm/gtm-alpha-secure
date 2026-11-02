# Alpha small fixes

Branch only. Base dcf9a35614c02d7feafa96d46560eb755052194a. No deployment, main or master changes, version change or tool definition change.

C69: the original lock contains minimatch 10.2.6 as a development dependency. The reviewed advisory GHSA-g3hv-75wg-m249 identifies pattern amplification at optimizationLevel 2 or greater and fixes it in 11.0.1. Source: https://github.com/advisories/GHSA-g3hv-75wg-m249 and the maintainer advisory https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249.

The draft pins the minimatch override to 11.0.1. npm regenerated the lock, then unrelated platform metadata changes were restored. Only minimatch and its new nonrecursive matching dependency change. Existing brace-expansion 5.0.12 satisfies the new range. npm ci --ignore-scripts succeeded with 1060 packages. No lifecycle scripts ran. The existing sharp override remains unchanged.

Reachability: all 13 JavaScript function and library files at the base were inspected. They import local modules, Node builtins and @netlify/blobs. No minimatch or optimizationLevel reference exists. The complete production dependency closure in the lock excludes minimatch. Netlify build, build-info, zip-it-and-ship-it, typescript-estree, glob and readdir-glob reach it during development or build. This evidence does not show a visitor request path to the vulnerable matcher. It is not a forensic inspection of the deployed bundle. Build inputs should remain trusted, and the dependency update still belongs in the next reviewed build.

C18: /connect and /connect/ now redirect to /integration with HTTP 301 in the existing _redirects file. The build allowlist already copies this file. API and MCP rules are untouched. The captured public installation destination is /integration. No live request or deploy was made.

Validation: focused lock closure, source import, normal glob semantics, bounded advisory shape and redirect tests. Full Netlify build not run because this isolated worktree contains only the source needed for these checks, not the complete site assets. An override across a major version needs the complete repository build before merging. Readiness: redirect 95% as a draft; dependency fix 90% as a draft, pending full build compatibility.
