import React from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart} from '../packages/ui/src/react/BarChart/BarChart';
import {EntityCell} from '../packages/ui/src/react/DataTable/DataTable';
import {ApprovalCard} from '../packages/ui/src/react/ApprovalCard/ApprovalCard';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const q=new URLSearchParams(location.search);const locale=q.get('locale')==='ar'?'ar':'en';
Object.assign(document.documentElement,{lang:locale,dir:locale==='ar'?'rtl':'ltr'}); document.documentElement.dataset.theme=q.get('theme')||'light';
const request={approvalId:'a1',action:'refund',content:'Refund order 42',contentHash:'hash-42',rule:'daily_limit',limit:20000000};
const money=(v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);
const chart=(id:string,points:any[],formatValue?:any)=><section id={id}><h2>{id}</h2><BarChart points={points} formatValue={formatValue} locale={locale}/></section>;
createRoot(document.getElementById('root')!).render(<>
<h1>Dashboard library validation</h1>
{chart('integer',[{label:'A',value:2},{label:'B',value:3},{label:'Zero',value:0}])}
{chart('stacked',[{label:'A',segments:[{key:'one',value:1},{key:'two',value:1}]},{label:'B',segments:[{key:'one',value:1},{key:'two',value:2}]}])}
{chart('decimal',[{label:'A',value:1.5},{label:'B',value:2.5}])}
{chart('currency',[{label:'A',value:6000},{label:'B',value:10000}],money)}
<section id="entities"><h2>Entities</h2>{['Blue Harbor','cedar','  North   Star  ','M'].map(name=><EntityCell key={name} name={name} detail="Synthetic company" initials="WRONG"/>)}</section>
<section id="unmapped"><h2>Unmapped approval rule</h2><ApprovalCard request={request} locale={locale}/></section>
<section id="mapped"><h2>Mapped approval rule</h2><ApprovalCard request={request} locale={locale} ruleLabels={{daily_limit:'Daily refund limit'}}/></section>
<section id="legacy"><h2>Existing Arabic OpenUI call</h2><TensquadsRenderer locale="ar" stream={'root = ApprovalCard("legacy", "refund", "استرداد الطلب", "hash", "daily_limit", 20000000, {refund: "استرداد"}, "ar")'}/></section>
<section id="extended"><h2>Extended OpenUI call</h2><TensquadsRenderer locale="ar" stream={'root = ApprovalCard("extended", "refund", "استرداد الطلب", "hash", "daily_limit", 20000000, {refund: "استرداد"}, "ar", {approve: "Allow"}, {daily_limit: "Daily refund limit"})'}/></section>
</>);
