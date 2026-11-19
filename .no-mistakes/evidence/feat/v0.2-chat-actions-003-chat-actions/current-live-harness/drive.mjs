import {chromium,expect} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7RJQ5DGJK6YM6J8XXMFDVR5';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:900}});const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.locator('#state').innerText().then(JSON.parse);
const open=async()=>{await page.goto('http://127.0.0.1:5184/.live-chat-test/');await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();};
const shot=async name=>{await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true});};
async function scenario(name,fn){if(process.env.ONLY_SCENARIO && !name.startsWith(process.env.ONLY_SCENARIO))return;try{await open();const detail=await fn();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:String(e)});await shot('failure-'+results.length);}}
try{
await scenario('HTTP button action retains params, successive actions work, historical locks survive text',async()=>{
await page.getByRole('button',{name:'Approve plan',exact:true}).click();
await expect(page.getByRole('status')).toHaveText('Running');
await expect(page.getByRole('region',{name:'Conversation'})).toContainText('Received');
await shot('http-partial');
await expect(page.getByRole('status')).toHaveText('Idle');
expect((await state()).turns[0].action).toEqual({name:'Approve',source:'Button',values:{planId:'p1'},summary:'Approve plan'});
await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeDisabled();
await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');
expect((await state()).turns.filter(t=>t.role==='action').map(t=>t.action.name)).toEqual(['Approve','Continue']);
await page.getByRole('button',{name:'Send text',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');
await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Continue',exact:true}).first()).toBeDisabled();await expect(page.getByRole('button',{name:'Continue',exact:true}).last()).toBeEnabled();
const records=await page.request.get('http://127.0.0.1:5184/api/records').then(r=>r.json());expect(records[0].normalized.turns[0].content).toBe('The user chose the action “Approve plan” in the “Button” component. Action name: Approve. Values: {"planId":"p1"}');await shot('consecutive-actions');return {state:await state(),requests:records};
});
await scenario('Form Enter submission sends edited values and params then retains disabled fields',async()=>{
const form=page.getByTestId('form');await form.getByRole('textbox',{name:'Project name'}).fill('Local launch');await form.getByRole('textbox',{name:'Owner'}).fill('Sarah');await form.getByRole('textbox',{name:'Owner'}).press('Enter');await expect(page.getByRole('status')).toHaveText('Idle');
const s=await state();expect(s.turns[0].action.values).toEqual({planId:'p1',owner:'parameter owner',Project:{owner:{value:'Sarah',componentType:'Input'},project:{value:'Local launch',componentType:'Field'}}});expect(s.turns[0].action.source).toBe('Project');await expect(form.getByRole('textbox',{name:'Owner'})).toHaveValue('Sarah');await expect(form.getByRole('textbox',{name:'Owner'})).toBeDisabled();await expect(form.getByRole('button',{name:'Save project'})).toBeDisabled();await shot('form-http-values');return s;
});
await scenario('Host veto prevents a turn; pending approval reserves operation and reset invalidates it',async()=>{
await page.getByLabel('Approval').selectOption('veto');await page.getByRole('button',{name:'Approve plan',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');expect((await state()).turns).toEqual([]);await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeEnabled();
await page.getByLabel('Approval').selectOption('pending');await page.getByRole('button',{name:'Approve plan',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Running');await page.getByRole('button',{name:'Send text',exact:true}).click();await page.getByRole('button',{name:'Save project',exact:true}).click();expect((await state()).turns).toEqual([]);
await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByRole('button',{name:'Resolve approval',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');expect((await state()).turns).toEqual([]);expect((await state()).locked).toEqual([]);await shot('veto-reset');return await state();
});
await scenario('HTTP and iterator streaming publish partial reply and Stop retains it',async()=>{
const states=[];
for(const transport of ['normal','iterator']){await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByLabel('Transport').selectOption(transport);await page.getByRole('button',{name:'Send text',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Running');await expect(page.getByRole('region',{name:'Conversation'})).toContainText(transport==='normal'?'Received':'Iterator partial');await page.getByRole('button',{name:'Stop',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');const s=await state();expect(s.turns[1].content).toBe(transport==='normal'?'Received ':'Iterator partial');await page.waitForTimeout(1400);expect((await state()).turns).toEqual(s.turns);states.push(s);await shot('stop-'+transport);}return states;
});
await scenario('Server error blocks action and retry sends exactly one action with lock retained',async()=>{
await page.getByRole('button',{name:'Use error endpoint',exact:true}).click();await page.getByRole('button',{name:'Approve plan',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Blocked: body_too_large');await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeDisabled();await shot('blocked-error');await page.getByRole('button',{name:'Use success endpoint',exact:true}).click();await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Idle');const s=await state();expect(s.turns.filter(t=>t.role==='action')).toHaveLength(1);expect(s.turns[1].content).toContain('Received reply.');await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeDisabled();await shot('retry-success');return s;
});
await scenario('Local server accepts 16 KiB and twelve turns, rejects oversized and invalid actions, localizes stable values',async()=>{
const action={role:'action',action:{name:'Save',source:'Form',summary:'Save project',values:{z:2,a:1}}};const post=async body=>{const r=await page.request.post('http://127.0.0.1:5184/api/validate',{data:typeof body==='string'?body:JSON.stringify(body),headers:{'content-type':'application/json'}});return {status:r.status(),body:await r.json()}};const out={};out.twelve=await post({turns:Array(12).fill(action)});expect(out.twelve.status).toBe(200);out.thirteen=await post({turns:Array(13).fill(action)});expect(out.thirteen).toEqual({status:400,body:{error:'too_many_turns'}});
const body=JSON.stringify({turns:[action]});out.atLimit=await post(body+' '.repeat(16384-Buffer.byteLength(body)));expect(out.atLimit.status).toBe(200);out.overLimit=await post(body+' '.repeat(16385-Buffer.byteLength(body)));expect(out.overLimit).toEqual({status:413,body:{error:'body_too_large'}});out.invalid=await post({turns:[{...action,action:{...action.action,values:[]}}]});expect(out.invalid).toEqual({status:400,body:{error:'invalid_request'}});out.arabic=await post({locale:'ar',turns:[action]});expect(out.arabic.body.turns[0].content).toBe('اختار المستخدم الإجراء «Save project» في مكوّن «Form». اسم الإجراء: Save. القيم: {"a":1,"z":2}');expect(out.atLimit.body.turns[0].content).toContain('Values: {"a":1,"z":2}');return out;
});
}finally{await writeFile(`${evidence}/${process.env.ONLY_SCENARIO?'form-live-results':'live-chat-results'}.json`,JSON.stringify({results,errors},null,2));await browser.close();}
console.log(JSON.stringify({results,errors},null,2));process.exitCode=results.some(r=>r.result==='fail')?1:0;
