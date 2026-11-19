import { createServer } from '../apps/preview/node_modules/vite/dist/node/index.js';
import { writeFile } from 'node:fs/promises';
const records=[];
const vite=await createServer({configFile:false,root:process.cwd(),server:{host:'127.0.0.1',port:5184,strictPort:true},plugins:[{name:'api',configureServer(server){server.middlewares.use(async(req,res,next)=>{
if(!req.url.startsWith('/api/'))return next();
if(req.url==='/api/records'){res.setHeader('content-type','application/json');res.end(JSON.stringify(records));return;}
try{
const chunks=[]; for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks).toString();
const {readOpenUIRequest}=await vite.ssrLoadModule('/packages/ui/src/openui/server/request.ts');
const normalized=await readOpenUIRequest(new Request('http://localhost/api/chat',{method:'POST',body:raw}));
records.push({raw:JSON.parse(raw),normalized});
res.setHeader('content-type','application/json');
if(req.url==='/api/validate'){res.end(JSON.stringify(normalized));return;}
if(req.url.includes('error')){res.statusCode=413;res.end(JSON.stringify({error:'body_too_large'}));return;}
res.setHeader('content-type','text/plain');res.write('Received ');
const timer=setTimeout(()=>{res.end('reply.\n\n```openui\nroot = Button("Continue", "solid", "md", false, false, {type:"Continue", params:{stage:2}})\n```');},1200);
res.on('close',()=>{clearTimeout(timer);});
}catch(e){res.statusCode=e.status||500;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:e.code||e.message}));}
});}}]});
await vite.listen();console.log('Live harness http://127.0.0.1:5184/.live-chat-test/');
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{await vite.close();process.exit(0)});
