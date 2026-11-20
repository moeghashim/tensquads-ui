import {build,preview} from '../apps/preview/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '@playwright/test';
import {writeFile, mkdir, copyFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import * as schema from '@tensquads/ui/schemas';
const evidence='~/.no-mistakes/evidence/01M7VVY4DDX6H35G567A3ZX5H6';
const records=[];
const record=(name,output)=>records.push({name,output});
const at='2026-11-20T12:00:00.000Z';
const approval={seq:1,at,type:'approval_request',approvalId:'a',action:'refund',content:'Refund',contentHash:'sha256:test',rule:null,limit:null,amount:42000000,bot:'support-bot',taskId:'t'};
assert.deepEqual(schema.PlatformOwnerMessageSchema.parse(approval),approval);
for(const amount of [null,0,42000000]) assert.equal(schema.PlatformOwnerMessageSchema.safeParse({...approval,amount}).success,true);
const invalid=[];
for(const field of ['amount','bot','taskId']) {const input={...approval};delete input[field];assert.equal(schema.PlatformOwnerMessageSchema.safeParse(input).success,false);invalid.push(`missing ${field}`);}
for(const amount of [-1,1.5]) {assert.equal(schema.PlatformOwnerMessageSchema.safeParse({...approval,amount}).success,false);invalid.push(`amount ${amount}`);}
for(const input of [{...approval,extra:true},{seq:2,at,type:'approval_decided',approvalId:'a',decision:'maybe'},{seq:2,at,type:'question_answered',questionId:'q',text:'invented'}]){assert.equal(schema.PlatformOwnerMessageSchema.safeParse(input).success,false);invalid.push(input);}
for(const input of [{seq:2,at,type:'approval_decided',approvalId:'a',decision:'reject'},{seq:3,at,type:'question_answered',questionId:'q'}])assert.deepEqual(schema.PlatformOwnerMessageSchema.parse(input),input);
assert.deepEqual(schema.PLATFORM_OWNER_MESSAGE_TYPES,['reply','question','approval_request','result','status','action_not_confirmed','approval_decided','question_answered']);
assert.deepEqual(schema.approvalDecisionCommand(approval,'reject'),{type:'ApprovalDecision',approvalId:'a',contentHash:'sha256:test',decision:'reject'});
record('Public SDK schema contract (oracle: task 001 and platform b09e197)',{accepted:approval,rejected:invalid,command:schema.approvalDecisionCommand(approval,'reject')});
let server,browser;
try {
 await build({configFile:false,root:resolve('.local-validation'),logLevel:'warn',build:{outDir:'dist',emptyOutDir:true}});
 server=await preview({configFile:false,root:resolve('.local-validation'),logLevel:'warn',preview:{host:'127.0.0.1',port:5174,strictPort:true}});
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1000,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5174');
 await expect(page.locator('#conversation .ts-approval-card__outcome')).toHaveText('Declined');
 for(const button of await page.locator('#conversation button').all()){await expect(button).toBeDisabled();await button.evaluate(el=>el.click());}
 await expect(page.locator('#commands')).toHaveText('[]');
 await expect(page.locator('#conversation .ts-owner-message__options button[aria-pressed="true"]')).toHaveCount(0);
 assert.equal(JSON.parse(await page.locator('#pending').textContent()).questionId,'open');
 assert.deepEqual(JSON.parse(await page.locator('#decisions').textContent()),{'disposable-approval':'reject'});
 await expect(page.locator('#unknown')).toContainText('future_message');
 const statuses=page.locator('#conversation [role="status"]');
 await expect(statuses.first().getByRole('img',{includeHidden:true})).toHaveCount(1);
 await expect(statuses.nth(1).getByRole('img',{includeHidden:true})).toHaveCount(0);
 await expect(page.locator('#null-amount .ts-approval-card__agent')).toHaveCount(0);
 await expect(page.locator('#null-amount .ts-approval-card__amount')).toHaveCount(0);
 await expect(page.locator('#null-amount')).not.toContainText('petra');
 await expect(page.locator('#null-amount .ts-approval-card__task')).toHaveText('Task: disposable-task');
 await expect(page.locator('#zero-amount .ts-approval-card__agent')).toHaveText('Rio');
 await expect(page.locator('#zero-amount .ts-approval-card__limit')).toHaveText('Requested $0.00Refund policyLimit $20.00');
 const amountStyle=await page.locator('#zero-amount .ts-approval-card__amount').evaluate(el=>{const s=getComputedStyle(el);return {weight:s.fontWeight,figures:s.fontVariantNumeric,color:s.color,token:getComputedStyle(el).getPropertyValue('--color-text').trim()}});
 assert.equal(amountStyle.weight,'600');assert.equal(amountStyle.figures,'tabular-nums');
 await expect(page.locator('#minimal-openui .ts-approval-card')).toHaveCount(1);
 await expect(page.locator('#minimal-openui .ts-approval-card__meta')).toHaveCount(0);
 await expect(page.locator('#minimal-openui .ts-approval-card__limit')).toHaveCount(0);
 await page.locator('#minimal-openui').getByRole('button',{name:'Decline',exact:true}).click();
 await expect(page.locator('#minimal-openui .ts-approval-card__outcome')).toHaveText('Declined');
 const commands=JSON.parse(await page.locator('#commands').textContent());
 assert.deepEqual(commands[0].params,{approvalId:'minimal',contentHash:'hash',decision:'reject'});
 assert.equal(commands[0].type,'ApprovalDecision');
 await expect(page.locator('#conversation strong')).toHaveCount(1); // amount only; markdown remains plain
 for(const url of ['https://example.com/order/42','https://example.com/result','https://example.com/evidence']) await expect(page.locator(`#conversation a[href="${url}"]`)).toHaveCount(1);
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:`${evidence}/adversarial-consumer.png`,fullPage:true});
 record('Browser consumer: out-of-order seq overrides stale host approval; answered questions stay unselected and inert',{decision:await page.locator('#decisions').textContent(),pendingQuestion:await page.locator('#pending').textContent(),commands,unknown:await page.locator('#unknown').textContent()});
 record('Browser consumer: explicit bot mapping, null/zero amounts, labels, plain URLs and minimal OpenUI',{amountStyle,statusImages:[1,0],zeroAmount:await page.locator('#zero-amount .ts-approval-card__limit').textContent(),minimalOpenUICommand:commands[0]});
 assert.deepEqual(errors,[]);
} finally {if(browser)await browser.close();if(server)await new Promise((resolve,reject)=>server.httpServer.close(err=>err?reject(err):resolve()));await writeFile(`${evidence}/consumer-results.json`,JSON.stringify(records,null,2));}
await mkdir(`${evidence}/screenshots`,{recursive:true});
for(const file of await readdir('test-results/screenshots'))await copyFile(`test-results/screenshots/${file}`,`${evidence}/screenshots/${file}`);
console.log(JSON.stringify(records,null,2));
