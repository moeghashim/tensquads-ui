import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = resolve(process.argv[2]);
const local = pathToFileURL(root + '/').href;
registerHooks({ resolve(specifier, context, nextResolve) {
  const result = nextResolve(specifier, context);
  if (result.url.startsWith('file:') && !result.url.startsWith(local)) {
    throw Object.assign(new Error(`Consumer isolation rejected ancestor dependency: ${specifier}`), {code:'ERR_MODULE_NOT_FOUND'});
  }
  return result;
}});
const pkg = JSON.parse(readFileSync(root+'/node_modules/@tensquads/ui/package.json'));
console.log('Consumer:', root);
console.log('Installed SDK peer contract:', JSON.stringify({peer:pkg.peerDependencies['@anthropic-ai/sdk'],optional:pkg.peerDependenciesMeta['@anthropic-ai/sdk'].optional}));
assert.equal(pkg.peerDependencies['@anthropic-ai/sdk'],'1.10.0');
assert.equal(pkg.peerDependenciesMeta['@anthropic-ai/sdk'].optional,true);
assert.equal(pkg.dependencies['@anthropic-ai/sdk'],undefined);
const consumerImport = specifier => import(specifier);
if (process.argv[3] === 'absent') {
  const tree=JSON.parse(readFileSync(root+'/sdk-tree.json'));
  const visit=n=>{for(const [name,dep] of Object.entries(n.dependencies??{})){assert.notEqual(name,'@anthropic-ai/sdk');visit(dep);}};
  visit(tree);
  for(const key of Object.keys(pkg.exports)) {
    if(key.endsWith('.css') || key === './openui/server/anthropic') continue;
    const mod=await consumerImport('@tensquads/ui'+key.slice(1));
    console.log('Loaded SDK-free public subpath:',key,Object.keys(mod).length,'exports');
  }
  const server=await consumerImport('@tensquads/ui/openui/server');
  assert.equal(server.createAnthropicProvider,undefined);
  assert.equal(server.DEFAULT_ANTHROPIC_MODEL,undefined);
  await assert.rejects(consumerImport('@tensquads/ui/openui/server/anthropic'),{code:'ERR_MODULE_NOT_FOUND'});
  console.log('Anthropic subpath cannot load without an explicit SDK install.');
  const input={turns:[{role:'user',content:'Show local status'}]};
  const {turns}=await server.readOpenUIRequest(new Request('http://localhost/openui',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}));
  const provider={async *stream({turns}) {assert.deepEqual(turns,input.turns); yield 'root = Badge('; yield '"Ready", "success")';}};
  const response=await server.streamOpenUIResponse({provider,system:'Local custom provider',turns});
  assert.equal(await response.text(),'root = Badge("Ready", "success")');
  console.log('Provider-neutral request → custom provider → HTTP 200 text/plain response: root = Badge("Ready", "success")');
} else {
  const {createServer}=await import('node:http');
  const requests=[];
  const endpoint=createServer(async(req,res)=>{try {
    let body='';for await(const chunk of req)body+=chunk;
    requests.push({method:req.method,url:req.url,body:JSON.parse(body)});
    res.writeHead(200,{'content-type':'text/event-stream'});
    const send=(type,data)=>res.write(`event: ${type}\ndata: ${JSON.stringify({type,...data})}\n\n`);
    send('message_start',{message:{id:'msg_local',type:'message',role:'assistant',model:'claude-haiku-5-5',content:[],stop_reason:null,stop_sequence:null,usage:{input_tokens:4,output_tokens:0}}});
    send('content_block_start',{index:0,content_block:{type:'text',text:''}});
    send('content_block_delta',{index:0,delta:{type:'text_delta',text:'root = Badge("Local SDK stream", "success")'}});
    send('content_block_stop',{index:0});
    send('message_delta',{delta:{stop_reason:'end_turn',stop_sequence:null},usage:{output_tokens:12}});
    send('message_stop',{});res.end();
  } catch(e){res.destroy(e);}});
  await new Promise(r=>endpoint.listen(0,'127.0.0.1',r));
  process.env.ANTHROPIC_BASE_URL=`http://127.0.0.1:${endpoint.address().port}`;
  try {
    const server=await consumerImport('@tensquads/ui/openui/server');
    const anthropic=await consumerImport('@tensquads/ui/openui/server/anthropic');
    assert.deepEqual(Object.keys(anthropic).sort(),['DEFAULT_ANTHROPIC_MODEL','createAnthropicProvider']);
    const provider=anthropic.createAnthropicProvider('synthetic-local-key');
    const response=await server.streamOpenUIResponse({provider,system:'Local integration smoke',turns:[{role:'user',content:'Show local SDK status'}]});
    const output=await response.text();
    assert.equal(output,'root = Badge("Local SDK stream", "success")');
    assert.equal(requests.length,1);
    assert.equal(requests[0].url,'/v1/messages');
    assert.equal(requests[0].body.model,'claude-haiku-5-5');
    assert.equal(requests[0].body.stream,true);
    assert.deepEqual(requests[0].body.messages,[{role:'user',content:'Show local SDK status'}]);
    console.log('Real SDK 1.10.0 → localhost Anthropic SSE emulator request:',JSON.stringify(requests[0]));
    console.log('New public subpath → provider → HTTP response:',response.status,output);
  } finally {await new Promise(r=>endpoint.close(r));}
}
