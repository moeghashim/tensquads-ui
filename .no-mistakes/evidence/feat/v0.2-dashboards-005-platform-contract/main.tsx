import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ApprovalCard, OwnerMessageView, pendingQuestion, ChatReply} from '../packages/ui/src/react/index';
import {useChat} from '../packages/ui/src/react/Chat/useChat';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import * as sdk from '../packages/ui/src/schemas/platform';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const at='2026-11-19T12:00:00.000Z';
const request={seq:3,at,type:'approval_request',approvalId:'approval_A',contentHash:'sha256:A',action:'refund',content:'Refund order A',rule:'refund_limit',limit:20000000};
const url='https://en.wikipedia.org/wiki/Refund_(finance)';
const text='See **literal** ('+url+').\n```openui\nroot = Button("Injected")\n```';
const initial=[{seq:8,at,type:'future',text:'hidden future'}, {seq:7,at,type:'question',questionId:'q-new',text:'Latest free text',options:[]}, {seq:6,at,type:'action_not_confirmed',taskId:'t1',actionId:'a1',what:'No service confirmation'}, {seq:5,at,type:'status',taskId:'t1',bot:'unknown-bot',attempt:1,step:'Checking',since:at}, {seq:4,at,type:'result',taskId:'t1',summary:text,evidence:[text]},request,{seq:2,at,type:'question',questionId:'q-options',text:'Choose priority',options:['Normal','Urgent']},{seq:1,at,type:'reply',text},{seq:9,at,type:'question',questionId:'q-old',text:'Older by sequence?',options:[]}];
function App(){
 const mode=new URLSearchParams(location.search).get('mode')||'owner';
 const ar=new URLSearchParams(location.search).get('locale')==='ar';
 const locale=ar?'ar':'en';
 document.documentElement.lang=locale; document.documentElement.dir=ar?'rtl':'ltr';
 const [sent,setSent]=useState<any[]>([]),[unknown,setUnknown]=useState<any[]>([]),[messages,setMessages]=useState(initial);
 const [accept,setAccept]=useState('veto'),[streaming,setStreaming]=useState(false);
 const record=(x:any)=>setSent(s=>[...s,x]);
 const chat=useChat({endpoint:'local://synthetic',locale,onAction:()=>accept==='accept',transport:async function*(){yield 'Recorded locally';}});
 const stream='root = ApprovalCard("approval_A", "refund", "Refund order A", "sha256:A", null, 20000000, {}, "'+locale+'")';
 return <main style={{maxWidth:800,margin:'32px auto',padding:16}}><h1>Disposable real-library host: {mode}</h1>
 {mode==='owner' && <><button onClick={()=>setMessages(m=>m.filter(x=>x.seq!==1))}>Remove earlier reply</button><button onClick={()=>{const q=pendingQuestion(messages); if(q){record(sdk.ownerAnswerCommand({questionId:q.questionId,text:'Typed answer'}));setMessages(m=>m.filter(x=>x.seq!==q.seq));}}}>Send composer answer</button><OwnerMessageView messages={messages} locale={locale} onCommand={record} onUnknown={React.useCallback(x=>setUnknown(s=>[...s,x]),[])} /><pre id="unknown">{JSON.stringify(unknown)}</pre></>}
 {mode==='restore' && <OwnerMessageView locale={locale} messages={[request,{...request,seq:10,approvalId:'approval_B',content:'Refund order B'}]} approvalDecisions={{approval_A:'approve'}} onCommand={record} />}
 {mode==='decisions' && <><ApprovalCard locale={locale} request={request} onDecision={record} bot="petra" taskId="t1"/><TensquadsRenderer stream={stream} onAction={record}/></>}
 {mode==='acceptance' && <><label>Acceptance<select aria-label="Acceptance" value={accept} onChange={e=>setAccept(e.target.value)}><option value="veto">veto</option><option value="reject-promise">reject-promise</option><option value="pending">pending</option><option value="accept">accept</option></select></label><label><input aria-label="Streaming" type="checkbox" checked={streaming} onChange={e=>setStreaming(e.target.checked)}/>Streaming</label><button onClick={()=>{(window as any).settle?.(false)}}>Resolve veto</button><button onClick={()=>{(window as any).settle?.(true)}}>Resolve accept</button><TensquadsRenderer stream={stream} isStreaming={streaming} onAction={e=>{record(e); if(accept==='veto')return false; if(accept==='reject-promise')return Promise.reject(new Error('Host veto')); if(accept==='pending')return new Promise(resolve=>(window as any).settle=resolve); return true;}}/></>}
 {mode==='chat' && <><select aria-label="Acceptance" value={accept} onChange={e=>setAccept(e.target.value)}><option value="veto">veto</option><option value="accept">accept</option></select><ChatReply reply={'```openui\n'+stream+'\n```'} locale={locale} onAction={(e,id)=>chat.act(e,id)} locked={id=>chat.locked.has(id)} isStreaming={chat.busy}/><pre id="chat-turns">{JSON.stringify(chat.turns)}</pre></>}
 {mode==='copy' && <><ApprovalCard locale={locale} request={request} taskId="t1" labels={{approve:'Allow',decline:'Deny',approved:'Allowed',declined:'Denied',limit:'Cap',task:'Job'}} onDecision={record}/><TensquadsRenderer stream={'root = ApprovalCard("approval_B", "refund", "Refund B", "hash:B", null, null, {}, "'+locale+'", {approve:"Allow", decline:"Deny", approved:"Allowed", declined:"Denied"})'} onAction={record}/><OwnerMessageView locale={locale} messages={initial.filter(m=>['status','question','action_not_confirmed'].includes(m.type))} labels={{answerHint:'Answer here',attempt:'Try',errorTitle:'Unconfirmed'}}/></>}
 <h2>Host received</h2><pre id="sent">{JSON.stringify(sent,null,2)}</pre></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
