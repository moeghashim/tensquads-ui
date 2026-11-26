import React, { useState } from 'react';
import {createRoot} from 'react-dom/client';
import {createAgent} from '@ui-sdk/react/agent';
import {DateRangePicker} from '../packages/ui/src/react/DateRangePicker/DateRangePicker';
import {TensquadsRenderer} from '../packages/ui/src/openui';
import enFixture from '../packages/ui/src/react/DateRangePicker/DateRangePicker.fixture.en.txt?raw';
import arFixture from '../packages/ui/src/react/DateRangePicker/DateRangePicker.fixture.ar.txt?raw';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const initial={start:'2026-10-10',end:'2026-10-23'};
const presets=[{label:'October',value:{start:'2026-10-01',end:'2026-10-31'}},{label:'Outside bounds',value:{start:'2026-08-01',end:'2026-08-31'}}];
window.agent=createAgent();
function App(){
 const [value,setValue]=useState(initial); const [accept,setAccept]=useState(true); const [cancel,setCancel]=useState(false); const [events,setEvents]=useState([]);
 return <main style={{padding:32,maxWidth:1000}}><h1>Date range consumer validation</h1>
 <label><input id="accept" type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)}/>Accept controlled changes</label>
 <label><input id="cancel" type="checkbox" checked={cancel} onChange={e=>setCancel(e.target.checked)}/>Cancel change details</label>
 <form aria-label="Consumer form"><h2>Controlled orders</h2><DateRangePicker aria-label="Controlled orders" value={value} onValueChange={(next,details)=>{setEvents(e=>[...e,{next,reason:details.reason,source:details.source}]); if(cancel)details.cancel(); else if(accept)setValue(next)}} presets={presets} min="2026-09-01" max="2026-11-30" startName="from" endName="to"/><output id="value">{JSON.stringify(value)}</output></form>
 <h2>Uncontrolled orders</h2><form aria-label="Uncontrolled form"><DateRangePicker aria-label="Uncontrolled orders" defaultValue={initial} presets={presets} min="2026-09-01" max="2026-11-30" startName="from" endName="to"/><button type="reset">Reset dates</button></form>
 <h2>Disabled</h2><DateRangePicker aria-label="Disabled dates" disabled defaultValue={initial}/>
 <h2>Empty</h2><DateRangePicker aria-label="Empty dates" />
 <h2>English OpenUI</h2><section aria-label="English fixture"><TensquadsRenderer stream={enFixture} locale="en"/></section>
 <h2>Arabic OpenUI</h2><section aria-label="Arabic fixture" dir="rtl" lang="ar"><TensquadsRenderer stream={arFixture} locale="ar"/></section>
 <pre id="events">{JSON.stringify(events,null,2)}</pre></main>
}
createRoot(document.getElementById('root')).render(<App/>);
