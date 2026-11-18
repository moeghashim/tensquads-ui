import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chip} from '../packages/ui/src/react/Chip/Chip';
import {TensquadsRenderer} from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const longName='customer_schema_identifier_with_all_fields_preserved_'+'abcdefghijklmnopqrstuvwxyz_'.repeat(8);
function App(){const [opened,setOpened]=useState('none');const [count,setCount]=useState(0);const open=(name)=>{setOpened(name);setCount(c=>c+1)};return <main style={{padding:24,maxWidth:800}}><h1>Attached object consumer</h1><section aria-label="React consumer"><Chip name="customer_schema" icon={<span>◇</span>} onClick={()=>open('customer_schema')}/><Chip name="disabled_schema" icon={<span>◇</span>} disabled onClick={()=>open('disabled_schema')}/><Chip name={longName} icon={<span>◇</span>} onClick={()=>open(longName)}/></section><p>Opened object: <output id="opened">{opened}</output></p><p>Opening count: <output id="count">{count}</output></p><h2>OpenUI consumer</h2><section aria-label="OpenUI consumer"><TensquadsRenderer stream={'root = Chip("customer_schema")'}/></section></main>};createRoot(document.getElementById('root')!).render(<App/>);
