import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, cpSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const phase=path.join(root,'.test-phase');
const evidence='/Users/moeghashim/.no-mistakes/evidence/01M7NFV05NTXBSQWWQ74YTPX2N';
const env={...process.env,TMPDIR:path.join(phase,'tmp'),npm_config_userconfig:path.join(phase,'npmrc'),npm_config_cache:path.join(phase,'cache'),npm_config_audit:'false',npm_config_fund:'false'};
writeFileSync(env.npm_config_userconfig,'');
let log=`Runtime: ${process.version}\n`;
function run(cmd,args,cwd=root,expected=0){
 const result=spawnSync(cmd,args,{cwd,env,encoding:'utf8'});
 log+=`\n$ ${cmd} ${args.join(' ')}\n${result.stdout??''}${result.stderr??''}\nexit=${result.status}\n`;
 writeFileSync(path.join(evidence,'package-consumer-transcript.log'),log);
 assert.equal(result.status,expected,`Unexpected status for ${cmd} ${args.join(' ')}`);
 return result.stdout;
}
run('npm',['run','check:pack']);
const pack=JSON.parse(run('npm',['pack','--json','--pack-destination',phase]));
writeFileSync(path.join(evidence,'published-package-manifest.json'),JSON.stringify(pack,null,2));
const names=pack[0].files.map(x=>x.path);
assert(!names.some(x=>/(?:test|spec)/i.test(x)), 'No test artifacts in published tarball');
const tarball=path.join(phase,pack[0].filename);
const consumer=path.join(phase,'consumer');mkdirSync(consumer);
writeFileSync(path.join(consumer,'package.json'),JSON.stringify({name:'isolated-ui-consumer',version:'1.0.0',private:true,type:'module'}));
run('npm',['install','--ignore-scripts','--strict-peer-deps',tarball,'react@19.3.1','react-dom@19.3.1'],consumer);
run('node',['--input-type=module','-e',`import {readFileSync} from 'node:fs';
for(const p of ['tokens','react','squadmates','openui','openui/server','schemas']){await import('@tensquads/ui/'+p);console.log('Imported @tensquads/ui/'+p)}
for(const p of ['tokens.css','styles.css']){const url=import.meta.resolve('@tensquads/ui/'+p);readFileSync(new URL(url));console.log('Resolved and read '+p)}
try{await import('@tensquads/ui');throw Error('Root import unexpectedly exposed')}catch(e){if(e.code!=='ERR_PACKAGE_PATH_NOT_EXPORTED')throw e;console.log('Root import stays private')}
`],consumer);
run('npm',['ls','react','react-dom','@ui-sdk/react'],consumer);
const incompatible=path.join(phase,'incompatible');mkdirSync(incompatible);
writeFileSync(path.join(incompatible,'package.json'),JSON.stringify({name:'incompatible-consumer',version:'1.0.0',private:true}));
const rejected=run('npm',['install','--ignore-scripts','--strict-peer-deps',tarball,'react@19.3.1','react-dom@18.3.1'],incompatible,1);
run('npm',['ls','@types/node','@openuidev/lang-core','@openuidev/react-lang','@ui-sdk/core','@ui-sdk/react','zod']);
const version=JSON.parse(readFileSync('node_modules/@types/node/package.json','utf8')).version;
assert.equal(version,'24.19.2');
const contaminated=path.join(phase,'contaminated');mkdirSync(contaminated);
for(const p of ['package.json','tsconfig.json','tsconfig.build.json','scripts','packages/ui/src']){const dest=path.join(contaminated,p);mkdirSync(path.dirname(dest),{recursive:true});cpSync(p,dest,{recursive:true});}
symlinkSync(path.join(root,'node_modules'),path.join(contaminated,'node_modules'),'dir');
const configPath=path.join(contaminated,'tsconfig.build.json');
const config=JSON.parse(readFileSync(configPath));config.exclude=config.exclude.filter(x=>!x.endsWith('/test-setup.ts'));writeFileSync(configPath,JSON.stringify(config));
run('npm',['run','check:pack'],contaminated,1);
log+='\nVerified all expected outcomes: clean published files; six JS exports and two CSS exports; private root; React DOM 19 install; React DOM 18 rejected; Node 24 type package resolved; actual contaminated tarball rejected.\n';
writeFileSync(path.join(evidence,'package-consumer-transcript.log'),log);
console.log(log);
