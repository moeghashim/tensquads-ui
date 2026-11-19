import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useChat} from '../packages/ui/src/react/Chat/useChat';
import {ChatReply} from '../packages/ui/src/react/ChatReply/ChatReply';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const initial='```openui\nroot = Form("Project", [Field("Project name", "project", "", "Northstar"), Input("Owner", "", "Moe", "soft", false, false, "owner")], "Save project", {type:"SaveProject",params:{planId:"p1",owner:"parameter owner"}})\n```';
const button='```openui\nroot = Button("Approve plan", "solid", "md", false, false, {type:"Approve",params:{planId:"p1"}})\n```';
let resolveApproval;
function App(){
const [mode,setMode]=useState('normal');const [approval,setApproval]=useState('accept');const [observed,setObserved]=useState([]);const [endpoint,setEndpoint]=useState('/api/chat');
const chat=useChat({endpoint,onAction:async e=>{setObserved(o=>[...o,e]); if(approval==='veto')return false;if(approval==='pending')return await new Promise(r=>{resolveApproval=r});},...(mode==='iterator'?{transport:async function*(){yield 'Iterator partial';await new Promise(r=>setTimeout(r,1200));yield ' complete';}}:{})});
window.chat=chat;
return <main style={{maxWidth:850,margin:'24px auto',padding:20}}><h1>Local chat actions verification</h1><p>Real library; synthetic local inputs and localhost streaming endpoint.</p>
<label>Transport <select aria-label="Transport" value={mode} onChange={e=>setMode(e.target.value)}><option value="normal">HTTP</option><option value="iterator">Iterator</option></select></label>
<label>Approval <select aria-label="Approval" value={approval} onChange={e=>setApproval(e.target.value)}><option value="accept">Accept</option><option value="veto">Veto</option><option value="pending">Pending</option></select></label>
<button onClick={()=>resolveApproval?.(true)}>Resolve approval</button><button onClick={()=>chat.reset()}>Reset</button><button onClick={()=>chat.stop()}>Stop</button><button onClick={()=>chat.send('A new text turn')}>Send text</button><button onClick={()=>chat.retry()}>Retry</button><button onClick={()=>setEndpoint('/api/error')}>Use error endpoint</button><button onClick={()=>setEndpoint('/api/chat')}>Use success endpoint</button>
<h2>Initial button</h2><section data-testid="initial"><ChatReply reply={button} locked={id=>chat.locked.has('initial/'+id)} onAction={(e,id)=>void chat.act(e,'initial/'+id)}/></section>
<h2>Initial form</h2><section data-testid="form"><ChatReply reply={initial} locked={id=>chat.locked.has('form/'+id)} onAction={(e,id)=>void chat.act(e,'form/'+id)}/></section>
<h2>Conversation</h2><section aria-label="Conversation">{chat.turns.map((t,i)=>t.role==='assistant'?<ChatReply key={i} reply={t.content} locked={id=>chat.locked.has(i+'/'+id)} onAction={(e,id)=>void chat.act(e,i+'/'+id)}/>:<p className="ts-chat__user-message" key={i}>{t.role==='action'?t.action.summary:t.content}</p>)}</section>
<p role="status">{chat.busy?'Running':chat.error?'Blocked: '+chat.error.message:'Idle'}</p>
<details open><summary>Observable state</summary><pre id="state">{JSON.stringify({turns:chat.turns,busy:chat.busy,error:chat.error?.message,locked:[...chat.locked],observed},null,2)}</pre></details>
</main>}
createRoot(document.getElementById('root')).render(<App/>);
