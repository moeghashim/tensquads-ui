import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chip} from '../packages/ui/src/react/Chip/Chip';
import {TensquadsRenderer} from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App(){
 const [opened,setOpened]=useState('none'); const [count,setCount]=useState(0);
 const open=()=>{setOpened('customer_schema');setCount(n=>n+1)};
 return <main><h1>Attached objects</h1><Chip name="customer_schema" icon={<span>⌕</span>} onClick={open}/><Chip name="blocked_schema" icon="◇" disabled onClick={()=>setOpened('ERROR')}/><output aria-label="Opened object">{opened}</output><output aria-label="Open count">{count}</output><h2>OpenUI stream</h2><TensquadsRenderer stream={'root = Chip("invoice_schema", "※", "#invoice_schema")'}/><section id="invoice_schema"><h2>Invoice object destination</h2></section></main>
}
createRoot(document.getElementById('root')!).render(<App/>);
