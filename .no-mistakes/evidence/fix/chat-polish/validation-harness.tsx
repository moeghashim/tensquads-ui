import React from 'react';
import {createRoot} from 'react-dom/client';
import {Chat, ChatLog, ChatUserMessage, ChatAssistantMessage, ChatWorking, ChatError, ChatComposer, useChat, Button} from '../packages/ui/src/react/index.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const params = new URLSearchParams(location.search);
const locale = params.get('locale') === 'ar' ? 'ar' : 'en';
document.documentElement.lang = locale;
document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
document.documentElement.dataset.theme = params.get('theme') || 'light';
function App() {
 const chat = useChat({endpoint:'/api/reply?session='+params.get('session'),locale});
 const last = chat.turns.at(-1);
 return <main style={{height:'80vh',maxWidth:'60rem',margin:'2rem auto'}}><Chat><ChatLog>{chat.turns.map((turn,index)=>turn.role==='user'?<ChatUserMessage key={index}>{turn.content}</ChatUserMessage>:<ChatAssistantMessage key={index}>{turn.content}</ChatAssistantMessage>)}{chat.busy && !(last?.role==='assistant'&&last.content) && <ChatWorking locale={locale}/>}{chat.error && <ChatError locale={locale} onRetry={()=>void chat.retry()}>{chat.error.message}</ChatError>}</ChatLog><ChatComposer locale={locale} onSend={text=>void chat.send(text)} busy={chat.busy} onStop={chat.stop} attach={<Button type="button" variant="ghost" aria-label="Attach">+</Button>}/></Chat><button onClick={chat.reset}>Reset</button></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
