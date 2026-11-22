import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {chromium} from '@playwright/test';
import {Node,tidyLayout,edgePath} from '@tensquads/ui/react';
import {WorkflowGraphSchema,WORKFLOW_KIND_FAMILY,WORKFLOW_KIND_ICON} from '@tensquads/ui/schemas';
const evidence='~/.no-mistakes/evidence/01M81T4DQE2W0NYNSK0ZECSWH7';
const report={schema:[],layout:[],sizing:[]};
const node=(id,kind='agent',extra={})=>({id,kind,title:id,position:{x:13,y:27},...extra});
const edge=(from,to,fromPort)=>({id:from+'-'+to,from,to,...(fromPort===undefined?{}:{fromPort})});
const graph={nodes:[node('s','start'),node('b','if-else',{branches:['Available','Preorder','Else']}),node('a'),node('z','end')],edges:[edge('s','b'),edge('b','a',0),edge('a','z')]};
assert.deepEqual(WorkflowGraphSchema.parse(graph),graph);
const kinds=['agent','classify','if-else','while','user-approval','start','end','note','file-search','guardrails','mcp','transform','set-state'];
for(const kind of kinds) WorkflowGraphSchema.parse({nodes:[node(kind,kind)],edges:[]});
assert.equal(Object.keys(WORKFLOW_KIND_FAMILY).length,13); assert.equal(WORKFLOW_KIND_ICON.start,'play');
report.schema.push({input:'13 kinds and a Start → 3-branch If/else → Agent → End graph',output:WorkflowGraphSchema.parse(graph)});
function reject(name,change){const data=structuredClone(graph);change(data);const parsed=WorkflowGraphSchema.safeParse(data);assert.equal(parsed.success,false,name);report.schema.push({input:name,issues:parsed.error.issues.map(i=>({path:i.path,message:i.message}))});}
reject('duplicate node id',g=>g.nodes.push(g.nodes[0]));
reject('duplicate edge id',g=>g.edges.push(g.edges[0]));
reject('unknown source',g=>g.edges[0].from='missing');
reject('unknown target',g=>g.edges[0].to='missing');
reject('edge into Start',g=>g.edges.push(edge('a','s')));
reject('edge out of End',g=>g.edges.push(edge('z','a')));
reject('branch index too large',g=>g.edges[1].fromPort=3);
reject('negative branch index',g=>g.edges[1].fromPort=-1);
reject('fractional branch index',g=>g.edges[1].fromPort=0.5);
reject('branch port omitted',g=>delete g.edges[1].fromPort);
reject('port on ordinary node',g=>g.edges[0].fromPort=0);
reject('branches on ordinary node',g=>g.nodes[2].branches=['yes','no']);
reject('one branch',g=>g.nodes[1].branches=['one']);
reject('zero branches',g=>g.nodes[1].branches=[]);
reject('unknown graph field',g=>g.unowned=true);
reject('unknown node field',g=>g.nodes[0].unowned=true);
reject('unknown position field',g=>g.nodes[0].position.z=1);
reject('unknown edge field',g=>g.edges[0].unowned=true);
reject('unknown kind',g=>g.nodes[0].kind='unknown');
reject('infinite coordinate',g=>g.nodes[0].position.x=Infinity);
reject('empty node id',g=>g.nodes[2].id='');
// Oracle: task 002's 80px columns, 40px rows, 20px grid and worked split/join with 80px-high cards.
const split={nodes:[node('s','start'),node('a'),node('b'),node('j','end'),node('note','note')],edges:[edge('s','a'),edge('s','b'),edge('a','j'),edge('b','j')]};
const sizes=Object.fromEntries(split.nodes.map(n=>[n.id,{width:180,height:80}]));
const before=JSON.stringify(split);const p=tidyLayout(WorkflowGraphSchema.parse(split),sizes);
assert.deepEqual(JSON.parse(JSON.stringify(p)),{s:{x:20,y:80},a:{x:280,y:20},b:{x:280,y:140},j:{x:540,y:80},note:{x:20,y:260}});
assert.equal(JSON.stringify(split),before);
assert.deepEqual(tidyLayout({...split,nodes:split.nodes.map(n=>({...n,position:p[n.id]}))},sizes),p);
report.layout.push({input:'measured 180×80 split/join and note; applied layout twice',positions:p,inputUnchanged:true,idempotent:true});
const ordered={nodes:[node('R','if-else',{branches:['A','B']}),node('B','if-else',{branches:['K','J']}),...['A','J','K','X','U'].map(id=>node(id))],edges:[edge('R','A',0),edge('R','B',1),edge('A','X'),edge('B','K',0),edge('B','J',1),edge('X','U'),edge('K','J')]};
const o=tidyLayout(WorkflowGraphSchema.parse(ordered));assert(o.A.y<o.B.y&&o.X.y<o.K.y&&o.U.y<o.J.y&&o.U.x===o.J.x);report.layout.push({input:'adversarial discovery order R→A,B; A→X→U; B→K,J; K→J',positions:o});
const loop={nodes:[node('w','while'),node('work'),node('note','note'),node('loose')],edges:[edge('w','work'),edge('work','w')]};const l=tidyLayout(WorkflowGraphSchema.parse(loop));assert(l.work.x>l.w.x);assert(l.note.y>l.work.y&&l.note.y===l.loose.y&&l.note.x<l.loose.x);assert.deepEqual(tidyLayout(loop),l);report.layout.push({input:'while cycle plus two disconnected nodes',positions:l});
for(const connected of [true,false]){const unusual={nodes:['__proto__','constructor','toString'].map(id=>node(id)),edges:connected?[edge('__proto__','constructor'),edge('constructor','toString')]:[]};const u=tidyLayout(WorkflowGraphSchema.parse(unusual));assert.deepEqual(Object.keys(u).sort(),['__proto__','constructor','toString']);const restored=JSON.parse(JSON.stringify(u));for(const n of unusual.nodes)assert.deepEqual(restored[n.id],u[n.id]);report.layout.push({input:`prototype-named IDs, connected=${connected}`,positions:u});}
const varied={nodes:[node('s','start'),node('a'),node('b'),node('loose','note')],edges:[edge('s','a'),edge('a','b')]};
const variedSizes={s:{width:244,height:80},a:{width:126,height:96},b:{width:300,height:130},loose:{width:290,height:70}};
const v=tidyLayout(WorkflowGraphSchema.parse(varied),variedSizes);
for(let i=0;i<varied.nodes.length;i++)for(let j=i+1;j<varied.nodes.length;j++){const a=v[varied.nodes[i].id],b=v[varied.nodes[j].id],sa=variedSizes[varied.nodes[i].id],sb=variedSizes[varied.nodes[j].id];assert(a.x+sa.width<=b.x||b.x+sb.width<=a.x||a.y+sa.height<=b.y||b.y+sb.height<=a.y);}
for(const pos of Object.values(v)){assert.equal(pos.x%20,0);assert.equal(pos.y%20,0);}assert(v.a.x-(v.s.x+244)>=80);assert(v.b.x-(v.a.x+126)>=80);
report.layout.push({input:'chain with measured widths 244,126,300 and heights 80,96,130; loose 290×70',positions:v});assert.deepEqual(tidyLayout({nodes:[],edges:[]}),{});
assert.equal(edgePath(12,30,252,110),'M12,30 C132,30 132,110 252,110');report.layout.push({connector:edgePath(12,30,252,110)});
// Disposable real consumer: public React Node renders through SSR, then Chromium lays out its shipped CSS.
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/fixture'){const ar=url.searchParams.get('locale')==='ar';const theme=url.searchParams.get('theme');const title=ar?'مراجعة الطلب والتحقق من توفر المنتجات قبل إرسالها إلى العميل':'Review order availability before sending products to the customer';const cards=[h(Node,{id:'short',kind:'agent',title:ar?'مراجعة':'Review',meta:'Workflow step','data-forwarded':'consumer'}),h(Node,{id:'long',kind:'agent',title,meta:'Workflow step'}),h(Node,{id:'selected',kind:'agent',title:ar?'مراجعة':'Review',meta:'Workflow step',selected:true}),h(Node,{id:'note',kind:'note',title:ar?'ملاحظة':'Note',meta:'MUST BE HIDDEN'}),h(Node,{id:'branch',kind:'if-else',title:ar?'توفر الطلب':'Availability',meta:'Two conditions',branches:ar?['متاح','طلب مسبق','وإلا']:['In stock','Preorder','Else']})];res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="${ar?'ar':'en'}" dir="${ar?'rtl':'ltr'}" data-theme="${theme}"><head><meta charset="utf-8"><link rel="stylesheet" href="/packages/ui/dist/fonts.css"><link rel="stylesheet" href="/packages/ui/dist/tokens/tokens.css"><link rel="stylesheet" href="/packages/ui/dist/styles/styles.css"><style>body{padding:32px;background:var(--ts-canvas);font-family:var(--ts-font-sans)}main{display:flex;flex-direction:column;align-items:flex-start;gap:24px}</style></head><body><main>${cards.map(c=>renderToStaticMarkup(c)).join('')}</main></body></html>`);return;}const file=resolve('.'+url.pathname);if(!file.startsWith(process.cwd()+'/packages/ui/dist/')){res.writeHead(404).end();return;}res.setHeader('Content-Type',extname(file)==='.css'?'text/css':extname(file)==='.woff2'?'font/woff2':'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});for(const locale of ['en','ar'])for(const theme of ['light','dark']){await page.goto(`http://127.0.0.1:${server.address().port}/fixture?locale=${locale}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);const measured=await page.evaluate(()=>{const data={};for(const id of ['short','long','selected','note','branch']){const e=document.getElementById(id),t=e.querySelector('.ts-node__title'),s=getComputedStyle(e),r=t.getBoundingClientRect();data[id]={width:e.getBoundingClientRect().width,titleWidth:r.width,titleHeight:r.height,titleLineHeight:parseFloat(getComputedStyle(t).lineHeight),titleScrollWidth:t.scrollWidth,background:s.backgroundColor,shadow:s.boxShadow,meta:!!e.querySelector('.ts-node__meta'),forwarded:e.dataset.forwarded};}return data;});assert(measured.long.width>measured.short.width+200);assert(measured.long.titleWidth>=measured.long.titleScrollWidth-1);assert.equal(measured.long.titleHeight,measured.long.titleLineHeight);assert.equal(measured.short.background,measured.selected.background);assert.notEqual(measured.short.shadow,measured.selected.shadow);assert.equal(measured.note.meta,false);assert.equal(measured.short.forwarded,'consumer');report.sizing.push({locale,theme,measured});await page.screenshot({path:`${evidence}/consumer-${locale}-${theme}.png`,fullPage:true});}}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await writeFile(`${evidence}/consumer-results.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
