import React from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart} from '../packages/ui/src/react/BarChart/BarChart';
import {EntityCell} from '../packages/ui/src/react/DataTable/DataTable';
import {ApprovalCard} from '../packages/ui/src/react/ApprovalCard/ApprovalCard';
import {TensquadsRenderer} from '../packages/ui/src/openui/TensquadsRenderer';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const ar=new URLSearchParams(location.search).get('locale')==='ar';
document.documentElement.lang=ar?'ar':'en'; document.documentElement.dir=ar?'rtl':'ltr';
document.documentElement.dataset.theme=ar?'dark':'light';
const request={approvalId:'a1',action:'refund',content:'Refund order 42',contentHash:'hash-42',rule:'daily_limit',limit:20000000};
const locale=ar?'ar':'en';
createRoot(document.getElementById('root')!).render(<main style={{padding:16,fontFamily:'Inter, sans-serif'}}>
<h1>Dashboard library validation</h1>
<section id="integer"><h2>Integer counts</h2><BarChart points={[{label:'A',value:2},{label:'B',value:3},{label:'Zero',value:0}]} /></section>
<section id="currency"><h2>Currency with long axis labels</h2><BarChart points={[{label:'A',value:6000},{label:'B',value:10000}]} formatValue={v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v)}/></section>
<section id="long"><h2>15 dates</h2><BarChart points={Array.from({length:15},(_,i)=>({label:`Day ${i+1}`,value:i+1}))} /></section>
<section id="entities"><h2>Derived entity initials</h2>{['Acme Studio','Northstar','  lower   case name '].map(name=><p key={name}><EntityCell name={name} detail="Synthetic company" initials="WRONG"/></p>)}</section>
<section id="mapped"><h2>Mapped rule</h2><ApprovalCard request={request} locale={locale} ruleLabels={{daily_limit:ar?'حد الاسترداد اليومي':'Daily refund limit'}}/></section>
<section id="hidden"><h2>Unmapped rule with limit</h2><ApprovalCard request={request} locale={locale}/></section>
<section id="hidden-only"><h2>Unmapped rule without limit</h2><ApprovalCard request={{...request,limit:null}} locale={locale}/></section>
<section id="legacy"><h2>Legacy positional OpenUI</h2><TensquadsRenderer locale={locale} stream={`root = ApprovalCard("legacy", "refund", "Refund", "hash", "daily_limit", 20000000, {}, "${locale}", {approve: "Allow", decline: "Deny"})`}/></section>
<section id="openui"><h2>Mapped OpenUI</h2><TensquadsRenderer locale={locale} stream={`root = ApprovalCard("mapped", "refund", "Refund", "hash", "daily_limit", 20000000, {}, "${locale}", {}, {daily_limit: "${ar?'حد الاسترداد اليومي':'Daily refund limit'}"})`}/></section>
</main>);
