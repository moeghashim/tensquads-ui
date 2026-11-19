import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataTable, EntityCell, PersonCell, StackCell } from '../../../packages/ui/src/react/DataTable/DataTable.tsx';
import { TensquadsRenderer } from '../../../packages/ui/src/openui/index.ts';
import '../../../packages/ui/src/fonts.css';
import '../../../packages/ui/src/tokens/tokens.css';
import '../../../packages/ui/src/styles/styles.css';
import tableEn from '../../../packages/ui/src/react/DataTable/DataTable.fixture.en.txt?raw';
import tableAr from '../../../packages/ui/src/react/DataTable/DataTable.fixture.ar.txt?raw';
import emptyEn from '../../../packages/ui/src/react/EmptyState/EmptyState.fixture.en.txt?raw';
import emptyAr from '../../../packages/ui/src/react/EmptyState/EmptyState.fixture.ar.txt?raw';
const query = new URLSearchParams(location.search);
const locale = query.get('locale') === 'ar' ? 'ar' : 'en';
document.documentElement.lang = locale;
document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
document.documentElement.dataset.theme = query.get('theme') || 'light';
const detail = 'DS / Demo store / Reach $1M in annual sales and serve every company customer worldwide';
const email = 'customer.with.a.very.long.email.address@example.com';
const billing = 'Billed monthly under the company subscription with a detailed annual renewal agreement';
function Example() {
 const [selected, select] = useState('other');
 const [selections, record] = useState(0);
 const [activations, activate] = useState(0);
 return <main><h1>DataTable live contract</h1>
 <DataTable caption="Interactive companies" selectedId={selected} onRowSelect={id => { select(id); record(n => n+1); }}
 columns={[{key:'entity',label:'Company'},{key:'controls',label:'Controls'},{key:'amount',label:'Amount',align:'end',mono:true}]}
 rows={[{id:'controls',cells:{entity:<><EntityCell initials="AC" name="Acme" detail={detail}/><PersonCell name="Maya" email={email}/><StackCell primary="$149 / mo" secondary={billing}/></>,controls:<><button type="button" onClick={()=>activate(n=>n+1)}>Open company</button><input aria-label="Company note"/></>,amount:'$149'}},{id:'other',cells:{entity:'Northstar',controls:'Read only',amount:'$79'}}]}/>
 <output aria-label="Activation count">{activations}</output><output aria-label="Selection count">{selections}</output>
 <section aria-label="Table fixture"><TensquadsRenderer locale={locale} stream={locale==='ar'?tableAr:tableEn}/></section>
 <section aria-label="Empty fixture"><TensquadsRenderer locale={locale} stream={locale==='ar'?emptyAr:emptyEn}/></section>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Example/>);
