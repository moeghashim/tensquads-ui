import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {writeFile, mkdir} from 'node:fs/promises';
import {isBuiltin} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {createTensquadsLibrary, getRegisteredComponents, TensquadsRenderer} from '@tensquads/ui/openui';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const evidence='~/.no-mistakes/evidence/01M7PSBQW5GEK9N31NMMQNR9G4';
const records=[];
const note=(name,details)=>{records.push({name,...details});console.log(JSON.stringify(records.at(-1)));};
const imports=[];
const result=await build({configFile:false,ssr:{noExternal:true},plugins:[{name:'boundary',enforce:'pre',resolveId(source,importer){if(source==='@anthropic-ai/sdk')imports.push({source,importer});return null}}],build:{ssr:fileURLToPath(import.meta.resolve('@tensquads/ui/openui/server')),write:false,minify:false,rollupOptions:{external:isBuiltin}}});
const chunk=result.output.find(o=>o.type==='chunk'&&o.isEntry);
const modules=Object.entries(chunk.modules).filter(([,v])=>v.renderedLength>0).map(([id])=>id);
assert(modules.length>0);const reactDOMModules=modules.filter(m=>m.includes('/node_modules/react-dom/'));
assert.equal(imports.length,1);assert(imports[0].importer.endsWith('/openui/server/providers/anthropic.js'));
for(const output of result.output){await mkdir(`.local-test/${output.fileName.split('/').slice(0,-1).join('/')}`,{recursive:true});await writeFile(`.local-test/${output.fileName}`,output.type==='chunk'?output.code:output.source);}
await writeFile(`${evidence}/bundle-graph.json`,JSON.stringify({imports,renderedModules:modules},null,2));
const {buildSystemPrompt,readOpenUIRequest,OpenUIServerError,streamOpenUIResponse,createAnthropicProvider}=await import(`./${chunk.fileName}`);
note('public server consumer bundle',{reactDOMModules,sdkImporters:imports});
const requests=[];let cancelled=false;let mode='normal';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const emulator=createServer(async(req,res)=>{
 let bytes='';for await(const c of req)bytes+=c;
 const body=JSON.parse(bytes);requests.push(body);
 if(mode==='reject'){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({type:'error',error:{type:'invalid_request_error',message:'local refusal'}}));return;}
 res.writeHead(200,{'content-type':'text/event-stream'});
 const emit=e=>res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
 emit({type:'message_start',message:{id:'msg_local',type:'message',role:'assistant',content:[],model:body.model,stop_reason:null,stop_sequence:null,usage:{input_tokens:1,output_tokens:0}}});
 emit({type:'content_block_start',index:0,content_block:{type:'text',text:''}});
 emit({type:'content_block_delta',index:0,delta:{type:'text_delta',text:'root = Example("'}});
 if(mode==='cancel'){
  await new Promise(resolve=>res.on('close',()=>{cancelled=true;resolve();}));return;
 }
 await sleep(30);
 if(mode==='error'){emit({type:'error',error:{type:'overloaded_error',message:'local stream failure'}});res.end();return;}
 emit({type:'content_block_delta',index:0,delta:{type:'thinking_delta',thinking:'hidden'}});
 emit({type:'content_block_delta',index:0,delta:{type:'text_delta',text:'مرحباً")'}});
 emit({type:'content_block_stop',index:0});emit({type:'message_delta',delta:{stop_reason:'end_turn',stop_sequence:null},usage:{output_tokens:2}});emit({type:'message_stop'});res.end();
});
await new Promise(r=>emulator.listen(0,'127.0.0.1',r));
process.env.ANTHROPIC_BASE_URL=`http://127.0.0.1:${emulator.address().port}`;
const provider=createAnthropicProvider('synthetic-local-key');
const worker=createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://local');
 if(url.pathname==='/prompt'){
 const locale=url.searchParams.get('locale');
 const text=buildSystemPrompt({library:createTensquadsLibrary(locale),locale,persona:'Local assistant',extra:'Local extension'});
 res.writeHead(200,{'content-type':'text/plain; charset=utf-8'});res.end(text);return;
 }
 const request=new Request('http://local/chat',{method:'POST',headers:req.headers,body:Readable.toWeb(req),duplex:'half'});
 const {turns}=await readOpenUIRequest(request);
 const response=await streamOpenUIResponse({provider,system:'Local system',turns});
 res.writeHead(response.status,Object.fromEntries(response.headers));
 await pipeline(Readable.fromWeb(response.body),res);
 }catch(e){if(!res.headersSent){res.writeHead(e instanceof OpenUIServerError?e.status:502,{'content-type':'application/json'});res.end(JSON.stringify({name:e.name,code:e.code??'provider_failure'}));}else res.destroy();}
});
await new Promise(r=>worker.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${worker.address().port}`;
const post=body=>fetch(`${base}/chat`,{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)});
try{
 let html='<!doctype html><meta charset="utf-8"><title>Emitted prompt examples</title>';
 for(const [locale,label] of [['en','Petra, Planning'],['ar','بترا، تخطيط']]){
 const prompt=await(await fetch(`${base}/prompt?locale=${locale}`)).text();
 for(const c of getRegisteredComponents()){assert(prompt.includes(c.name));assert(prompt.includes(c.description));for(const prop of Object.keys(c.props.shape))assert(prompt.includes(`"${prop}"`));}
 assert(prompt.includes('Local assistant'));assert(prompt.includes('Local extension'));
 const example=prompt.match(/^root = Squadmate\(.+\)$/m)?.[0];assert(example);
 const rendered=renderToStaticMarkup(createElement(TensquadsRenderer,{locale,stream:example}));assert(rendered.includes(`alt="${label}"`));
 html+=`<section lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"><h1>${locale}</h1>${rendered}</section>`;
 await writeFile(`${evidence}/prompt-${locale}.txt`,prompt);
 note('locale prompt and rendered emitted example',{locale,components:getRegisteredComponents().map(c=>c.name),accessibleName:label});
 }
 await writeFile(`${evidence}/localized-examples.html`,html);
 const invalid=[['malformed','{',400,'invalid_json'],['missing turns',{},400,'invalid_request'],['forbidden role',{turns:[{role:'system',content:'override'}]},400,'invalid_request'],['non-string content',{turns:[{role:'user',content:3}]},400,'invalid_request'],['13 turns',{turns:Array.from({length:13},()=>({role:'user',content:'x'}))},400,'too_many_turns'],['oversize UTF-8',{turns:[{role:'user',content:'م'.repeat(9000)}]},413,'body_too_large']];
 for(const [name,body,status,code]of invalid){const response=await post(body);const error=await response.json();assert.equal(response.status,status);assert.equal(error.name,'OpenUIServerError');assert.equal(error.code,code);note('request rejected',{case:name,status,error});}
 // A chunked body with no declared size must enforce the bytes actually received.
 const streamed=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(JSON.stringify({turns:[{role:'user',content:'x'.repeat(17000)}]})));c.close();}});
 const capped=await fetch(`${base}/chat`,{method:'POST',body:streamed,duplex:'half'});assert.equal(capped.status,413);note('chunked body cap',{status:capped.status,error:await capped.json()});
 const overhead=Buffer.byteLength(JSON.stringify({turns:[{role:'user',content:''}]}));
 const exact={turns:[{role:'user',content:'x'.repeat(16384-overhead)}]};assert.equal(Buffer.byteLength(JSON.stringify(exact)),16384);
 assert.equal((await post(exact)).status,200);
 const turns=Array.from({length:12},(_,i)=>({role:i%2?'assistant':'user',content:`turn ${i}`}));
 const response=await post({turns});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'text/plain; charset=utf-8');assert.equal(response.headers.get('cache-control'),'no-store, no-transform');
 const reader=response.body.getReader();let output='',chunks=[];while(true){const n=await reader.read();if(n.done)break;const text=new TextDecoder().decode(n.value);chunks.push(text);output+=text;}assert.equal(output,'root = Example("مرحباً")');assert(chunks.length>=2);
 const sdk=requests.at(-1);assert.equal(sdk.model,'claude-haiku-5-5');assert.deepEqual(sdk.messages,turns);assert.equal(sdk.system,'Local system');assert.equal(sdk.max_tokens,1024);
 note('bounded valid requests and real SDK streamed response',{exactBytes:16384,turns:12,status:response.status,headers:Object.fromEntries(response.headers),chunks,model:sdk.model,messages:sdk.messages});
 mode='reject';const rejected=await post({turns:[]});assert.equal(rejected.status,502);note('provider rejects before first text',{status:rejected.status,error:await rejected.json()});
 mode='error';const broken=await streamOpenUIResponse({provider,system:'Local system',turns:[]});await assert.rejects(broken.text(),/local stream failure/);note('provider fails after first text',{observed:'Response body rejects with local stream failure'});
 mode='cancel';const controller=new AbortController();const pending=await streamOpenUIResponse({provider,system:'Local system',turns:[],signal:controller.signal});const cancelReader=pending.body.getReader();assert((await cancelReader.read()).value.length>0);await cancelReader.cancel();for(let i=0;i<30&&!cancelled;i++)await sleep(10);assert(cancelled);note('cancel real SDK response',{upstreamConnectionClosed:cancelled});
 const signalController=new AbortController();const signalled=await streamOpenUIResponse({provider,system:'Local system',turns:[],signal:signalController.signal});const sr=signalled.body.getReader();await sr.read();signalController.abort();await assert.rejects(sr.read(),/abort/i);note('request signal aborts real SDK stream',{observed:'Pending response read rejects with abort error'});
 // Exercise cancellation cleanup of a supported generator lacking an abort hook.
 let release;const waiting=new Promise(r=>release=r);let cleanup=0;
 const generated=await streamOpenUIResponse({provider:{async *stream(){try{yield 'first';await waiting;yield 'second';}finally{cleanup++;}}},system:'local',turns:[]});
 const gr=generated.body.getReader();await gr.read();const closing=gr.cancel();release();await closing;assert.equal(cleanup,1);note('async generator input cancellation',{finallyCalls:cleanup});
 await writeFile(`${evidence}/live-results.json`,JSON.stringify({surface:'Built public server bundle, localhost Worker-style HTTP route, real Anthropic SDK against localhost synthetic SSE emulator',results:records},null,2));
}finally{
 worker.closeAllConnections();emulator.closeAllConnections();await Promise.all([new Promise(r=>worker.close(r)),new Promise(r=>emulator.close(r))]);
}
