import {createServer} from 'node:http';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as sdk from '@tensquads/ui/schemas';
const at='2026-11-19T12:00:00.000Z';
const messages=[{seq:1,at,type:'reply',text:'Hello'},{seq:2,at,type:'question',questionId:'q2',text:'Priority?',options:[]},{seq:3,at,type:'approval_request',approvalId:'approval_C',action:'refund',content:'Refund order C',contentHash:'sha256:C',rule:null,limit:null},{seq:4,at,type:'result',taskId:'t1',summary:'Done',evidence:['https://example.com']},{seq:5,at,type:'status',taskId:'t1',bot:'petra',attempt:1,step:'Running',since:at},{seq:6,at,type:'action_not_confirmed',taskId:'t1',actionId:'a1',what:'Could not confirm'}];
const received=[];
const server=createServer(async(req,res)=>{if(req.url==='/v1/messages'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(messages));return;}let body='';for await(const chunk of req)body+=chunk;received.push(JSON.parse(body));res.end(JSON.stringify({accepted:true}));});
server.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
try{
 const incoming=await (await fetch(`${base}/v1/messages`)).json();
 for(const message of incoming){assert.deepEqual(sdk.PlatformOwnerMessageSchema.parse(message),message);assert.equal(sdk.PlatformOwnerMessageSchema.safeParse({...message,extra:true}).success,false);assert.equal(sdk.PlatformOwnerMessageSchema.safeParse({...message,type:'wrong'}).success,false);}
 assert.equal(sdk.PlatformOwnerMessageSchema.safeParse({...messages[2],limit:1.5}).success,false);
 assert.equal(sdk.PlatformOwnerMessageSchema.safeParse({...messages[2],limit:-1}).success,false);
 const bodies=[sdk.ownerMessageCommand({messageId:'m1',channel:'web',text:'Hello'}),sdk.ownerAnswerCommand({questionId:'q2',text:'Urgent'}),sdk.approvalDecisionCommand(incoming[2],'approve'),sdk.approvalDecisionCommand(incoming[2],'reject'),sdk.cancelTaskCommand({taskId:'t1'})];
 const expected=[{type:'OwnerMessage',messageId:'m1',channel:'web',text:'Hello'},{type:'OwnerAnswer',questionId:'q2',text:'Urgent'},{type:'ApprovalDecision',approvalId:'approval_C',contentHash:'sha256:C',decision:'approve'},{type:'ApprovalDecision',approvalId:'approval_C',contentHash:'sha256:C',decision:'reject'},{type:'CancelTask',taskId:'t1'}];
 assert.deepEqual(bodies,expected);
 for(const [i,body] of bodies.entries()){const full=sdk.withCommandMeta(body,{commandId:`c${i}`,at});assert.deepEqual(full,{...expected[i],commandId:`c${i}`,at});await fetch(`${base}/v1/commands`,{method:'POST',body:JSON.stringify(full)});}
 const retry=sdk.withCommandMeta(bodies[2],{commandId:'c2',at});await fetch(`${base}/v1/commands`,{method:'POST',body:JSON.stringify(retry)});assert.deepEqual(received[2],received[5]);
 for(const cmd of received){assert.equal(sdk.PlatformOwnerCommandSchema.safeParse({...cmd,type:'wrong'}).success,false);assert.equal(sdk.PlatformOwnerCommandSchema.safeParse({...cmd,extra:true}).success,false);}
 assert.throws(()=>sdk.withCommandMeta(bodies[0],{commandId:'',at}));assert.throws(()=>sdk.withCommandMeta(bodies[0],{commandId:'c1',at:'invalid'}));assert.throws(()=>sdk.approvalDecisionCommand(incoming[2],'decline'));
 const money=[0,1250000,20000000,1000000000].map(value=>({value,en:sdk.formatMillionths(value,'en'),ar:sdk.formatMillionths(value,'ar')}));assert.deepEqual(money.map(x=>x.en),['$0.00','$1.25','$20.00','$1,000.00']);assert.ok(money[2].ar.includes('٢٠٫٠٠'));
 const output={surface:'Built public @tensquads/ui/schemas SDK with synthetic localhost HTTP platform',oracle:'Task 005 and platform commit c5eaad4d69b4529c9a57b00b1066b39e60243fa8',incoming,received,money,guards:'Wrong literals, extra fields, fractional/negative limits, invalid metadata and decline literal rejected; identical retry metadata preserved.'};
 await writeFile('~/.no-mistakes/evidence/01M7T4HT51KWH4EAG1QJD74QX6/sdk-consumer.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
}finally{await new Promise(resolve=>server.close(resolve));}
