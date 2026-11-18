import { createServer } from '../apps/preview/node_modules/vite/dist/node/index.js';
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS';
const server = await createServer({ configFile: false, root: new URL('.', import.meta.url).pathname, server: { host:'127.0.0.1', port: 5174, strictPort:true }, esbuild:{jsx:'automatic'}, resolve:{dedupe:['react','react-dom']} });
let browser;
const observations=[];
try {
 await server.listen();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:900}});
 await page.goto('http://127.0.0.1:5174');
 const chip=page.getByRole('button',{name:'customer_schema'}).first();
 await chip.waitFor(); await page.evaluate(()=>document.fonts.ready);
 const output=page.getByRole('status',{name:'Opened objects'});
 await chip.click(); await chip.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
 const opened=await output.textContent();
 if(opened!==JSON.stringify(['customer_schema','customer_schema','customer_schema'])) throw Error('Consumer did not open for mouse, Enter and Space: '+opened);
 if(await chip.getAttribute('aria-pressed')!==null) throw Error('Chip has pressed state');
 observations.push({scenario:'React supplied icon/name opens object on click, Enter, and Space',opened,pressed:await chip.getAttribute('aria-pressed')});
 const disabled=page.getByRole('button',{name:'unavailable_schema'});
 await disabled.evaluate(el=>el.focus());
 if(await disabled.evaluate(el=>document.activeElement===el)) throw Error('Disabled chip focused');
 await disabled.evaluate(el=>el.click());
 const rect=await disabled.boundingBox(); await page.mouse.click(rect.x+rect.width/2,rect.y+rect.height/2);
 if(await output.textContent()!==opened) throw Error('Disabled chip invoked callback');
 await chip.focus(); await page.keyboard.press('Tab');
 if(await page.evaluate(()=>document.activeElement.querySelector('.ts-chip__name')?.textContent)!=='linked_schema') throw Error('Tab did not skip disabled');
 await page.keyboard.press('Enter');
 if(new URL(page.url()).hash!=='#object-details') throw Error('render link did not navigate');
 observations.push({scenario:'Disabled prevents callback/focus; render link navigates',openedAfterDisabled:await output.textContent(),href:page.url()});
 for(const theme of ['light','dark']) for(const dir of ['ltr','rtl']) {
 await page.evaluate(({theme,dir})=>{document.documentElement.dataset.theme=theme;document.documentElement.dir=dir;document.documentElement.lang=dir==='rtl'?'ar':'en'}, {theme,dir});
 await page.mouse.move(389,899); await chip.focus(); await page.keyboard.press('Shift'); await page.waitForTimeout(300);
 const metrics=await chip.evaluate(el=>{const s=getComputedStyle(el);return {height:el.getBoundingClientRect().height,outline:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor,background:s.backgroundColor,iconWidth:el.querySelector('svg').getBoundingClientRect().width}});
 if(metrics.height!==28||metrics.iconWidth!==16||metrics.outline!=='2px'||metrics.offset!=='2px'||metrics.color!==(theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)')) throw Error('Incorrect dimensions or focus '+JSON.stringify(metrics));
 const long=page.getByRole('button',{name:'schema_'+'long_identifier_'.repeat(20)});
 const layout=await long.evaluate(el=>{const span=el.querySelector('.ts-chip__name');return {text:span.textContent,width:span.clientWidth,scrollWidth:span.scrollWidth,height:el.getBoundingClientRect().height,viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth,overflow:getComputedStyle(span).textOverflow}});
 if(layout.content>layout.viewport||layout.scrollWidth>layout.width+1||layout.overflow==='ellipsis'||layout.height<=28) throw Error('Long identifier clipped/overflowed '+JSON.stringify(layout));
 await page.screenshot({path:`${evidence}/consumer-${dir}-${theme}-390.png`,fullPage:true});
 observations.push({scenario:`390px ${dir} ${theme} focus and 307-character identifier`,metrics,layout});
 }
 const stream=page.getByRole('button',{name:'customer_schema'}).last();
 await stream.click();await stream.focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 const streamObservation={scenario:'OpenUI customer_schema activation',openedBefore:opened,openedAfter:await output.textContent(),icon:await stream.locator('.ts-chip__icon').textContent(),url:page.url()};
 observations.push(streamObservation);
 await writeFile(`${evidence}/consumer-observations.json`,JSON.stringify(observations,null,2));
 console.log(JSON.stringify(observations,null,2));
} finally {if(browser) await browser.close(); await server.close();}
