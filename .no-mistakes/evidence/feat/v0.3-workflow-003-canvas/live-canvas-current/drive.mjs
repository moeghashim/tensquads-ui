import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M82FRQGN7GR48DV2CT1824X3';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1200,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const log=[];
const state=()=>page.evaluate(()=>window.inspect());
const events=()=>page.evaluate(()=>window.events);
const configure=async patch=>{await page.evaluate(p=>window.configure(p),patch);await page.waitForTimeout(60);};
const clear=()=>page.evaluate(()=>window.events=[]);
const run=async(action,args)=>{const out=await page.evaluate(async({action,args})=>{const c=window.agent.snapshot().find(c=>c.component==='workflow-canvas');return window.agent.act({steps:[{ref:c.ref,action,args}]});},{action,args}); assert.equal(out.ok,true,JSON.stringify(out));await page.waitForTimeout(70);return out.steps[0]?.result;};
const node=id=>page.locator(`[data-node-id="${id}"]`);
const center=async locator=>{const r=await locator.boundingBox();assert.ok(r);return{x:r.x+r.width/2,y:r.y+r.height/2};};
async function draw(from,to){const a=await center(from),b=await center(to);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:6});await page.mouse.up();await page.waitForTimeout(40);}
try{
for(const dir of ['ltr','rtl']){
 await page.goto('http://127.0.0.1:5175/?dir='+dir);await node('start').waitFor();await page.evaluate(()=>document.fonts.ready);await configure({dir});
 const before=await state();const start=await center(node('start'));const dx=dir==='rtl'?-50:50;
 await clear();await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(start.x+dx,start.y+30,{steps:6});
 assert.equal((await events()).filter(e=>e.type==='move').length,0,'draft must not commit');
 assert.deepEqual((await state()).graph,before.graph,'draft must not mutate host graph');
 const draft=await center(node('start'));assert.ok(Math.abs(draft.x-start.x-dx)<1);
 await page.mouse.up();await page.waitForTimeout(80);
 const moves=(await events()).filter(e=>e.type==='move');assert.equal(moves.length,1);
 assert.deepEqual(moves[0].value.position,{x:90,y:130});
 assert.deepEqual((await state()).graph,before.graph,'unapplied callback must leave graph unchanged');
 assert.ok(Math.abs((await center(node('start'))).x-start.x)<1,'draft rolls back without host update');
 log.push({scenario:'controlled pointer drag',dir,before:before.graph.nodes[0],callback:moves[0],after:(await state()).graph.nodes[0],draftCommits:0,releaseCommits:1});
 await configure({apply:true});await clear();
 const snapshot=await page.evaluate(()=>window.agent.snapshot());const entry=snapshot.find(c=>c.component==='workflow-canvas');assert.deepEqual(entry.actions,['select','move','connect']);
 await run('select',[['start','missing'],['missing-edge']]);assert.deepEqual((await state()).selection,{nodes:['start'],edges:[]});
 await run('move',['start',60.4,140.7]);assert.deepEqual((await state()).graph.nodes[0].position,{x:60,y:141});
 await run('connect',['start','agent']);assert.equal((await state()).graph.edges.length,1);
 assert.equal(await node('start').getAttribute('aria-description'),'Connects to Draft reply');
 const accepted=await events();assert.ok(accepted.every(e=>e.source==='agent'));
 log.push({scenario:'agent applies host updates',dir,entry,callbacks:accepted,state:await state()});
 await clear();
 const rejected=[['connect',['start','start']],['connect',['agent','start']],['connect',['end','agent']],['connect',['start','agent']],['connect',['branch','end']],['connect',['branch','end',2]],['connect',['branch','end',0.5]],['connect',['missing','end']],['move',['missing',10,10]],['move',['start',null,10]]];
 for(const [action,args] of rejected)assert.equal(await run(action,args),false,`${action} ${JSON.stringify(args)} must refuse`);
 assert.equal((await events()).length,0,'guards must not call host');
 await draw(node('agent').locator('[data-port="out"]'),node('start'));assert.equal((await events()).filter(e=>e.type==='connect').length,0);
 log.push({scenario:'connection and agent guards',dir,rejected,hostCallbacks:await events()});
 await clear();await configure({cancel:true});const preCancel=await state();
 assert.equal(await run('move',['start',200,200]),false);assert.equal(await run('connect',['branch','end',1]),false);await run('select',[['end']]);
 const postCancel=await state();assert.deepEqual(postCancel.graph,preCancel.graph);assert.deepEqual(postCancel.selection,preCancel.selection);
 log.push({scenario:'host veto',dir,callbacks:await events(),unchangedGraph:true,unchangedSelection:true});
 await configure({cancel:false,mode:'pan'});await run('move',['start',60,160]);assert.equal((await state()).graph.nodes[0].position.y,160);
 await configure({disabled:true});await clear();assert.equal(await run('move',['start',0,0]),false);assert.equal(await run('connect',['branch','end',1]),false);assert.equal((await events()).length,0);
 await configure({disabled:false,mode:'select'});
 const sizes=(await state()).sizes;assert.equal(Object.keys(sizes).length,4);assert.ok(Object.values(sizes).every(s=>s.width>0&&s.height>0));
 const root=page.getByRole('region',{name:'Live workflow'});const rect=await root.boundingBox();
 for(const [delta,expected] of [[-10000,2],[10000,0.5]]){
 for(let i=0;i<5;i++){await root.evaluate((el,{delta,rect})=>el.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,ctrlKey:true,deltaY:delta,clientX:rect.x+100,clientY:rect.y+200})),{delta,rect});await page.waitForTimeout(30);}assert.equal((await state()).viewport.zoom,expected);
 }
 await root.focus();await page.keyboard.press('0');await page.waitForTimeout(70);
 assert.equal((await state()).viewport.zoom,1);assert.equal((await state()).frozen,true);assert.deepEqual((await state()).initial,before.graph);
 await page.screenshot({path:`${evidence}/host-${dir}.png`,fullPage:true});
 log.push({scenario:'viewport clamp and measured nodes',dir,sizes,zoomBounds:[0.5,2],state:await state()});
}
assert.deepEqual(errors,[]);
await writeFile(`${evidence}/host-contract.json`,JSON.stringify({surface:'Real Canvas React component and real UI SDK agent bridge served by local Vite; synthetic frozen four-node workflow',oracle:'v0.3-workflow task 003 and Canvas public contract',results:log,pageErrors:errors},null,2));
console.log('Live host contracts passed for LTR and RTL. Evidence: host-contract.json, host-ltr.png, host-rtl.png');
}finally{await browser.close();}
