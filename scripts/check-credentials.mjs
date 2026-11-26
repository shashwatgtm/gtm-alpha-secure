// Scan tracked Git blobs. Report only the verdict, never the matched text.
import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';

const sensitiveName = /^(?:\.mcpregistry_|\.netrc$)|token|\.p(?:12|fx)$|\.pem$/i;
const credential = /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----|(?:github_pat_|gh[pousr]_|npm_)[A-Za-z0-9_]{28,}|(?:^|[^A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{12,}\.eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{16,}/m;
const tracked = execFileSync('git', ['ls-files', '--stage', '-z'], { encoding: 'utf8' });
const scanned = new Set();
for (const entry of tracked.split('\0').filter(Boolean)) {
  const [meta, ...parts] = entry.split('\t');
  const name = basename(parts.join('\t'));
  const [mode, sha, stage] = meta.split(' ');
  if (stage !== '0' || mode === '160000') continue;
  if (sensitiveName.test(name)) { process.exitCode = 1; break; }
  if (scanned.has(sha)) continue;
  scanned.add(sha);
  const bytes = execFileSync('git', ['cat-file', 'blob', sha], { maxBuffer: 32 * 1024 * 1024 });
  if (!bytes.includes(0) && credential.test(bytes.toString('utf8'))) { process.exitCode = 1; break; }
}
console.log(process.exitCode ? 'Credential scan failed. Check tracked file names and contents privately.' : 'Credential scan passed.');
