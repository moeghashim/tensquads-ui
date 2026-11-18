import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chat, ChatHeader, ChatLog, ChatStep, ChatUserMessage, ChatComposer, ChatEmptyState, Button} from '../packages/ui/src/react/index.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const ar = new URLSearchParams(location.search).get('locale') === 'ar';
document.documentElement.lang=ar?'ar':'en';document.documentElement.dir=ar?'rtl':'ltr';document.documentElement.dataset.theme=ar?'dark':'light';
const locale=ar?'ar':'en';
let growReply=()=>{};
function GrowingReply(){const [lines,setLines]=useState(15);growReply=()=>setLines(n=>n+12);return <div><p>Nested reply: independently updating React content</p>{Array.from({length:lines},(_,i)=><p key={i}>Plan item {i+1}: synthetic reply content</p>)}<Button onClick={()=>setLines(n=>n+1)}>Inline action</Button></div>}
function Example(){const [sent,setSent]=useState<string[]>([]);const [busy,setBusy]=useState(false);const [stops,setStops]=useState(0);const [resets,setResets]=useState(0);const [clicks,setClicks]=useState(0);return <main><h1>Chat live consumer</h1><div style={{height:'650px',maxWidth:'480px',margin:'auto'}}><Chat><ChatHeader locale={locale} onNewChat={()=>setResets(n=>n+1)}>Agent chat</ChatHeader><ChatLog><ChatUserMessage>{ar?'طلب تجريبي':'Synthetic request'}</ChatUserMessage><ChatStep name="Planner" status="Blocked" statusVariant="danger" responseId="resp_live" glyph={<span>◇</span>} reply={<><p>Arbitrary reply with <a href="#details">details link</a></p><Button onClick={()=>setClicks(n=>n+1)}>Reply action</Button></>}/><ChatStep name="Worker" running status="Running" reply={<GrowingReply/>}/>{sent.map((s,i)=><ChatUserMessage key={i}>{s}</ChatUserMessage>)}</ChatLog><ChatComposer locale={locale} busy={busy} attach={<Button type="button" aria-label="Attach" onClick={()=>setClicks(n=>n+1)}>+</Button>} onStop={()=>{setStops(n=>n+1);setBusy(false)}} onSend={s=>setSent(x=>[...x,s])}/></Chat></div><Button onClick={()=>growReply()}>Grow nested reply</Button><Button onClick={()=>setBusy(true)}>Start busy</Button><output style={{display:"block",overflowWrap:"anywhere"}} aria-label="Events">{JSON.stringify({sent,stops,resets,clicks})}</output><section aria-label="Empty chat"><ChatEmptyState locale={locale}/></section></main>}
createRoot(document.getElementById('root')!).render(<Example/>);
