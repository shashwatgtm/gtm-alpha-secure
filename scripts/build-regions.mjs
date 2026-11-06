// Development only: Node 22.13 or later. The generated runtime remains plain JS.
import {stripTypeScriptTypes} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const names=['regions','region-reader','region-adapter','verticals','text-signals'];
for(const name of names){
 const source=readFileSync(new URL('../src/'+name+'.ts',import.meta.url),'utf8');
 const output=stripTypeScriptTypes(source,{mode:'strip'}).replace(/(from\s+['"][^'"]+)\.ts(['"])/g,'$1.js$2');
 writeFileSync(new URL('../netlify/lib/'+name+'.js',import.meta.url),output);
}
