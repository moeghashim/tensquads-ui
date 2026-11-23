import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Squadmate, SQUADMATES, squadmateMarkup } from '@tensquads/ui/squadmates';
const evidence = '~/.no-mistakes/evidence/01M850CS241DKCMJAXV3QSW3SK';
const states = ['idle','waiting','planning','running','checking','done','sentback','blocked','escalated','dropped'];
const sizes = [16,20,32,63,64,160];
const golden = JSON.parse(await readFile('packages/ui/src/squadmates/markup.golden.json','utf8'));
const data = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
let referenceRows = '', sizeRows = '';
for (const mate of SQUADMATES) {
 const slug = mate.name.toLowerCase();
 let pairs = '';
 for (const state of states) {
  const reference = await readFile(`design/mascots/states/${slug}-${state}.svg`,'utf8');
  if(squadmateMarkup(mate.id,state,64) !== golden[`${mate.id}:${state}`]) throw Error(`Golden mismatch: ${slug}:${state}`);
  pairs += `<figure><figcaption>${state}</figcaption><img width="90" height="90" src="${data(reference)}" alt="${slug} ${state} design reference"><br>${renderToStaticMarkup(createElement(Squadmate,{agent:slug,state,size:90}))}</figure>`;
 }
 referenceRows += `<section><h2>${mate.name}</h2><div class="pairs">${pairs}</div></section>`;
 sizeRows += `<section><h2>${mate.name}</h2><div class="sizes">${sizes.map(size=>`<figure><figcaption>${size}px</figcaption><div class="slot">${renderToStaticMarkup(createElement(Squadmate,{agent:slug,state:'idle',size}))}</div></figure>`).join('')}</div></section>`;
}
const wrap = (title,body) => `<!doctype html><html lang="en"><meta charset="utf-8"><title>${title}</title><style>body{font:14px system-ui;margin:24px;background:#fff;color:#202020}h1{font-size:24px}h2{font-size:16px;margin:8px 0}section{border-top:1px solid #ddd;padding:8px 0}figure{margin:0;text-align:center}figcaption{height:22px}.pairs{display:grid;grid-template-columns:repeat(10,100px);gap:6px}.sizes{display:grid;grid-template-columns:repeat(6,165px);gap:6px}.slot{height:164px;display:flex;align-items:center;justify-content:center}</style><h1>${title}</h1>${body}</html>`;
const pages = {'/reference':wrap('Synced 2D mascots — design reference above, public React component below',referenceRows),'/sizes':wrap('Public Squadmate consumer — cropped below 64px; full body from 64px',sizeRows)};
const server = createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(pages[req.url] || 'missing');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
const results = [];
try {
 browser = await chromium.launch({headless:true});
 const page = await browser.newPage({viewport:{width:1120,height:900},deviceScaleFactor:1});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/reference','/sizes']) {
  await page.goto(`http://127.0.0.1:${server.address().port}${path}`);
  const rendered = await page.locator('img').evaluateAll(async images => {
   await Promise.all(images.map(image=>image.decode()));
   return images.map(image=>{
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,image.width,image.height);
    const pixels=ctx.getImageData(0,0,image.width,image.height).data;
    let ink=0;for(let i=3;i<pixels.length;i+=4) if(pixels[i]>0) ink++;
    return {alt:image.alt,width:image.getBoundingClientRect().width,height:image.getBoundingClientRect().height,naturalWidth:image.naturalWidth,ink};
   });
  });
  if(rendered.some(image=>image.ink===0 || image.width!==image.height || image.naturalWidth===0)) throw Error('Unrendered mascot');
  if(path==='/sizes' && rendered.some((image,i)=>image.width!==sizes[i%6])) throw Error('Incorrect public component size');
  const expected = path==='/reference'?260:78;
  if(rendered.length!==expected) throw Error(`Expected ${expected}, got ${rendered.length}`);
  const file = path==='/reference'?'synced-reference-and-react.png':'public-consumer-size-boundary.png';
  await page.screenshot({path:`${evidence}/${file}`,fullPage:true,animations:'disabled'});
  await writeFile(`${evidence}/${path.slice(1)}.html`,await page.content());
  results.push({route:path,images:rendered.length,allImagesDecodedAndPainted:true,rendered});
 }
 if(errors.length) throw Error(errors.join('\n'));
 await writeFile(`${evidence}/consumer-results.json`,JSON.stringify({goldenOutputMatches:130,browserErrors:errors,results},null,2));
 console.log('Public package consumer: 130 golden outputs match; 260 reference/product images and 78 size-boundary images decoded and painted; exact square dimensions; no browser errors.');
} finally {
 if(browser) await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
