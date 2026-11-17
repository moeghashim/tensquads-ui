import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
const fixture=resolve('.test-runtime/pack-consumer');
await mkdir(fixture,{recursive:true});
function run(command,args,cwd){const r=spawnSync(command,args,{cwd,encoding:'utf8'});if(r.status!==0)throw new Error(r.stdout+r.stderr);return r.stdout;}
const [{filename}]=JSON.parse(run('npm',['pack','--json','--pack-destination',fixture],process.cwd()));
await writeFile(`${fixture}/package.json`,JSON.stringify({name:'isolated-pack-consumer',version:'1.0.0',type:'module'}));
run('npm',['install','--ignore-scripts',`${fixture}/${filename}`],fixture);
await writeFile(`${fixture}/consume.mjs`, `import {readFile} from 'node:fs/promises';
const pkg=JSON.parse(await readFile('./node_modules/@tensquads/ui/package.json','utf8'));
for(const subpath of Object.keys(pkg.exports)){
 const specifier='@tensquads/ui'+subpath.slice(1);
 const url=import.meta.resolve(specifier);
 if(subpath.endsWith('.css'))console.log(JSON.stringify({specifier,url,bytes:(await readFile(new URL(url))).length}));
 else console.log(JSON.stringify({specifier,url,exports:Object.keys(await import(specifier))}));
}`);
console.log(run(process.execPath,['consume.mjs'],fixture));
await rm(fixture,{recursive:true,force:true});
