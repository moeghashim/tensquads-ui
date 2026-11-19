import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart} from '../packages/ui/src/react/BarChart/BarChart';
import {Bars} from '../packages/ui/src/react/Bars/Bars';
import {Distribution} from '../packages/ui/src/react/Distribution/Distribution';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App(){const [count,setCount]=useState(14);const params=new URLSearchParams(location.search);const ar=params.get('locale')==='ar';document.documentElement.dataset.theme=params.get('theme')||'light';document.body.style.background='var(--ts-canvas)';document.body.style.fontFamily='var(--ts-font-sans)';
return <main style={{padding:16,maxWidth:720,margin:'auto',color:'var(--ts-text)',background:'var(--ts-canvas)'}} dir={ar?'rtl':'ltr'}>
<h1>Chart contract playground</h1><button onClick={()=>setCount(14)}>14 days</button><button onClick={()=>setCount(15)}>15 days</button><button onClick={()=>setCount(30)}>30 days</button><button onClick={()=>setCount(7)}>7 days</button>
<section id="time"><h2>Daily totals</h2><BarChart locale={ar?'ar':'en'} points={Array.from({length:count},(_,i)=>({label:`Day ${i+1}`,value:i+1}))} highlight={[2,4]}/></section>
<section id="fractional"><h2>Fractional and zero values</h2><BarChart points={[{label:'Zero',value:0},{label:'Quarter',value:.25},{label:'Half',value:.5}]}/></section>
<section id="ranked"><h2>Fractional durations</h2><Bars rows={[{label:'Short',value:.25,display:'0.25 s'},{label:'Long',value:.5,display:'0.5 s'}]}/></section>
<section id="parts"><h2>Seven categories</h2><Distribution locale={ar?'ar':'en'} parts={Array.from({length:7},(_,i)=>({label:ar?`فئة ${i+1}`:`Category ${i+1}`,value:7-i}))}/></section></main>}
createRoot(document.getElementById('root')!).render(<App/>);
