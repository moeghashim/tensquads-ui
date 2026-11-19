import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {OwnerMessageView,pendingQuestion} from '../packages/ui/src/react/OwnerMessage/OwnerMessage.tsx';
import {ApprovalCard} from '../packages/ui/src/react/ApprovalCard/ApprovalCard.tsx';
import {ChatReply} from '../packages/ui/src/react/ChatReply/ChatReply.tsx';
import {useChat} from '../packages/ui/src/react/Chat/useChat.ts';
import * as contract from '../packages/ui/src/schemas/platform.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const at='2026-11-19T12:00:00.000Z';
const approval={seq:3,at,type:'approval_request',approvalId:'a1',action:'refund',content:'Refund order 42',contentHash:'hash-42',rule:'daily_limit',limit:20000000};
const text='See **literal** (https://en.wikipedia.org/wiki/Refund_(finance)).\n```openui\nroot = Button("Injected")\n```\n<script>window.injected=true</script> javascript:alert(1)';
const initial=[{seq:8,at,type:'future',text:'Unknown must not render'}, {seq:7,at,type:'question',questionId:'free-new',text:'New free question',options:[]},{seq:6,at,type:'action_not_confirmed',taskId:'t1',actionId:'act1',what:'Refund unverified'}, {seq:5,at,type:'status',taskId:'t1',bot:'petra',attempt:2,step:'Checking order',since:at},{seq:4,at,type:'result',taskId:'t1',summary:text,evidence:[text]},approval,{seq:2,at,type:'question',questionId:'q1',text:'Choose size',options:['Small','Large']},{seq:1,at,type:'reply',text}];
window.contract=contract;
function Stream(){
 const [mode,setMode]=useState('veto');const [events,setEvents]=useState([]); const [requests,setRequests]=useState([]);
 const chat=useChat({endpoint:'local://validation',onAction:async(e)=>{setEvents(x=>[...x,e]); if(mode==='reject')throw Error('Host rejection'); if(mode==='pending')return await new Promise(resolve=>{window.settle=resolve}); return mode==='accept';},transport:async function*(request){setRequests(x=>[...x,request]);yield 'Recorded by local synthetic transport';}});
 return <section id="stream"><h2>Streamed approval host acceptance</h2><select aria-label="Host mode" value={mode} onChange={e=>setMode(e.target.value)}>{['veto','accept','reject','pending'].map(x=><option key={x}>{x}</option>)}</select><ChatReply reply={'```openui\nroot = ApprovalCard("stream-a", "refund", "Streamed refund", "stream-hash")\n```'} onAction={(e,id)=>chat.act(e,id)} locked={id=>chat.locked.has(id)} isStreaming={chat.busy}/><pre id="stream-events">{JSON.stringify(events,null,2)}</pre><pre id="stream-requests">{JSON.stringify(requests,null,2)}</pre><pre id="stream-turns">{JSON.stringify(chat.turns,null,2)}</pre></section>
}
function App(){const [messages,setMessages]=useState(initial);const [commands,setCommands]=useState([]);const [locale,setLocale]=useState('en');const [unknown,setUnknown]=useState([]);return <main style={{maxWidth:760,margin:'auto',padding:20}}><h1>Platform owner consumer</h1><button onClick={()=>setMessages(x=>x.filter(m=>m.seq!==1))}>Remove earlier reply</button><button onClick={()=>{setLocale('ar');document.documentElement.lang='ar';document.documentElement.dir='rtl';document.documentElement.dataset.theme='dark'}}>Arabic dark</button><div id="owner"><OwnerMessageView messages={messages} locale={locale} onCommand={c=>setCommands(x=>[...x,c])} onUnknown={React.useCallback(m=>setUnknown(x=>[...x,m]),[])}/></div><pre id="commands">{JSON.stringify(commands,null,2)}</pre><pre id="unknown">{JSON.stringify(unknown)}</pre><div id="pending">{pendingQuestion(messages)?.questionId}</div><button onClick={()=>setMessages(x=>x.filter(m=>m.questionId!=='free-new'))}>Clear answered free question</button><section id="restored"><h2>Restore one of two approvals</h2><OwnerMessageView messages={[approval,{...approval,seq:9,approvalId:'a2',content:'Second request'}]} approvalDecisions={{a1:'approve'}} locale={locale}/></section><section id="overrides"><h2>Copy overrides</h2><ApprovalCard request={{...approval,limit:0,rule:null}} taskId="t1" locale={locale} labels={{approve:'Allow',decline:'Deny',approved:'Allowed',declined:'Denied',limit:'Cap',task:'Job'}}/></section><Stream/></main>}
createRoot(document.getElementById('root')).render(<App/>);
