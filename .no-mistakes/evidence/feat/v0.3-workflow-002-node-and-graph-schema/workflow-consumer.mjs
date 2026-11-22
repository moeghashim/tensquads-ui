import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {WorkflowGraphSchema, WorkflowNodeKindSchema, WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON} from '@tensquads/ui/schemas';
import {tidyLayout, portPosition, edgePath} from '@tensquads/ui/react';
const evidence = '~/.no-mistakes/evidence/01M81RFK74FFRYNBZFGRN9MQ9F/workflow-consumer.json';
const records=[];
const node=(id,kind='agent',branches)=>({id,kind,title:id,position:{x:13,y:27},...(branches?{branches}:{})});
const edge=(id,from,to,fromPort)=>({id,from,to,...(fromPort!==undefined?{fromPort}:{})});
const run=(name,fn)=>{try {records.push({name,status:'pass',...fn()});}catch(error){records.push({name,status:'fail',error:error.stack});process.exitCode=1;}};
const kinds=['agent','classify','if-else','while','user-approval','start','end','note','file-search','guardrails','mcp','transform','set-state'];
run('Public schema accepts all thirteen kinds and valid branch, loop and empty graphs',()=>{
 assert.deepEqual(WorkflowNodeKindSchema.options,kinds);
 const families=['agent','logic','logic','logic','logic','end','end','note','tool','tool','tool','data','data'];
 const icons=['agent','classify','ifelse','while','approval','play','end','note','file','shield','mcp','transform','state'];
 kinds.forEach((kind,i)=>{assert.equal(WORKFLOW_KIND_FAMILY[kind],families[i]);assert.equal(WORKFLOW_KIND_ICON[kind],icons[i]);});
 const all=WorkflowGraphSchema.parse({nodes:kinds.map(kind=>node(kind,kind,['classify','if-else','guardrails'].includes(kind)?['A','B']:undefined)),edges:[edge('1','start','if-else'),edge('2','if-else','while',0),edge('3','while','agent'),edge('4','agent','while'),edge('5','if-else','end',1)]});
 assert.deepEqual(WorkflowGraphSchema.parse({nodes:[],edges:[]}),{nodes:[],edges:[]});
 return {acceptedGraph:all,familyMappings:WORKFLOW_KIND_FAMILY,iconMappings:WORKFLOW_KIND_ICON};
});
run('Public schema rejects malformed graphs with actionable issue paths',()=>{
 const a=node('a'),b=node('b'),branch=node('branch','if-else',['Yes','Else']);
 const graph=(nodes,edges=[])=>({nodes,edges});
 const cases=[
 ['duplicate node',graph([a,a]),'nodes.1.id'],
 ['duplicate edge',graph([a,b],[edge('e','a','b'),edge('e','a','b')]),'edges.1.id'],
 ['unknown source',graph([a],[edge('e','missing','a')]),'edges.0.from'],
 ['unknown target',graph([a],[edge('e','a','missing')]),'edges.0.to'],
 ['into start',graph([a,node('s','start')],[edge('e','a','s')]),'edges.0.to'],
 ['out of end',graph([a,node('e','end')],[edge('x','e','a')]),'edges.0.from'],
 ['ordinary port forbidden',graph([a,b],[edge('e','a','b',0)]),'edges.0.fromPort'],
 ['branch port required',graph([branch,a],[edge('e','branch','a')]),'edges.0.fromPort'],
 ['branch port outside range',graph([branch,a],[edge('e','branch','a',2)]),'edges.0.fromPort'],
 ['negative port',graph([branch,a],[edge('e','branch','a',-1)]),'edges.0.fromPort'],
 ['fractional port',graph([branch,a],[edge('e','branch','a',0.5)]),'edges.0.fromPort'],
 ['branches on ordinary node',graph([node('a','agent',['A','B'])]),'nodes.0.branches'],
 ['only one branch',graph([node('a','classify',['A'])]),'nodes.0.branches'],
 ['zero branches',graph([node('a','guardrails',[])]),'nodes.0.branches'],
 ['extra graph property',{...graph([a]),extra:true},''],
 ['extra node property',graph([{...a,extra:true}]),'nodes.0'],
 ['extra position property',graph([{...a,position:{x:0,y:0,z:0}}]),'nodes.0.position'],
 ['extra edge property',graph([a,b],[{...edge('e','a','b'),extra:true}]),'edges.0'],
 ['nonfinite position',graph([{...a,position:{x:Infinity,y:0}}]),'nodes.0.position.x'],
 ['empty id',graph([node('')]),'nodes.0.id'],
 ['unknown kind',graph([node('a','unknown')]),'nodes.0.kind']
 ];
 return {rejections:cases.map(([name,input,path])=>{const result=WorkflowGraphSchema.safeParse(input);assert.equal(result.success,false,name);const issues=result.error.issues.map(({path,message})=>({path:path.join('.'),message}));assert(issues.some(issue=>issue.path===path),name);return {name,input,issues};})};
});
const layout=(input,sizes)=>{
 const graph=WorkflowGraphSchema.parse(input),before=structuredClone(graph),beforeSizes=structuredClone(sizes);
 const positions=tidyLayout(graph,sizes); assert.deepEqual(graph,before); assert.deepEqual(sizes,beforeSizes);
 assert.deepEqual(tidyLayout(graph,sizes),positions);
 assert.deepEqual(tidyLayout({...graph,nodes:graph.nodes.map(n=>({...n,position:positions[n.id]}))},sizes),positions);
 Object.values(positions).forEach(p=>{assert.equal(p.x%20,0);assert.equal(p.y%20,0);});
 if(sizes)for(let i=0;i<graph.nodes.length;i++)for(let j=i+1;j<graph.nodes.length;j++){const a=graph.nodes[i].id,b=graph.nodes[j].id,p=positions[a],q=positions[b],s=sizes[a],t=sizes[b];assert(p.x+s.width<=q.x||q.x+t.width<=p.x||p.y+s.height<=q.y||q.y+t.height<=p.y,`${a} overlaps ${b}`);}
 return {graph,sizes,positions};
};
run('Public tidyLayout centres split and join columns and preserves branch and parent order',()=>{
 const split={nodes:[node('s','start'),node('a'),node('b'),node('join','end'),node('note','note')],edges:[edge('sa','s','a'),edge('sb','s','b'),edge('aj','a','join'),edge('bj','b','join')]};
 const sizes=Object.fromEntries(split.nodes.map(n=>[n.id,{width:180,height:80}]));
 const centred=layout(split,sizes);assert.deepEqual(JSON.parse(JSON.stringify(centred.positions)),{s:{x:20,y:80},a:{x:280,y:20},b:{x:280,y:140},join:{x:540,y:80},note:{x:20,y:260}});
 const ordered=layout({nodes:[node('R','if-else',['A','B']),node('B','if-else',['K','J']),node('A'),node('J'),node('K'),node('X'),node('U'),node('V')],edges:[edge('ra','R','A',0),edge('rb','R','B',1),edge('ax','A','X'),edge('bk','B','K',0),edge('bj','B','J',1),edge('xu','X','U'),edge('kj','K','J'),edge('xv','X','V')]});
 const p=ordered.positions;assert(p.A.y<p.B.y);assert(p.X.y<p.K.y);assert(p.U.y<p.V.y&&p.V.y<p.J.y);assert.equal(p.U.x,p.J.x);
 return {oracle:'Task 002: 180x80 cards, 80 column gap, 40 row gap, 20px grid; singleton columns offset 60px within 200px flow.',centred,ordered};
});
run('Public tidyLayout handles chains, loops, loose nodes, varied sizes and prototype-named IDs without mutation',()=>{
 const chainGraph={nodes:[node('s','start'),node('a'),node('b','end'),node('loose','note')],edges:[edge('sa','s','a'),edge('ab','a','b')]};
 const sizes={s:{width:244,height:80},a:{width:126,height:96},b:{width:300,height:130},loose:{width:290,height:70}};
 const chain=layout(chainGraph,sizes),p=chain.positions;assert(p.a.x-p.s.x>=244+80);assert(p.b.x-p.a.x>=126+80);assert(p.loose.y>=Math.max(p.s.y+80,p.a.y+96,p.b.y+130)+40);
 const loop=layout({nodes:[node('w','while'),node('work'),node('note','note'),node('solo')],edges:[edge('a','w','work'),edge('b','work','w')]});assert(loop.positions.work.x>loop.positions.w.x);assert.equal(loop.positions.note.y,loop.positions.solo.y);assert(loop.positions.note.x<loop.positions.solo.x);
 const reserved=[false,true].map(connected=>{const output=layout({nodes:['__proto__','constructor','toString'].map(id=>node(id)),edges:connected?[edge('a','__proto__','constructor'),edge('b','constructor','toString')]:[]});const restored=JSON.parse(JSON.stringify(output.positions));assert.deepEqual(Object.keys(restored).sort(),['__proto__','constructor','toString']);Object.keys(restored).forEach(id=>assert(Object.hasOwn(output.positions,id)));return output;});
 const empty=tidyLayout({nodes:[],edges:[]});assert.deepEqual(empty,{});
 assert.equal(edgePath(10,20,90,60),'M10,20 C50,20 50,60 90,60');
 const branch={...node('branch','if-else',['A','B']),position:{x:12,y:30}};
 const ports=[portPosition(branch,'in',200),portPosition(branch,{out:0},200),portPosition(branch,{out:1},200)];assert.deepEqual(ports,[{x:12,y:54},{x:212,y:100},{x:212,y:132}]);
 return {chain,loop,reserved,empty,ports,edgePath:edgePath(10,20,90,60)};
});
writeFileSync(evidence,JSON.stringify({surface:'Built @tensquads/ui public exports, called directly by a disposable Node consumer; synthetic local graphs, no mocks.',oracle:'dev/milestones/v0.3-workflow/002-node-and-graph-schema.md and Canvas port guide',records},null,2));
for(const r of records)console.log(`${r.status}: ${r.name}${r.error?'\n'+r.error:''}`);
