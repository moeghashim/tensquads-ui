import React, {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createAgent} from '@ui-sdk/react/agent';
import {Canvas} from '../packages/ui/src/react/Canvas/Canvas.tsx';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const freeze = (value) => { if(value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const initial = freeze({nodes:[
{id:'start',kind:'start',title:'Start',position:{x:40,y:100}},
{id:'branch',kind:'classify',title:'Route request',branches:['Refund','Question'],position:{x:280,y:100}},
{id:'agent',kind:'agent',title:'Draft reply',position:{x:520,y:100}},
{id:'end',kind:'end',title:'End',position:{x:780,y:100}}],edges:[]});
window.agent = createAgent(); window.events=[]; window.policy={apply:false,cancel:false,disabled:false,pan:false};
const direction=new URLSearchParams(location.search).get('dir')||'ltr';document.documentElement.dir=direction;
function App(){
const [graph,setGraph]=useState(initial),[selection,setSelection]=useState({nodes:[],edges:[]}),[viewport,setViewport]=useState({x:0,y:0,zoom:1}),[options,setOptions]=useState({dir:direction,mode:'select',disabled:false});
const ref=useRef(null);
window.configure=(patch)=>{ Object.assign(window.policy,patch); setOptions(prev=>({...prev,...patch})); };
window.inspect=()=>({graph,selection,viewport,sizes:ref.current?.getNodeSizes(),frozen:Object.isFrozen(initial.nodes[0].position),initial});
const record=(type,value,details)=>{window.events.push({type,value,source:details.source,reason:details.reason,eventType:details.event?.type,pointerType:details.event?.pointerType,eventConstructor:details.event?.constructor.name}); if(window.policy.cancel)details.cancel();return window.policy.apply && !details.canceled;};
return <main><h1>Canvas host contract — synthetic workflow</h1><p>Frozen input graph. Host callbacks below record actual Canvas actions.</p><div style={{height:450,width:'100%',border:'1px solid var(--border)'}}>
<Canvas ref={ref} graph={graph} label="Live workflow" dir={options.dir} mode={options.mode} viewport={viewport} selection={selection}
onViewportChange={(v,d)=>{record('viewport',v,d);if(!d.canceled)setViewport(v);}}
onSelectionChange={(s,d)=>{if(record('selection',s,d))setSelection(s);}}
onNodeMove={options.disabled?undefined:(id,p,d)=>{if(record('move',{id,position:p},d))setGraph(g=>freeze({...g,nodes:g.nodes.map(n=>n.id===id?{...n,position:p}:n)}));}}
onConnect={options.disabled?undefined:(c,d)=>{if(record('connect',c,d))setGraph(g=>freeze({...g,edges:[...g.edges,{...c,id:'edge-'+g.edges.length}]}));}}
onDelete={(s,d)=>{if(record('delete',s,d))setGraph(g=>freeze({nodes:g.nodes.filter(n=>!s.nodes.includes(n.id)),edges:g.edges.filter(e=>!s.edges.includes(e.id)&&!s.nodes.includes(e.from)&&!s.nodes.includes(e.to))}));}}/>
</div><pre>{JSON.stringify({graph,selection,viewport},null,2)}</pre></main>;
}
createRoot(document.getElementById('root')).render(<App/>);
