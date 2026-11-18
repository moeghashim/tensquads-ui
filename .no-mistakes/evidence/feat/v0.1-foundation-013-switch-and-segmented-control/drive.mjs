import { createServer } from '../apps/preview/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q4FJXRV18TA1D3RVQESJY5';
const log=[];
const record=(text)=>{log.push(text);console.log(text)};
let server,browser;
try {
 server=await createServer({configFile:false,root:process.cwd()+'/.local-test',server:{port:5187,strictPort:true,fs:{allow:[process.cwd()]}},esbuild:{jsx:'automatic'},resolve:{dedupe:['react','react-dom']}});await server.listen();
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:900,height:700}});
 await page.goto('http://localhost:5187'); await page.waitForFunction(()=>typeof window.showStream==='function');
 const show=async(stream,reset=false)=>{await page.evaluate(({stream,reset})=>window.showStream(stream,reset),{stream,reset});};
 const checked=async(name,value=true)=>expect(page.getByRole('radio',{name,exact:true})).toHaveAttribute('aria-checked',String(value));
 const onlyOne=async()=>expect(page.getByRole('radio',{checked:true})).toHaveCount(1);
 const read=page.getByRole('switch',{name:'Read only',exact:true}); await read.focus();await expect(read).toBeFocused();await read.press('Space');await read.click();await expect(read).toHaveAttribute('aria-checked','true');
 const disabled=page.getByRole('switch',{name:'Disabled',exact:true});await disabled.click({force:true});await expect(disabled).toHaveAttribute('aria-checked','true');await expect(disabled).toBeDisabled();
 const consent=page.getByRole('switch',{name:'Consent',exact:true});expect(await page.locator('#settings').evaluate(f=>f.checkValidity())).toBe(false);await consent.press('Space');await expect(consent).toHaveAttribute('aria-checked','true');expect(await page.locator('#settings').evaluate(f=>f.checkValidity())).toBe(true);expect(await page.locator('#settings').evaluate(f=>Object.fromEntries(new FormData(f)))).toEqual({readonly:'on',consent:'on'});await page.getByRole('button',{name:'External toggle'}).click();await expect(consent).toHaveAttribute('aria-checked','false');
 record('Switch: readOnly remains focusable and unchanged after Space/click; disabled resists click; required blocks invalid form; controlled Space/external updates change validity and submitted values.');
 for(const dir of ['ltr','rtl']){
  await page.evaluate(dir=>{document.documentElement.dir=dir;window.showStates()},dir);
  const list=page.getByRole('radio',{name:'List',exact:true}),grid=page.getByRole('radio',{name:'Grid',exact:true});
  await page.locator('#before').focus();await page.keyboard.press('Tab');await expect(list).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator('#after')).toBeFocused();
  await list.focus();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await checked('Grid');await onlyOne();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await checked('List');await onlyOne();await page.getByRole('radio',{name:'Blocked'}).click({force:true});await checked('List');await page.getByRole('button',{name:'External grid'}).click();await checked('Grid');
  record(`SegmentedControl ${dir}: one Tab stop, arrows skip disabled and wrap with focus and exclusive selection; disabled click ignored and controlled update selects Grid.`);
 }
 await show('root = Switch("Updates",',true);const sw=page.getByRole('switch');await expect(sw).toHaveAttribute('aria-checked','false');await sw.focus();await show('root = Switch("Updates", true, false)');await expect(sw).toBeFocused();await expect(sw).toHaveAttribute('aria-checked','true');await sw.press('Space');await show('root = Switch("Updates", true, true)');await expect(sw).toHaveAttribute('aria-checked','false');await expect(sw).toBeDisabled();
 record('Streaming Switch: late checked value updates focused control, user choice survives later checked=true and disabled=true.');
 for(const dir of ['ltr','rtl']){
  await page.evaluate(dir=>document.documentElement.dir=dir,dir);
  await show('root = SegmentedControl("View", ["List", "Grid"],',true);await checked('List');await page.getByRole('radio',{name:'List',exact:true}).focus();await show('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(page.getByRole('radio',{name:'List',exact:true})).toBeFocused();await checked('List');await show('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await checked('Grid');await expect(page.getByRole('radio',{name:'List',exact:true})).toBeFocused();
  await show('root = SegmentedControl("View", ["List", "Gr',true);const growing=page.getByRole('radio',{name:'Gr',exact:true});await growing.click();await show('root = SegmentedControl("View", ["List", "Grid"], "G');await checked('Grid');await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeFocused();await show('root = SegmentedControl("View", ["List", "Grid"], "List")');await checked('Grid');await onlyOne();
  record(`Streaming SegmentedControl ${dir}: unfinished initial G preserves focus; final Grid applies; growing Gr to Grid retains focused user selection over later List initial value.`);
  for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']]){
   const prefix=`root = SegmentedControl("View", [${preceding.map(JSON.stringify).join(', ')}, "Li`;
   await show(prefix,true);await page.getByRole('radio',{name:'Li',exact:true}).click();
   for(const stream of [prefix+'st',prefix+'st view"], "List")']){
    await show(stream);await onlyOne();await expect(page.getByRole('radio',{checked:true})).toBeFocused();await expect(page.getByRole('radio',{checked:true})).not.toBeDisabled();expect(await page.getByRole('radio',{name:'List',exact:true}).evaluateAll(nodes=>nodes.filter(n=>!n.hasAttribute('data-disabled')).length)).toBe(1);
   }
   await checked('List view');await page.getByRole('radio',{name:'List',exact:true}).click();await checked('List');
  }
  record(`Streaming duplicates ${dir}: selected second, third, and fourth slots survive Li → List → List view with focus, one enabled duplicate, and one checked radio; original List remains selectable afterward.`);
 }
 for(const stream of ['root = SegmentedControl("View", ["List", "List", "Grid"], "List")','root = SegmentedControl("View", ["List", "Grid"], "Board")']){
  await show('root = SegmentedControl("View", ["List", "Grid"],',true);await page.getByRole('radio',{name:'List',exact:true}).focus();await show(stream);await onlyOne();await expect(page.getByRole('radio',{checked:true})).toBeFocused();expect(await page.getByRole('radio').evaluateAll(nodes=>nodes.filter(n=>!n.hasAttribute('data-disabled')).length)).toBe(2);await page.getByRole('radio',{name:'Grid',exact:true}).click();await checked('Grid');await onlyOne();
 }
 record('Invalid streamed options: duplicate labels expose one enabled copy; unmatched Board initial value defers to List; both retain focus and allow exclusive Grid selection.');
 await page.evaluate(()=>window.showStates());await page.screenshot({path:evidence+'/live-states.png',fullPage:true});
 await show('root = SegmentedControl("View", ["List", "Li',true);await page.getByRole('radio',{name:'Li',exact:true}).click();await show('root = SegmentedControl("View", ["List", "List');await page.screenshot({path:evidence+'/stream-duplicate-focused.png',fullPage:true});
 await show('root = SegmentedControl("View", ["List", "List view"], "List")');await page.screenshot({path:evidence+'/stream-completed-focused.png',fullPage:true});
 record('All live harness assertions passed.');
} catch(error){record(String(error.stack||error));process.exitCode=1;}
finally{if(browser)await browser.close();if(server)await server.close();await writeFile(evidence+'/live-harness.log',log.join('\n'));}
