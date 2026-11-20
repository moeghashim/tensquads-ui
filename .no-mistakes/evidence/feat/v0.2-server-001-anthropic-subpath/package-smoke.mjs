import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root = process.cwd();
const fixture = resolve('.local-validation/consumer');
mkdirSync(fixture,{recursive:true});
writeFileSync(`${fixture}/package.json`,JSON.stringify({name:'sdk-optional-live-consumer',version:'1.0.0',type:'module',private:true}));
const run = (command,args,cwd=fixture) => execFileSync(command,args,{cwd,encoding:'utf8',env:process.env});
const pack = JSON.parse(run('npm',['pack','--json','--pack-destination',fixture],root))[0];
console.log(run('npm',['install','--ignore-scripts','--no-audit','--no-fund',`${fixture}/${pack.filename}`]));
const tree = spawnSync('npm',['ls','@anthropic-ai/sdk','--all','--json'],{cwd:fixture,encoding:'utf8'});
console.log('Consumer SDK dependency tree before explicit install:\n'+tree.stdout);
const visit = node => {for(const [name,dep] of Object.entries(node.dependencies??{})){if(name==='@anthropic-ai/sdk')throw Error('SDK unexpectedly installed');visit(dep);}};
visit(JSON.parse(tree.stdout));
writeFileSync(`${fixture}/isolate.mjs`, `export async function resolve(specifier,context,next){const result=await next(specifier,context);if(specifier==='@anthropic-ai/sdk' && !result.url.startsWith(new URL('./node_modules/',import.meta.url).href)){const e=new Error('SDK absent from isolated consumer; parent dependency blocked');e.code='ERR_MODULE_NOT_FOUND';throw e;}return result;}`);
const check = `
const modules = ['tokens','react','squadmates','openui','openui/server','schemas'];
for(const entry of modules){const m=await import('@tensquads/ui/'+entry);console.log(entry+': '+Object.keys(m).length+' exports loaded without SDK');}
const server = await import('@tensquads/ui/openui/server');
const req = new Request('http://localhost/openui',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({turns:[{role:'user',content:'Hello'}]})});
console.log('Provider-neutral request validation:',JSON.stringify(await server.readOpenUIRequest(req)));
try{await import('@tensquads/ui/openui/server/anthropic');throw Error('Provider loaded despite absent SDK');}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;console.log('Anthropic entry without SDK: expected ERR_MODULE_NOT_FOUND');}
`;
console.log(run(process.execPath,['--experimental-loader',`${fixture}/isolate.mjs`,'--input-type=module','-e',check]));
console.log(run('npm',['install','--ignore-scripts','--no-audit','--no-fund','@anthropic-ai/sdk@1.10.0']));
console.log(run(process.execPath,['--input-type=module','-e',`const {createAnthropicProvider,DEFAULT_ANTHROPIC_MODEL}=await import('@tensquads/ui/openui/server/anthropic'); const provider=createAnthropicProvider('synthetic-local-key'); if(typeof provider.stream !== 'function')throw Error('Missing stream'); console.log('Explicit SDK 1.10.0: provider created, stream callable, default model='+DEFAULT_ANTHROPIC_MODEL);`]));
