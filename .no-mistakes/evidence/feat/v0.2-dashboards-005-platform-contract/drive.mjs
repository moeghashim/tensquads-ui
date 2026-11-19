import {chromium, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile,copyFile,readdir} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7T4HT51KWH4EAG1QJD74QX6';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1000,height:900}});
const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
const request={approvalId:'approval-local-17',action:'refund',content:'Refund synthetic order 17',contentHash:'sha256:synthetic-17',rule:'refund_limit',limit:20000000};
const at='2026-11-19T12:00:00.000Z';
async function fresh(){await page.goto('http://127.0.0.1:5181');await page.waitForFunction(()=>!!window.consumer);}
async function render(kind,props){await page.evaluate(([k,p])=>window.consumer.render(k,p),[kind,props]);}
async function mode(m){await page.evaluate(m=>window.consumer.mode=m,m);}
async function events(){return page.evaluate(()=>window.consumer.events);}
async function shot(name){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true});}
async function scenario(name,fn){try{await fresh();const detail=await fn();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:e.stack});await shot('failure-'+results.length);}}
try{
await scenario('React approval exact commands, acceptance, veto, pending, restoration and copy overrides',async()=>{
 await render('approval',{request,bot:'petra',taskId:'task_17',actionLabels:{refund:'Refund label'}});
 await expect(page.getByText('Limit $20.00')).toBeVisible();
 await expect(page.getByText('Task: task_17')).toBeVisible();
 await page.getByRole('button',{name:'Approve',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByText('Approved',{exact:true})).toBeVisible();
 assert.deepEqual(await events(),[{type:'ApprovalDecision',approvalId:'approval-local-17',contentHash:'sha256:synthetic-17',decision:'approve'}]);
 await expect(page.getByRole('button',{name:'Decline',exact:true})).toBeDisabled();
 await expect(page.locator('.ts-approval-card__outcome svg')).toBeVisible();await shot('react-approved');
 await fresh();await render('approval',{request});await mode('pending');await page.getByRole('button',{name:'Decline',exact:true}).click();
 await expect(page.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();
 await page.evaluate(()=>window.consumer.resolve(false));
 await expect(page.getByRole('button',{name:'Approve',exact:true})).toBeEnabled();
 await expect(page.locator('.ts-approval-card__outcome')).toHaveCount(0);
 await mode('throw');await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('button',{name:'Decline',exact:true})).toBeEnabled();
 await mode('accept');await page.getByRole('button',{name:'Decline',exact:true}).click();await expect(page.getByText('Declined',{exact:true})).toBeVisible();
 assert.deepEqual((await events()).at(-1),{type:'ApprovalDecision',approvalId:'approval-local-17',contentHash:'sha256:synthetic-17',decision:'reject'});
 await fresh();await render('approval',{request,decision:'reject',labels:{approve:'Authorize',decline:'Refuse',declined:'Refused',limit:'Cap'}});
 await expect(page.getByText('Refused',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Authorize'})).toBeDisabled();await expect(page.getByText('Cap $20.00')).toBeVisible();
 return {acceptedCommand:{type:'ApprovalDecision',approvalId:'approval-local-17',contentHash:'sha256:synthetic-17',decision:'approve'},pendingVeto:'controls re-enabled with no outcome',rejectedCallback:'retry possible',restored:'Refused, controls disabled'};
});
await scenario('Owner sequence, question lock, approval isolation, removal stability, unknown and free-text routing',async()=>{
 const q={seq:2,at,type:'question',questionId:'question-local-17',text:'Choose priority',options:['Standard','Urgent']};
 const a={...request,seq:3,at,type:'approval_request'};
 const b={...a,seq:4,approvalId:'approval-B',content:'Independent pending approval B'};
 const reply={seq:1,at,type:'reply',text:'First message'};
 const free={seq:5,at,type:'question',questionId:'free-5',text:'Order number?',options:[]};
 const unknown={seq:6,at,type:'future',payload:'hidden'};
 await render('owner',{messages:[unknown,b,free,a,q,reply],approvalDecisions:{'approval-B':'reject'}});
 await expect(page.locator('.ts-owner-messages > *')).toHaveCount(5);
 assert.deepEqual(await page.locator('.ts-owner-messages > *').allTextContents().then(t=>t.map(s=>s.includes('First message')?'reply':s.includes('Choose priority')?'question':s.includes('Independent pending')?'B':s.includes('Refund synthetic')?'A':'free')),['reply','question','A','B','free']);
 const cards=page.locator('.ts-approval-card');await expect(cards.nth(0).getByRole('button',{name:'Approve',exact:true})).toBeEnabled();await expect(cards.nth(1).getByRole('button',{name:'Approve',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Urgent',exact:true}).click();await cards.nth(0).getByRole('button',{name:'Approve',exact:true}).click();await expect(cards.nth(0).getByText('Approved',{exact:true})).toBeVisible();
 await render('owner',{messages:[free,b,a,q],approvalDecisions:{'approval-B':'reject'}});
 await expect(page.getByRole('button',{name:'Standard',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Urgent',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.ts-approval-card').nth(0).getByRole('button',{name:'Decline',exact:true})).toBeDisabled();
 assert.deepEqual(await events(),[{type:'OwnerAnswer',questionId:'question-local-17',text:'Urgent'},{type:'ApprovalDecision',approvalId:'approval-local-17',contentHash:'sha256:synthetic-17',decision:'approve'}]);
 const routing=await page.evaluate(({free,q,unknown})=>({pending:window.consumer.pendingQuestion([free,q,{...free,seq:8,questionId:'newest'},unknown]),unknown:window.consumer.unknown}),{free,q,unknown});
 assert.equal(routing.pending.questionId,'newest');assert.deepEqual(routing.unknown,[unknown]);await shot('owner-locks-after-removal');
 return {commands:await events(),pendingQuestion:routing.pending,unknownReported:routing.unknown,order:['reply','question','A','B','free'],locksRetained:true};
});
await scenario('Owner plain text preserves markup and balanced URL destinations in English and Arabic',async()=>{
 const literal='**literal** <img src=x onerror=alert(1)>\n```openui\nroot = Button("Injected")\n```\nSee (https://en.wikipedia.org/wiki/Refund_(finance)). Also https://example.com/order/42.';
 for(const locale of ['en','ar']){
 await render('owner',{locale,messages:[{seq:1,at,type:'reply',text:literal},{seq:2,at,type:'result',taskId:'t',summary:literal,evidence:[literal]}]});
 await expect(page.locator('.ts-chat-reply__plain')).toHaveCount(3);await expect(page.locator('.ts-owner-messages strong, .ts-owner-messages img, .ts-owner-messages button')).toHaveCount(0);
 assert.deepEqual(await page.locator('.ts-owner-messages a').evaluateAll(as=>as.map(a=>a.getAttribute('href'))),Array(3).fill(['https://en.wikipedia.org/wiki/Refund_(finance)','https://example.com/order/42']).flat());
 for(const text of await page.locator('.ts-chat-reply__plain').allTextContents())assert.equal(text,literal);
 await shot('plaintext-'+locale);
 }
 return {renderedLiteral:literal,links:['https://en.wikipedia.org/wiki/Refund_(finance)','https://example.com/order/42'],surfaces:['reply','summary','evidence'],locales:['en','ar']};
});
await scenario('Streamed ApprovalDecision acceptance, host veto, pending guard and ChatReply outcomes',async()=>{
 const stream='root = ApprovalCard("stream-17", "refund", "Streamed synthetic refund", "sha256:stream-17", "refund_limit", 20000000, {refund: "Refund"})';
 await render('stream',{stream,isStreaming:true});await expect(page.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();assert.deepEqual(await events(),[]);
 await render('stream',{stream,isStreaming:false});await mode('veto');await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('button',{name:'Decline',exact:true})).toBeEnabled();await expect(page.locator('.ts-approval-card__outcome')).toHaveCount(0);
 await mode('pending');await page.getByRole('button',{name:'Decline',exact:true}).click();await expect(page.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();await page.evaluate(()=>window.consumer.resolve(true));
 await expect(page.getByText('Declined',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();
 const emitted=await events();assert.deepEqual(emitted.map(e=>({type:e.type,params:e.params})),[{type:'ApprovalDecision',params:{approvalId:'stream-17',contentHash:'sha256:stream-17',decision:'approve'}},{type:'ApprovalDecision',params:{approvalId:'stream-17',contentHash:'sha256:stream-17',decision:'reject'}}]);
 await expect(page.locator('.ts-approval-card__outcome svg')).toBeVisible();await shot('stream-declined');
 await fresh();await render('chat',{reply:'Before\n```openui\n'+stream+'\n```\nAfter'});await mode('veto');await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('button',{name:'Decline',exact:true})).toBeEnabled();await mode('accept');await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByText('Approved',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Decline',exact:true})).toBeDisabled();await shot('chat-approved');
 return {streamEvents:emitted,streaming:'disabled',veto:'no outcome, retry allowed',pending:'disabled until host resolves',chat:'veto then accepted Approved with both controls disabled'};
});
await scenario('Public platform schemas, command builders, retry metadata and money formatting run in browser consumer',async()=>{
 const output=await page.evaluate(({at,request})=>{
 const s=window.consumer.schemas;
 const bodies=[s.ownerMessageCommand({messageId:'m17',channel:'web',text:'Synthetic message'}),s.ownerAnswerCommand({questionId:'q17',text:'Urgent'}),s.approvalDecisionCommand(request,'reject'),s.cancelTaskCommand({taskId:'t17'})];
 const meta={commandId:'retry-stable-17',at};
 const commands=bodies.map(b=>s.withCommandMeta(b,meta));
 const messageInputs=[{seq:1,at,type:'reply',text:'Reply'},{seq:2,at,type:'question',questionId:'q',text:'Question',options:[]},{seq:3,at,type:'approval_request',...request},{seq:4,at,type:'result',taskId:'t',summary:'Done',evidence:[]},{seq:5,at,type:'status',taskId:'t',bot:'external',attempt:1,step:'Checking',since:at},{seq:6,at,type:'action_not_confirmed',taskId:'t',actionId:'a',what:'Unconfirmed'}];
 return {bodies,commands,retry:s.withCommandMeta(bodies[2],meta),validMessages:messageInputs.map(m=>s.PlatformOwnerMessageSchema.safeParse(m).success),extraMessages:messageInputs.map(m=>s.PlatformOwnerMessageSchema.safeParse({...m,layout:'card'}).success),extraCommands:commands.map(c=>s.PlatformOwnerCommandSchema.safeParse({...c,account:'forbidden'}).success),badDecision:s.PlatformOwnerCommandSchema.safeParse({...commands[2],decision:'decline'}).success,badLimit:s.PlatformOwnerMessageSchema.safeParse({...messageInputs[2],limit:1.5}).success,money:[0,20000000,1234567,987654321000].map(n=>[s.formatMillionths(n,'en'),s.formatMillionths(n,'ar')])};
 },{at,request});
 assert.deepEqual(output.bodies,[{type:'OwnerMessage',messageId:'m17',channel:'web',text:'Synthetic message'},{type:'OwnerAnswer',questionId:'q17',text:'Urgent'},{type:'ApprovalDecision',approvalId:'approval-local-17',contentHash:'sha256:synthetic-17',decision:'reject'},{type:'CancelTask',taskId:'t17'}]);
 assert.deepEqual(output.retry,output.commands[2]);assert.deepEqual(output.validMessages,Array(6).fill(true));assert.deepEqual(output.extraMessages,Array(6).fill(false));assert.deepEqual(output.extraCommands,Array(4).fill(false));assert.equal(output.badDecision,false);assert.equal(output.badLimit,false);
 assert.deepEqual(output.money.map(m=>m[0]),['$0.00','$20.00','$1.23','$987,654.32']);assert.deepEqual(output.money.map(m=>m[1]),['‏٠٫٠٠ US$','‏٢٠٫٠٠ US$','‏١٫٢٣ US$','‏٩٨٧٬٦٥٤٫٣٢ US$']);
 return output;
});
}finally{await browser.close();await writeFile(`${evidence}/live-consumer-results.json`,JSON.stringify({oracle:'Task 005 and platform contracts c5eaad4d69b4529c9a57b00b1066b39e60243fa8; literal expected command bodies and destinations',results,browserErrors:errors},null,2));}
console.log(JSON.stringify({results,browserErrors:errors},null,2));
if(results.some(r=>r.result==='fail')||errors.length)process.exitCode=1;
