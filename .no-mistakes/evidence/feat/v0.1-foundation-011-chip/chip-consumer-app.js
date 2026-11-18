import React, {createElement as h, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Chip} from '../packages/ui/src/react/Chip/Chip.tsx';
import {TensquadsRenderer} from '../packages/ui/src/openui/index.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const objectName = 'customer_schema';
function App() {
 const [opened, setOpened] = useState([]);
 const open = () => setOpened(items => [...items, objectName]);
 return h('main', {style:{padding:24}},
 h('h1', null, 'Chip consumer verification'),
 h('section', {'aria-label':'React consumer'}, h('h2',null,'React attached object'),
 h(Chip, {name:objectName, icon:h('svg',{'data-object-icon':'customer',viewBox:'0 0 16 16'},h('path',{d:'M2 2h12v12H2z',fill:'currentColor'})), onClick:open}),
 h(Chip, {name:'disabled_object',icon:h('span',null,'D'),disabled:true,onClick:open}),
 h(Chip, {name:'linked_schema',icon:h('span',null,'L'),render:h('a',{href:'#linked-object'})})),
 h('section', {'aria-label':'OpenUI consumer'},h('h2',null,'Stream attached object'),h(TensquadsRenderer,{stream:'root = Chip("customer_schema")',locale:'en'})),
 h('section', {'aria-label':'Opened object'},h('h2',null,'Opened object'),h('output',{'aria-label':'Object openings'},JSON.stringify(opened))),
 h('section', {id:'linked-object'},h('h2',null,'Linked object')));
}
createRoot(document.getElementById('root')).render(h(App));
