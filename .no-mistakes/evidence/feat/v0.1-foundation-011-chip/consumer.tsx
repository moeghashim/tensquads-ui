import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chip} from '../packages/ui/src/react/Chip/Chip';
import {TensquadsRenderer} from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function Consumer() {
 const [opened,setOpened]=useState(0);
 return <><h1>Attached objects</h1><section aria-label="React consumer"><Chip name="customer_schema" icon={<span>⌕</span>} onClick={()=>setOpened(n=>n+1)}/><Chip name="locked_schema" icon="◇" disabled onClick={()=>setOpened(n=>n+100)}/><Chip name={'customer_'+ 'account_'.repeat(18)+'schema'} icon="◇" /></section><p role="status">Opened {opened} times</p>{opened>0&&<section aria-label="Object details"><h2>Customer schema</h2><p>Consumer opened the attached object.</p></section>}<h2>OpenUI consumer</h2><TensquadsRenderer stream={'root = Chip("customer_schema", "⌕", "#customer-details")'}/><section id="customer-details"><h2>Customer destination</h2><p>Destination supplied by the consumer.</p></section></>;
}
createRoot(document.getElementById('root')!).render(<Consumer/>);
