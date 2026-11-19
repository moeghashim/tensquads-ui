import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart, EntityCell, ApprovalCard} from '../../packages/ui/src/react/index.ts';
import {TensquadsRenderer} from '../../packages/ui/src/openui/index.ts';
import '../../packages/ui/src/fonts.css';
import '../../packages/ui/src/tokens/tokens.css';
import '../../packages/ui/src/styles/styles.css';
const params=new URLSearchParams(location.search);
const locale=params.get('locale')==='ar'?'ar':'en';
document.documentElement.lang=locale;
document.documentElement.dir=locale==='ar'?'rtl':'ltr';
document.documentElement.dataset.theme=params.get('theme')||'light';
const request={approvalId:'a1',action:'refund',content:'Refund order 42',contentHash:'hash-42',rule:'internal_daily_rule',limit:20000000};
function App(){const [commands,setCommands]=useState<unknown[]>([]);const record=(command:unknown)=>{setCommands(old=>[...old,command]);};return <main>
<h1>Dashboard library validation</h1>
<section id="charts"><h2>Counts, stacks, fractional values and currency</h2>
<div id="counts"><BarChart points={[{label:'A',value:2},{label:'B',value:3},{label:'Zero',value:0}]}/></div>
<div id="stacked"><BarChart points={[{label:'A',segments:[{key:'one',value:1},{key:'two',value:1}]},{label:'B',segments:[{key:'one',value:1},{key:'two',value:2}]}]} keys={[{key:'one',label:'One',tone:'muted'},{key:'two',label:'Two',tone:'strong'}]}/></div>
<div id="fraction"><BarChart points={[{label:'Half',value:0.5},{label:'One and half',value:1.5}]}/></div>
<div id="currency"><BarChart points={[{label:'A',value:6000},{label:'B',value:10000}]} formatValue={value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value)}/></div>
<div id="long"><BarChart points={Array.from({length:15},(_,index)=>({label:`Day ${index+1}`,value:index+1}))}/></div></section>
<section id="entities"><h2>Derived initials with stale caller initials</h2>{['  acme   studio  ','northstar','a','متجر النور'].map(name=><div key={name}><EntityCell name={name} initials="WRONG" detail="Synthetic company"/></div>)}</section>
<section id="approvals"><h2>Human readable approval labels</h2>
<div id="hidden-rule"><ApprovalCard request={request} locale={locale} actionLabels={{refund:'Refund'}} onDecision={record}/></div>
<div id="mapped-rule"><ApprovalCard request={{...request,approvalId:'mapped'}} locale={locale} ruleLabels={{internal_daily_rule:locale==='ar'?'حد الاسترداد اليومي':'Daily refund limit'}} onDecision={record}/></div>
<div id="no-limit"><ApprovalCard request={{...request,approvalId:'no-limit',limit:null}} locale={locale}/></div>
<div id="openui"><TensquadsRenderer locale={locale} stream={`root = ApprovalCard("stream", "refund", "Streamed refund", "hash-stream", "internal_daily_rule", 20000000, {}, "${locale}", {approve: "Allow", decline: "Deny"}, {internal_daily_rule: "Daily refund limit"})`} onAction={record}/></div>
<output id="commands">{JSON.stringify(commands)}</output></section>
</main>};
createRoot(document.getElementById('root')!).render(<App/>);
