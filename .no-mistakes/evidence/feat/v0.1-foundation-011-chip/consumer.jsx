import React from 'react';
import {createRoot} from 'react-dom/client';
import {Chip} from '../packages/ui/src/react/index.ts';
import {TensquadsRenderer} from '../packages/ui/src/openui/index.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App(){const [opened,setOpened]=React.useState([]);return <main style={{padding:24,maxWidth:'100%'}}><h1>Object attachments</h1><Chip name="customer_schema" icon={<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>} onClick={()=>setOpened(xs=>[...xs,'customer_schema'])}/><Chip name="disabled_object" icon="◇" disabled onClick={()=>setOpened(xs=>[...xs,'WRONG'])}/><Chip name="this_is_a_long_object_identifier_that_stays_visible" icon="⌕"/><output aria-label="Opened objects">{opened.join(',')}</output><section aria-label="Stream"><TensquadsRenderer stream={'root = Chip("invoice_schema", "⌕", "#invoice_schema")'}/></section></main>};
createRoot(document.getElementById('root')).render(<App/>);
