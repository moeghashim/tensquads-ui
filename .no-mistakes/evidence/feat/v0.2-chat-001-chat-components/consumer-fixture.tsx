import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chat, ChatHeader, ChatLog, ChatStep, ChatUserMessage, ChatComposer, ChatEmptyState} from '../packages/ui/src/react/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const locale = new URLSearchParams(location.search).get('locale') === 'ar' ? 'ar' : 'en';
document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')||'light';
function Reply(){const [lines,setLines]=useState(16); return <><button onClick={()=>setLines(x=>x+8)}>Grow nested reply</button>{Array.from({length:lines},(_,i)=><p key={i}>Reply paragraph {i+1}: synthetic local content</p>)}</>}
function App(){const [busy,setBusy]=useState(false);const [sent,setSent]=useState<string[]>([]);const [stops,setStops]=useState(0);return <main><h1>Disposable chat consumer</h1><div style={{height:620,maxWidth:480,margin:'auto'}}><Chat><ChatHeader locale={locale} onNewChat={()=>{setSent([]);setBusy(false)}}>Agent chat</ChatHeader><ChatLog><ChatEmptyState locale={locale}/><ChatUserMessage>Local synthetic user message</ChatUserMessage><ChatStep name="Planner" status="Blocked" statusVariant="danger" responseId="resp_local" reply={<Reply/>}/><ChatStep name="Research" running/></ChatLog><ChatComposer locale={locale} onSend={v=>{setSent(x=>[...x,v]);setBusy(true)}} busy={busy} onStop={()=>{setStops(x=>x+1);setBusy(false)}} attach={<button type="button">Attach</button>}/></Chat></div><output aria-label="Sent messages">{JSON.stringify(sent)}</output><output aria-label="Stop count">{stops}</output></main>}
createRoot(document.getElementById('root')!).render(<App/>);
