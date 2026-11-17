import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = '.test-phase/fixture';
await mkdir(`${root}/scripts`, {recursive:true});
await mkdir(`${root}/packages/ui/src/styles/nested`, {recursive:true});
await copyFile('scripts/check-css-tokens.mjs', `${root}/scripts/check-css-tokens.mjs`);
const file = `${root}/packages/ui/src/styles/nested/example.css`;
const cases = [
 ['allowed keywords and tokens', '.sample {color: var(--ts-red-500); background: transparent; border-color: currentColor; outline-color: var(--ts-blue);}', 0],
 ['raw named color fallback', '.sample {color: var(--ts-brand, red);}', 1],
 ['raw hex color', '.sample {border: 1px solid #abcdef;}', 1],
 ['raw functional color', '.sample {background: oklch(50% 0.2 30);}', 1],
];
let log='Real CSS checker CLI, isolated synthetic style directory. Oracle: author requires tokens/transparent/currentColor accepted; raw literals and fallbacks rejected.\n';
for(const [name, css, expected] of cases){
 await writeFile(file, css);
 const result=spawnSync(process.execPath,[`${root}/scripts/check-css-tokens.mjs`],{encoding:'utf8'});
 log+=`\n${name}\nInput: ${css}\nExit: ${result.status}\n${result.stdout}${result.stderr}`;
 assert.equal(result.status,expected);
 if(expected) assert.match(result.stderr,/nested\/example\.css/);
}
await writeFile('~/.no-mistakes/evidence/01M7NV0E5DTF17YN6TW97Q6B82/css-checker-cli.txt',log);
console.log(log);
await rm(root,{recursive:true});
