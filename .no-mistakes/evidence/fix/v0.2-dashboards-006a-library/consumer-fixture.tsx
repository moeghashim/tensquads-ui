import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart, EntityCell, ApprovalCard} from '../packages/ui/src/react/index';
import {TensquadsRenderer} from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const q = new URLSearchParams(location.search);
const locale = q.get('locale') === 'ar' ? 'ar' : 'en';
document.documentElement.lang=locale;
document.documentElement.dir=locale==='ar'?'rtl':'ltr';
document.documentElement.dataset.theme=q.get('theme')||'light';
document.body.style.cssText='margin:0;background:var(--ts-canvas);color:var(--ts-text);font-family:var(--ts-font-sans)';
function Example(){
 const [sent,setSent]=useState<unknown[]>([]);
 const request={approvalId:'a1', action:'refund',content:'Refund order 42',contentHash:'hash-42',rule:'daily_limit',limit:20000000};
 return <main style={{padding:16}}>
 <h1>Dashboard library validation</h1>
 <section id="counts"><h2>Small counts</h2><BarChart points={[{label:'A',value:2},{label:'B',value:3},{label:'Zero',value:0}]} /></section>
 <section id="currency"><h2>Currency</h2><BarChart points={[{label:'A',value:6000},{label:'B',value:10000}]} formatValue={v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v)}/></section>
 <section id="initials"><h2>Entity initials</h2>{['Northstar Goods',' northstar ','acme   studio','  Blue Sky Shop  '].map(name=><div key={name}><EntityCell name={name} initials="wrong" detail="Synthetic store" /></div>)}</section>
 <section id="unmapped"><h2>Unmapped rule</h2><ApprovalCard request={request} locale={locale} onDecision={c=>setSent(a=>[...a,c])}/></section>
 <section id="mapped"><h2>Mapped rule</h2><ApprovalCard request={request} locale={locale} ruleLabels={{daily_limit:'Daily refund limit'}} onDecision={c=>setSent(a=>[...a,c])}/></section>
 <section id="stream"><h2>OpenUI positional compatibility</h2><TensquadsRenderer locale={locale} stream={'root = ApprovalCard("a1", "refund", "Refund", "hash-42", "daily_limit", 20000000, {}, "ar", {approve: "Allow"}, {daily_limit: "Daily refund limit"})'} onAction={c=>setSent(a=>[...a,c])}/></section>
 <output aria-label="Sent commands">{JSON.stringify(sent)}</output>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Example/>);
