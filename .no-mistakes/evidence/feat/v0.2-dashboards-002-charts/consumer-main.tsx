import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Bars, Distribution, Card } from '../packages/ui/src/react/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App() {
 const q = new URLSearchParams(location.search), ar = q.get('locale') === 'ar';
 const [n, setN] = useState(14);
 document.documentElement.dataset.theme=q.get('theme') || 'light';
 return <main style={{padding:24,maxWidth:1000,margin:'auto'}}>
 <h1>Chart public API regression consumer</h1><button onClick={()=>setN(7)}>Use seven days</button>
 <section id="dynamic" dir={ar?'rtl':'ltr'}><h2>Keyboard and inherited direction</h2><BarChart points={Array.from({length:n},(_,i)=>({label:`Day ${i+1}`,value:i+1}))}/></section>
 <section id="long" dir={ar?'rtl':'ltr'}><h2>Thirty daily counts</h2><BarChart points={Array.from({length:30},(_,i)=>({label:`D${i+1}`,value:i+1}))} highlight={[5,9]}/></section>
 <section id="fraction"><h2>Fractional revenue and zero</h2><BarChart points={[{label:'Zero',value:0},{label:'Quarter',value:0.25},{label:'Half',value:0.5}]}/></section>
 <section id="stacked"><h2>Fractional stacked revenue</h2><BarChart points={[{label:'Stack',segments:[{key:'a',value:0.1},{key:'b',value:0.4},{key:'z',value:0}]},{label:'Whole',value:1}]}/></section>
 <section id="odd"><h2>Odd maximum counts</h2><BarChart points={[{label:'Two',value:2},{label:'Three',value:3}]}/></section>
 <section id="bars"><h2>Fractional durations</h2><Bars rows={[{label:'Quarter',value:0.25,display:'0.25 s'},{label:'Half',value:0.5,display:'0.5 s'},{label:'Zero',value:0,display:'0 s'}]}/></section>
 <section id="distribution" dir={ar?'rtl':'ltr'}><h2>Seven categories with folding</h2><Distribution locale={ar?'ar':'en'} parts={Array.from({length:7},(_,i)=>({label:ar?`فئة ${i+1}`:`Category ${i+1}`,value:7-i}))}/></section>
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
