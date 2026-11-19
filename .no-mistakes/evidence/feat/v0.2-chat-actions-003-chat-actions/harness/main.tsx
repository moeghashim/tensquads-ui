import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useChat} from '../packages/ui/src/react/Chat/useChat';
import {ChatReply} from '../packages/ui/src/react/ChatReply/ChatReply';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App(){
const [policy,setPolicy]=useState('accept');const [kind,setKind]=useState('response');
const iterable=async function* (request,{signal}){const response=await fetch('/api/chat',{method:'POST',body:JSON.stringify(request),signal});if(!response.ok)throw Error('Request failed');const reader=response.body.getReader();const decoder=new TextDecoder();while(true){const {value,done}=await reader.read();if(done)break;yield decoder.decode(value,{stream:true});}};
const chat=useChat({endpoint:'/api/chat',transport:kind==='iterable'?iterable:undefined,onAction:()=>policy==='veto'?false:policy==='delay'?new Promise(resolve=>{window.approve=resolve}):true});
window.chat=chat;
return <main style={{maxWidth:900,margin:'32px auto',padding:24}}><h1>Local chat action validation</h1><label>Approval <select aria-label="Approval" value={policy} onChange={e=>setPolicy(e.target.value)}><option>accept</option><option>veto</option><option>delay</option></select></label><label> Transport <select aria-label="Transport" value={kind} onChange={e=>setKind(e.target.value)}><option>response</option><option>iterable</option></select></label><p role="status">{chat.busy?'Running':chat.error?'Blocked: '+chat.error.message:'Ready'}</p><button onClick={()=>void chat.send('start')}>Send start</button><button onClick={chat.stop}>Stop</button><button onClick={chat.reset}>Reset</button><button onClick={()=>void chat.retry()}>Retry</button><button onClick={()=>window.approve?.(true)}>Resolve approval</button><ChatReply reply={'```openui\nroot = Form("Project", [Field("Project name", "project", "", "Northstar"), Input("Owner", "", "Moe", "soft", false, false, "owner")], "Save project", {type: "SaveProject", params: {planId: "p1"}})\n```'} isStreaming={chat.busy} locked={id=>chat.locked.has(`form/${id}`)} onAction={(e,id)=>void chat.act(e,`form/${id}`)}/><div role="log">{chat.turns.map((turn,i)=>turn.role==='assistant'?<ChatReply key={i} reply={turn.content} isStreaming={chat.busy} locked={id=>chat.locked.has(`${i}/${id}`)} onAction={(e,id)=>void chat.act(e,`${i}/${id}`)}/>:<p className="ts-chat__user-message" key={i}>{turn.role==='action'?turn.action.summary:turn.content}</p>)}</div><pre aria-label="State">{JSON.stringify({turns:chat.turns,locked:[...chat.locked]},null,2)}</pre></main>;
}createRoot(document.getElementById('root')).render(<App/>);
