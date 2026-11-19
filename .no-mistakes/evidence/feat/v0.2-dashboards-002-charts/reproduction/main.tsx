import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart} from '../packages/ui/src/react/BarChart/BarChart';
import {Bars} from '../packages/ui/src/react/Bars/Bars';
import {Distribution} from '../packages/ui/src/react/Distribution/Distribution';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
import './page.css';
function App(){
 const [n,setN]=useState(14);
 const q=new URLSearchParams(location.search), ar=q.get('locale')==='ar';
 document.documentElement.dataset.theme=q.get('theme')||'light';
 document.documentElement.dir=ar?'rtl':'ltr'; document.documentElement.lang=ar?'ar':'en';
 const locale=ar?'ar':'en';
 return <main><h1>Disposable real-component chart validation</h1><button id="shrink" onClick={()=>setN(7)}>Shrink to seven</button>
 <section id="series"><h2>Keyboard and cadence: {n} days</h2><BarChart points={Array.from({length:n},(_,i)=>({label:`D${i+1}`,value:i+1}))} locale={locale}/></section>
 <section id="long"><h2>Thirty days: every fifth date</h2><BarChart points={Array.from({length:30},(_,i)=>({label:`D${i+1}`,value:i%3+1}))}/></section>
 <section id="fraction"><h2>Fractions and zero</h2><BarChart points={[{label:'Zero',value:0},{label:'Quarter',value:.25},{label:'Half',value:.5}]}/></section>
 <section id="stacked"><h2>Stack fractions</h2><BarChart points={[{label:'Split',segments:[{key:'a',value:.25},{key:'b',value:.5},{key:'c',value:0}]}]} keys={[{key:'a',label:'A',tone:'muted'},{key:'b',label:'B',tone:'strong'},{key:'c',label:'Zero',tone:'success'}]}/></section>
 <section id="range"><h2>Inclusive highlight range</h2><BarChart points={[{label:'D1',value:2},{label:'D2',value:3},{label:'D3',value:1}]} highlight={[0,1]}/></section>
 <section id="bars"><h2>Fractional magnitude ranking</h2><Bars rows={[{label:'Quarter',value:.25,display:'0.25 s'},{label:'Zero',value:0,display:'0 s'},{label:'Half',value:.5,display:'0.5 s'}]}/></section>
 <section id="distribution"><h2>Seven parts folded to six</h2><Distribution locale={locale} parts={Array.from({length:7},(_,i)=>({label:ar?`فئة ${i+1}`:`Category ${i+1}`,value:7-i}))}/></section>
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
