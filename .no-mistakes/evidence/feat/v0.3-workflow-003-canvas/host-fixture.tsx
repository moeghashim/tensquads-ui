import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAgent } from '@ui-sdk/react/agent';
import { Canvas } from '../packages/ui/src/react/Canvas/Canvas.tsx';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const initial = { nodes: [
 {id:'start',kind:'start',title:'Start',position:{x:40,y:60}},
 {id:'branch',kind:'classify',title:'Classify',branches:['A','B'],position:{x:320,y:60}},
 {id:'end',kind:'end',title:'End',position:{x:650,y:60}}
],edges:[]};
function freeze(value) { Object.freeze(value); Object.values(value).forEach(v=>{if(v && typeof v==='object' && !Object.isFrozen(v))freeze(v)});return value; }
freeze(initial);
window.calls=[];
window.policy={apply:false,cancel:false};
function Host(){
 const [graph,setGraph]=useState(initial);
 const [selection,setSelection]=useState({nodes:[],edges:[]});
 window.graph=graph;
 const report=(type,value,details)=>{window.calls.push({type,value,source:details.source});if(window.policy.cancel){details.cancel();return false;}return true;};
 return <main><h1>Canvas public host contract</h1><p>Real Canvas, frozen synthetic input, host callbacks and UI SDK agent.</p><div style={{width:1100,height:520}}><Canvas graph={graph} selection={selection} label="Host workflow" style={{width:'1100px',height:'520px'}}
 onSelectionChange={(value,d)=>{if(report('select',value,d))setSelection(value)}}
 onNodeMove={(id,position,d)=>{if(report('move',{id,position},d)&&window.policy.apply)setGraph(g=>({...g,nodes:g.nodes.map(n=>n.id===id?{...n,position}:n)}))}}
 onConnect={(value,d)=>{if(report('connect',value,d)&&window.policy.apply)setGraph(g=>({...g,edges:[...g.edges,{id:`edge-${g.edges.length}`,...value}]}))}} /></div>
 <pre id="host-state">{JSON.stringify({graph,selection},null,2)}</pre></main>;
}
createRoot(document.getElementById('root')).render(<Host/>);
window.agent=createAgent();
