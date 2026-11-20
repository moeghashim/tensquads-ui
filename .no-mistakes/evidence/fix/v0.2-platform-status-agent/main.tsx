import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OwnerMessageView } from '../packages/ui/src/react/index.ts';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/styles/styles.css';
const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'prototype';
const locale = params.get('locale') === 'ar' ? 'ar' : 'en';
document.documentElement.lang = locale;
document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
document.documentElement.dataset.theme = locale === 'ar' ? 'dark' : 'light';
const at = '2026-11-20T12:00:00.000Z';
const bots = mode === 'prototype' ? ['constructor', 'toString', '__proto__', 'hasOwnProperty'] : mode === 'inherited' ? ['constructor', 'toString', '__proto__', 'inherited-bot'] : ['support-bot', 'constructor', 'toString', '__proto__', 'invalid-bot', 'missing-bot', 'petra'];
const squadmates = mode === 'prototype' ? {'support-bot': 'petra'} : mode === 'inherited' ? Object.create(Object.fromEntries(bots.map(bot => [bot, 'petra']))) : Object.fromEntries(['support-bot', 'constructor', 'toString', '__proto__'].map(bot => [bot, 'petra']).concat([['invalid-bot', 'not-an-agent']]));
function App() {
 const [commands, setCommands] = useState<any[]>([]);
 return <main style={{maxWidth: '760px', margin: 'auto', padding: '24px'}}><h1>Squadmate lookup: {mode}</h1><p>Local synthetic platform messages · {locale}</p>{bots.map((bot, i) => <section data-bot={bot} key={bot}><h2>{bot}</h2><OwnerMessageView locale={locale} squadmates={squadmates} messages={[
 {seq: i * 2 + 1, at, type: 'status', bot, taskId: 'task-1', attempt: 2, step: `Checking ${bot}`, since: at},
 {seq: i * 2 + 2, at, type: 'approval_request', approvalId: `approval-${i}`, action: 'refund', content: `Refund order ${i + 1}`, contentHash: `hash-${i}`, rule: null, limit: null, amount: 20000000, bot, taskId: 'task-1'}
 ]} onCommand={command => setCommands(previous => [...previous, command])} /></section>)}<h2>Sent commands</h2><pre id="commands">{JSON.stringify(commands, null, 2)}</pre></main>;
}
createRoot(document.getElementById('root')!).render(<App />);
