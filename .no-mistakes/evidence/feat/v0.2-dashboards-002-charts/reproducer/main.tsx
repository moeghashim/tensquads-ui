import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart} from '../packages/ui/src/react/BarChart/BarChart.tsx';
import {Bars} from '../packages/ui/src/react/Bars/Bars.tsx';
import {Distribution} from '../packages/ui/src/react/Distribution/Distribution.tsx';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
import './style.css';
function App(){ const [count,setCount]=useState(14); return <main>
<h1>Live dashboard chart regression examples</h1><p>Disposable synthetic measurements, rendered with the real library components.</p>
<section id="scalar"><h2>Zero and fractional scalar revenue</h2><BarChart points={[{label:'Zero',value:0},{label:'Quarter',value:.25},{label:'Half',value:.5}]} /></section>
<section id="stacked"><h2>Fractional stacked revenue</h2><BarChart points={[{label:'Quarter',segments:[{key:'a',value:.1},{key:'b',value:.15},{key:'c',value:0}]},{label:'Half',value:.5}]} keys={[{key:'a',label:'A',tone:'muted'},{key:'b',label:'B',tone:'strong'}]}/></section>
<section id="odd"><h2>Odd count axis and highlight range</h2><BarChart points={[{label:'Two',value:2},{label:'Three',value:3},{label:'One',value:1}]} highlight={[0,1]}/></section>
<section id="dynamic" dir="rtl" lang="ar"><h2>Nested RTL and changing time range</h2><button onClick={()=>setCount(7)}>Seven days</button><button onClick={()=>setCount(0)}>Empty</button><button onClick={()=>setCount(3)}>Three days</button><BarChart locale="ar" points={Array.from({length:count},(_,i)=>({label:`Day ${i+1}`,value:i+1}))}/></section>
<section id="ranked"><h2>Ranked fractional durations</h2><Bars rows={[{label:'Quarter',value:.25,display:'0.25 s'},{label:'Half',value:.5,display:'0.5 s'},{label:'Zero',value:0,display:'0 s'}]}/></section>
<section id="progress"><h2>Progress plans and eight-row limit</h2><Bars style="progress" rows={Array.from({length:10},(_,i)=>({label:`Plan ${i+1}`,value:i+1,display:`${i+1} companies`,tone:i===9?'info':undefined}))} caption="Synthetic plan counts"/></section>
<section id="distribution-en"><h2>Seven parts fold into Other</h2><Distribution parts={[7,6,5,4,3,2,1].map((value,i)=>({label:`Part ${i+1}`,value}))}/></section>
<section id="distribution-ar" dir="rtl" lang="ar"><h2>سبعة أجزاء</h2><Distribution locale="ar" parts={[7,6,5,4,3,2,1].map((value,i)=>({label:`جزء ${i+1}`,value}))}/></section>
<section id="zeros"><h2>Empty and all-zero inputs</h2><Bars rows={[{label:'None',value:0,display:'0'}]}/><Distribution parts={[{label:'None',value:0}]}/><BarChart points={[]}/></section>
</main>}; createRoot(document.getElementById('root')!).render(<App/>);
