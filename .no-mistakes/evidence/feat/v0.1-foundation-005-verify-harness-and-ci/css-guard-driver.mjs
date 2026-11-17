import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const root = new URL('./css-fixture/', import.meta.url);
await mkdir(new URL('scripts/',root),{recursive:true});
await mkdir(new URL('packages/ui/src/styles/nested/',root),{recursive:true});
await copyFile('scripts/check-css-tokens.mjs',new URL('scripts/check-css-tokens.mjs',root));
const cases = [
 ['token values', '.example {color:var(--ts-text-primary);background:var(--ts-surface);}',0],
 ['comments and strings', '/* color: red */ .example::before { content:"red #fff rgb(1,2,3)";color:var(--ts-text-primary);}',0],
 ['hex literal', '.example{color:#ff00ff}',1],
 ['rgb literal', '.example{border:1px solid rgb(255,0,0)}',1],
 ['hsl literal', '.example{background:hsl(0,100%,50%)}',1],
 ['named literal', '.example{box-shadow:0 0 2px rebeccapurple}',1],
];
for(const [name,css,expected] of cases){
 await writeFile(new URL('packages/ui/src/styles/nested/input.css',root),css);
 const r=spawnSync(process.execPath,[new URL('scripts/check-css-tokens.mjs',root).pathname],{encoding:'utf8'});
 console.log(JSON.stringify({name,expected,exit:r.status,output:r.stdout+r.stderr}));
 if(r.status!==expected)process.exitCode=1;
}
await rm(root,{recursive:true,force:true});
