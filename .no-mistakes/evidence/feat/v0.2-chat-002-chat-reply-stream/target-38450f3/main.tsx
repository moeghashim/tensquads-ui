import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ChatReply} from '../packages/ui/src/react/ChatReply/ChatReply';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const root=createRoot(document.getElementById('root')!);
Object.assign(window,{replyErrors:[],setReply(reply:string,locale='en',theme='light') {
 document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';document.documentElement.dataset.theme=theme;
 flushSync(()=>root.render(<ChatReply reply={reply} locale={locale as 'en'|'ar'} onError={errors=>(window as any).replyErrors.push(errors)} />));
}});
(window as any).setReply('');
