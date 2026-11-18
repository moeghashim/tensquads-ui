import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
const evidence='~/.no-mistakes/evidence/01M7P4FMX6MKD7HZG3SND5BVC3';
const installed=resolve('.font-test/consumer/node_modules/@tensquads/ui');
const pkg=JSON.parse(await readFile(resolve(installed,'package.json')));
const rows=[... [400,500,600].flatMap(w=>[{id:`en${w}`,text:`Inter ${w}: The quick brown fox 0123456789`,weight:w,lang:'en'},{id:`ar${w}`,text:`معاينة المكوّنات العربية ${w}`,weight:w,lang:'ar'}]),{id:'mono',text:'const squad = 0123456789; // JetBrains Mono 400',weight:400,lang:'en'}];
const html=`<!doctype html><html><meta charset="utf-8"><title>Installed product font specimens</title><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/styles.css"><style>body{margin:40px;background:#fff;color:#111}h1{font:600 28px var(--ts-text-md-font-family)}p{font-family:var(--ts-text-md-font-family);font-size:26px;line-height:1.8}#mono{font-family:var(--ts-code-font-family, 'JetBrains Mono', monospace)}</style><h1>Installed @tensquads/ui · bundled fonts</h1>${rows.map(r=>`<p id="${r.id}" lang="${r.lang}" dir="${r.lang==='ar'?'rtl':'ltr'}" style="font-weight:${r.weight}">${r.text}</p>`).join('')}</html>`;
const requests=[];
const server=createServer(async(req,res)=>{try{if(req.url==='/'){res.setHeader('content-type','text/html');return res.end(html)}const name=req.url.slice(1);const exp=pkg.exports['./'+name];const file=exp?resolve(installed,exp):resolve(installed,'packages/ui/dist',name);assert(file.startsWith(installed+'/'));const body=await readFile(file);res.setHeader('content-type',file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'application/octet-stream');res.end(body);requests.push({path:req.url,status:200,bytes:body.length})}catch(e){res.statusCode=404;res.end('Not found');requests.push({path:req.url,status:404})}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
const report={platform:process.platform,preview:[],consumer:{}};
try{
 browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:'en-US'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
 async function actualFonts(selector){const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});return (await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;}
 for(const locale of ['en','ar']){
  await page.goto(`http://localhost:5173/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);await page.evaluate(()=>document.fonts.ready);await page.locator('h1').waitFor();
  const fonts=await actualFonts('h1');console.log('actual heading',locale,fonts);assert(fonts.some(f=>f.isCustomFont&&f.postScriptName===(locale==='en'?'Inter-SemiBold':'IBMPlexSansArabic-SmBld')));
  report.preview.push({locale,route:'/',fonts});await page.screenshot({path:`${evidence}/preview-${locale}.png`,fullPage:true});
  await page.getByRole('link',{name:'Component preview route'}).click();await page.getByRole('heading',{name:'example',exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);const routeFonts=await actualFonts('h1');assert(routeFonts.some(f=>f.isCustomFont&&f.postScriptName==='Inter-SemiBold'));report.preview.push({locale,route:'/components/example',fonts:routeFonts});
 }
 await page.screenshot({path:`${evidence}/preview-component.png`,fullPage:true});
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.evaluate(()=>document.fonts.ready);
 report.consumer.fonts={};
 for(const row of rows){const fonts=await actualFonts('#'+row.id);const suffix={400:'Regular',500:'Medium',600:'SemiBold'}[row.weight];const wanted=(row.id==='mono'?'JetBrainsMono':row.lang==='ar'?'IBMPlexSansArabic':'Inter')+'-'+suffix;console.log(row.id,fonts);assert(fonts.some(f=>(row.lang==='ar'?f.postScriptName.startsWith('IBMPlexSansArabic'):f.postScriptName===wanted)&&f.isCustomFont));assert(fonts.every(f=>f.isCustomFont));report.consumer.fonts[row.id]=fonts;}
 const loaded=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})));assert.equal(loaded.length,7);assert(loaded.every(f=>f.status==='loaded'));
 report.consumer.loaded=loaded;report.consumer.requests=requests;assert.equal(requests.filter(r=>r.path.endsWith('.woff2')&&r.status===200).length,7);assert(!requests.some(r=>r.path.endsWith('.woff2')&&r.status!==200));
 report.consumer.sansStack=await page.locator('#en400').evaluate(e=>getComputedStyle(e).fontFamily);assert.match(report.consumer.sansStack,/^Inter, "IBM Plex Sans Arabic",/);
 await page.screenshot({path:`${evidence}/installed-font-specimens.png`,fullPage:true});assert.deepEqual(errors,[]);
 report.result='pass';await writeFile(`${evidence}/browser-font-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
