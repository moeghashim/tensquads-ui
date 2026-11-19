import { createServer } from '../apps/preview/node_modules/vite/dist/node/index.js';
import react from '../apps/preview/node_modules/@vitejs/plugin-react/dist/index.js';
import { readOpenUIRequest } from '../packages/ui/dist/openui/server/request.js';
import { resolve } from 'node:path';
const records=[]; let attempts=0;
const api=async(req,res)=>{
 if(req.url==='/records'){res.setHeader('content-type','application/json');res.end(JSON.stringify(records));return;}
 let raw='';for await(const chunk of req)raw+=chunk;
 try{
 const normalized=await readOpenUIRequest(new Request('http://localhost/chat',{method:'POST',body:raw}));
 const body=JSON.parse(raw); records.push({raw:body,normalized});
 if(req.url==='/validate'){res.setHeader('content-type','application/json');res.end(JSON.stringify(normalized));return;}
 const mode=new URL('http://localhost'+req.url).searchParams.get('mode');
 if(mode==='error'&&attempts++===0){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({error:'too_many_turns'}));return;}
 res.writeHead(200,{'content-type':'text/plain; charset=utf-8'});
 if(mode==='slow'){res.write('First streamed fragment. ');const timer=setTimeout(()=>res.end('Final fragment.'),1500);res.on('close',()=>clearTimeout(timer));return;}
 const actions=body.turns.filter(t=>t.role==='action').length;
 res.end(actions===1?'Approval received.\n\n```openui\nroot = Button("Continue", "solid", "md", false, false, {type: "Continue", params: {stepId: "s2"}})\n```':'Next step received.');
 }catch(e){res.writeHead(e.status??500,{'content-type':'application/json'});res.end(JSON.stringify({error:e.code??e.message}));}
};
const server=await createServer({configFile:false,root:resolve('.local-chat-test'),plugins:[react(),{name:'test-api',configureServer(s){s.middlewares.use('/api',api)}}],resolve:{dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:[process.cwd()]}}});
await server.listen();console.log('Consumer ready http://127.0.0.1:5174');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await server.close();process.exit(0);});
