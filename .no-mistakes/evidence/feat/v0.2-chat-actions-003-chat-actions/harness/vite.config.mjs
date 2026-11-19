import { defineConfig } from '../apps/preview/node_modules/vite/dist/node/index.js';
import react from '../apps/preview/node_modules/@vitejs/plugin-react/dist/index.js';
import { readOpenUIRequest, OpenUIServerError } from '../packages/ui/src/openui/server/request.ts';
let records=[]; let mode='normal'; let attempts=0;
const button=(label,type)=>'```openui\nroot = Button('+JSON.stringify(label)+', "solid", "md", false, false, {type: '+JSON.stringify(type)+', params: {planId: "p1"}})\n```';
export default defineConfig({root: new URL('.',import.meta.url).pathname,plugins:[react(),{name:'local-endpoint',configureServer(server){server.middlewares.use(async(req,res,next)=>{
if(!req.url.startsWith('/api/')) return next();
let body=''; for await (const chunk of req) body+=chunk;
res.setHeader('content-type','application/json');
if(req.url==='/api/control'){mode=JSON.parse(body).mode;records=[];attempts=0;res.end('{}');return;}
if(req.url==='/api/records'){res.end(JSON.stringify(records));return;}
try{const normalized=await readOpenUIRequest(new Request('http://localhost/chat',{method:'POST',body}));records.push({raw:JSON.parse(body),normalized});
if(req.url==='/api/normalize'){res.end(JSON.stringify(normalized));return;}
if(mode==='error' && attempts++===0){res.statusCode=400;res.end(JSON.stringify({error:'too_many_turns'}));return;}
res.setHeader('content-type','text/plain');
const last=JSON.parse(body).turns.at(-1);
const reply=last.role==='action' ? last.action.name==='Approve' ? button('Continue','Continue') : 'Action complete.' : button('Approve plan','Approve');
if(mode==='slow'){res.write('Partial reply');const timer=setTimeout(()=>res.end(' completed.'),3000);res.on('close',()=>clearTimeout(timer));}
else if(mode==='broken'){res.write('Partial reply');const timer=setTimeout(()=>res.destroy(),500);res.on('close',()=>clearTimeout(timer));}
else res.end(mode==='error'?'Recovered':reply);
}catch(e){res.statusCode=e instanceof OpenUIServerError?e.status:500;res.end(JSON.stringify({error:e.code??e.message}));}
});}}],server:{host:'127.0.0.1',port:5188,strictPort:true,fs:{allow:[process.cwd()]}}});
