import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
const evidence='/Users/moeghashim/.no-mistakes/evidence/01M7NKT50PE6E9XXK3Z2099N9R';
const log=[];
const source=JSON.parse(await fs.readFile('design/tokens.json','utf8'));
const expected={};
for(const group of Object.values(source)) for(const t of group?.tokens??[]) expected[t.name]=typeof t.value==='object'?t.value:{light:t.value,dark:t.value};
for(const [name,value] of Object.entries(source.type.families)) expected[`font-${name}`]={light:value,dark:value};
for(const group of source.type.groups) for(const style of group.styles) {
 for(const [property,value] of Object.entries(style)) if(!['name','usage','family'].includes(property)) expected[`${style.name}.${property.replace(/[A-Z]/g,c=>`-${c.toLowerCase()}`)}`]={light:String(value),dark:String(value)};
 const family=source.type.families[style.family??group.family];
 expected[`${style.name}.font-family`]={light:family,dark:family};
}
const resolve=(value,theme)=>String(value).replace(/\{([^}]+)\}/g,(_,name)=>resolve(expected[name][theme],theme));
const exported=await import('../packages/ui/dist/tokens/index.js');
assert.deepEqual(Object.keys(exported),['tokens']);
assert.deepEqual(Object.keys(exported.tokens).sort(),Object.keys(expected).sort());
for(const [name,values] of Object.entries(expected)) for(const theme of ['light','dark']) assert.equal(exported.tokens[name][theme],resolve(values[theme],theme),`${name} ${theme}`);
log.push(`Public package runtime exports only tokens; all ${Object.keys(expected).length} token names and both resolved theme values match the synced source.`);
const css=await fs.readFile('packages/ui/dist/tokens/tokens.css','utf8');
const html=`<!doctype html><meta charset="utf-8"><title>Generated tokens live consumer</title><style>${css}\nbody{margin:0;padding:48px;background:var(--ts-canvas);color:var(--ts-text);font-family:var(--ts-text-md-font-family)}h1{font-size:var(--ts-heading-xl-font-size)}.card{background:var(--ts-gray-0);padding:var(--ts-space-6);border-radius:var(--ts-radius-md);box-shadow:var(--ts-shadow-node);max-width:800px}p{font-size:var(--ts-text-md-font-size);line-height:var(--ts-text-md-line-height)}.swatches{display:flex;gap:var(--ts-space-4)}.swatches i{width:72px;height:72px;border-radius:var(--ts-radius-md);background:var(--ts-text)}code{font-family:var(--ts-font-mono)}.mode{margin-bottom:24px}</style><div class="mode" id="mode"></div><div class="card"><h1>Generated design tokens</h1><p>Typography inherits the source font family. Spacing, radius, shadow and motion use the generated CSS custom properties.</p><div class="swatches"><i></i><i style="background:var(--ts-gray-150)"></i><i style="background:var(--ts-canvas)"></i></div><p><code>--ts-space-4: 16px · --ts-radius-md: 8px · --ts-duration-basic: 150ms</code></p></div>`;
await fs.writeFile(`${evidence}/token-consumer.html`,html);
const server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(html)}).listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1100,height:650}});
 for(const os of ['light','dark']) for(const explicit of [null,'light','dark']) {
  await page.emulateMedia({colorScheme:os});
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(mode=>{if(mode)document.documentElement.dataset.theme=mode},explicit);
  const actual=await page.evaluate(names=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(names.map(n=>[n,s.getPropertyValue('--ts-'+n.replaceAll('.','-')).trim()]))},Object.keys(expected));
  const theme=explicit??os;
  for(const [name,values] of Object.entries(expected)) assert.equal(actual[name],resolve(values[theme],theme),`${os}/${explicit} ${name}`);
  await page.locator('#mode').evaluate((el,label)=>el.textContent=label,`OS: ${os} · explicit theme: ${explicit??'none'} · effective: ${theme}`);
  await page.screenshot({path:`${evidence}/theme-${os}-${explicit??'auto'}.png`});
  log.push(`Browser OS ${os}, explicit ${explicit??'none'}: all ${Object.keys(expected).length} computed custom properties match ${theme} values.`);
 }
 assert.equal(await page.locator('.card').evaluate(el=>getComputedStyle(el).borderRadius),'8px');
 assert.equal(await page.locator('p').first().evaluate(el=>getComputedStyle(el).fontSize),'16px');
 assert.equal(await page.locator('.swatches').evaluate(el=>getComputedStyle(el).gap),'16px');
} finally {await browser.close();server.close();}
const root='.test-runtime/disposable';
await fs.mkdir(`${root}/scripts`,{recursive:true});await fs.mkdir(`${root}/design`,{recursive:true});await fs.mkdir(`${root}/packages/ui/src/tokens`,{recursive:true});
await fs.copyFile('scripts/build-tokens.mjs',`${root}/scripts/build-tokens.mjs`);await fs.copyFile('design/tokens.json',`${root}/design/tokens.json`);
const cli=(check=false)=>spawnSync(process.execPath,[`${root}/scripts/build-tokens.mjs`,...(check?['--check']:[])],{encoding:'utf8'});
let result=cli(true);assert.equal(result.status,1);log.push(`Missing outputs rejected (exit 1): ${result.stderr.trim()}`);
assert.equal(cli().status,0);assert.equal(cli(true).status,0);
const read=async()=>Promise.all(['css','ts'].map(ext=>fs.readFile(`${root}/packages/ui/src/tokens/tokens.${ext}`,'utf8')));
const before=await read();assert.equal(cli().status,0);assert.deepEqual(await read(),before);
await fs.writeFile(`${root}/packages/ui/src/tokens/tokens.css`,'stale');result=cli(true);assert.equal(result.status,1);assert.equal(await fs.readFile(`${root}/packages/ui/src/tokens/tokens.css`,'utf8'),'stale');log.push(`Stale CSS rejected without rewriting (exit 1): ${result.stderr.trim()}`);
assert.equal(cli().status,0);await fs.writeFile(`${root}/packages/ui/src/tokens/tokens.ts`,'stale');result=cli(true);assert.equal(result.status,1);log.push(`Stale TypeScript rejected (exit 1): ${result.stderr.trim()}`);
assert.equal(cli().status,0);assert.equal(cli(true).status,0);assert.deepEqual(await read(),before);
log.push('Repeated CLI generation is byte-identical; rebuild repairs stale outputs and check exits 0.');
await fs.writeFile(`${evidence}/live-results.txt`,log.join('\n')+'\n');console.log(log.join('\n'));
