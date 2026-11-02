// Branch-only compatibility verification. This script never invokes deployment.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {zipFunctions} from '@netlify/zip-it-and-ship-it';

const root=process.cwd(),out=join(root,'.lane-b-build');
mkdirSync(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const matchers=Object.entries(lock.packages).filter(([p])=>/(?:^|\/)node_modules\/minimatch$/.test(p)).map(([path,p])=>({path,version:p.version,dev:p.dev===true}));
assert.ok(matchers.length>0,'locked matcher must be present');
for(const m of matchers)assert.equal(m.version,'11.0.1',m.path);

const build=()=>execFileSync(process.execPath,['scripts/build-site.mjs'],{cwd:root,encoding:'utf8',env:{...process.env,COMMIT_REF:process.env.GITHUB_SHA||process.env.COMMIT_REF||''}});
const snapshot=()=>Object.fromEntries(walk('site').map(p=>[relative('site',p),hash(readFileSync(p))]).filter(([p])=>p!=='version.json').sort(([a],[b])=>a.localeCompare(b)));
const firstLog=build(),first=snapshot();
const secondLog=build(),second=snapshot();
assert.deepEqual(second,first,'unchanged complete source must reproduce the public build, except its recorded build timestamp');
writeFileSync(join(out,'build.log'),firstLog+'\nSecond build:\n'+secondLog);

for(const p of ['index.html','pricing.html','consultation.html','integration.html','faq.html','api-docs.html','privacy.html','terms.html','404.html','sample-report/index.html','robots.txt','sitemap.xml','llms.txt','_redirects','_headers','version.json'])assert.ok(existsSync(join('site',p)),p);
for(const p of ['package.json','package-lock.json','netlify','tests','scripts','.git','.env'])assert.ok(!existsSync(join('site',p)),p+' must not be published');
const redirects=readFileSync('site/_redirects','utf8');
assert.match(redirects,/^\/connect\s+\/integration\s+301\s*$/m);
assert.match(redirects,/^\/connect\/\s+\/integration\s+301\s*$/m);
let references=0;
for(const p of walk('site').filter(p=>/\.(?:html|css)$/.test(p))){
 for(const m of readFileSync(p,'utf8').matchAll(/\/assets\/([^"'\s)?#,]+)\?v=([0-9a-f]{10})/g)){
  const asset=join('site','assets',m[1]);assert.ok(existsSync(asset),asset);
  assert.equal(hash(readFileSync(asset)).slice(0,10),m[2],p+' references '+asset);references++;
 }
}
assert.ok(references>0,'hashed assets must be exercised');
const version=JSON.parse(readFileSync('site/version.json','utf8'));
if(process.env.GITHUB_SHA)assert.equal(version.commit,process.env.GITHUB_SHA);

const functions=await zipFunctions('netlify/functions',join(out,'functions'),{repositoryRoot:root,config:{'*':{nodeBundler:'esbuild'}},parallelLimit:1});
assert.ok(functions.some(f=>f.name==='api'),'REST API must bundle');
assert.ok(functions.some(f=>f.name==='mcp-sse'),'MCP endpoint must bundle');
const bundles=functions.map(f=>{assert.ok(f.path&&existsSync(f.path),f.name);const bytes=statSync(f.path).size;assert.ok(bytes>0,f.name);return {name:f.name,runtime:f.runtime,bundler:f.bundler||null,bytes,sha256:hash(readFileSync(f.path))};});
const summary={commit:process.env.GITHUB_SHA||null,node:process.version,matcher_versions:matchers,public_files:Object.keys(second).length+1,asset_references_checked:references,repeat_build_identical_except_timestamp:true,source_excluded_from_public:true,redirects_preserved:true,functions:bundles,production_deployment_performed:false};
writeFileSync(join(out,'compatibility.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
