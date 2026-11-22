import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M82FRQGN7GR48DV2CT1824X3';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1280,height:900}});
const transcript=[];
const log=(s)=>{transcript.push(s);console.log(s)};
page.on('pageerror',error=>log(`PAGE ERROR: ${error.message}`));
try {
 await page.goto('http://127.0.0.1:5184');
 const root=page.getByRole('region',{name:'Host workflow'});
 await root.waitFor();
 const node=id=>root.locator(`[data-node-id="${id}"]`);
 const original=await page.evaluate(()=>JSON.stringify(window.graph));
 let box=await node('start').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+40,{steps:5});
 assert.equal((await page.evaluate(()=>window.calls.filter(c=>c.type==='move'))).length,0);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.graph)),original);
 assert.ok(Math.abs((await node('start').boundingBox()).x-box.x-60)<1);
 await page.mouse.up();
 await page.waitForTimeout(80);
 const moves=await page.evaluate(()=>window.calls.filter(c=>c.type==='move'));
 assert.equal(moves.length,1);assert.deepEqual(moves[0].value,{id:'start',position:{x:100,y:100}});
 assert.equal(await page.evaluate(()=>JSON.stringify(window.graph)),original);
 assert.ok(Math.abs((await node('start').boundingBox()).x-box.x)<1);
 log('HOST CONTROL: drag painted a 60×40 draft without changing frozen graph; release called host once with {x:100,y:100}, SDK source '+moves[0].source+'; unapplied graph returned to {x:40,y:60}.');
 await page.evaluate(()=>{window.policy.apply=true;window.calls=[]});
 const act=async(action,args)=>page.evaluate(async({action,args})=>{
  const component=window.agent.snapshot().find(c=>c.component==='workflow-canvas');
  return await window.agent.act({steps:[{ref:component.ref,action,args}]});
 },{action,args});
 const snapshot=await page.evaluate(()=>window.agent.snapshot());
 const component=snapshot.find(c=>c.component==='workflow-canvas');assert.ok(component);assert.deepEqual(component.actions,['select','move','connect']);
 log('AGENT SNAPSHOT: '+JSON.stringify(component));
 await act('select',[['branch','missing'],['missing-edge']]);
 assert.equal(await node('branch').getAttribute('aria-selected'),'true');
 assert.deepEqual(await page.evaluate(()=>window.calls.at(-1)),{type:'select',value:{nodes:['branch'],edges:[]},source:'agent'});
 await act('move',['branch',340.4,100.7]);
 await page.waitForTimeout(80);
 assert.deepEqual(await page.evaluate(()=>window.graph.nodes.find(n=>n.id==='branch').position),{x:340,y:101});
 await act('connect',['start','branch']);await page.waitForTimeout(80);
 assert.equal(await root.locator('[data-edge-id]').count(),1);
 assert.equal(await node('start').getAttribute('aria-description'),'Connects to Classify');
 for(const args of [['start','start'],['branch','start',0],['end','branch'],['start','branch'],['branch','end'],['branch','end',2],['branch','end',0.5],['missing','end']]) {
  const before=await page.evaluate(()=>window.calls.length);const outcome=await act('connect',args);
  assert.equal(outcome.steps[0].result,false);assert.equal(await page.evaluate(()=>window.calls.length),before);
 }
 await act('connect',['branch','end',1]);await page.waitForTimeout(80);
 assert.equal(await root.locator('[data-edge-id]').count(),2);
 log('AGENT ACTIONS: selected only existing IDs, moved branch to rounded {340,101}, connected Start→Classify and branch B→End. Host records source agent. Self, incoming Start, outgoing End, duplicate, absent/invalid branch ports and missing-node connections refused without host calls.');
 const beforeCancel=await page.evaluate(()=>JSON.stringify(window.graph));
 await page.evaluate(()=>window.policy.cancel=true);
 for(const [action,args] of [['move',['branch',700,300]],['connect',['start','end']]]){const result=await act(action,args);assert.equal(result.steps[0].result,false)}
 assert.equal(await page.evaluate(()=>JSON.stringify(window.graph)),beforeCancel);
 log('HOST VETO: canceled agent movement and connection returned false and left graph unchanged.');
 await root.focus();for(let i=0;i<15;i++)await page.keyboard.press('+');
 const zoom=()=>root.locator('.ts-canvas__world').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);
 assert.equal(await zoom(),2);for(let i=0;i<25;i++)await page.keyboard.press('-');assert.equal(await zoom(),0.5);
 log('ZOOM BOUNDARIES: repeated + clamped at 2.0; repeated - clamped at 0.5.');
 await page.keyboard.press('0');
 await page.screenshot({path:`${evidence}/canvas-host-agent.png`,fullPage:true});
 await writeFile(`${evidence}/canvas-host-state.json`,JSON.stringify(await page.evaluate(()=>({graph:window.graph,calls:window.calls,snapshot:window.agent.snapshot()})),null,2));
} finally {
 await writeFile(`${evidence}/canvas-host-transcript.txt`,transcript.join('\n'));
 await browser.close();
}
