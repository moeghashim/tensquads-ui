import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chip } from '../packages/ui/src/react/Chip/Chip';
import { TensquadsRenderer } from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function Consumer() {
 const [opened, setOpened] = useState<string[]>([]);
 return <main><h1>Object attachments</h1><section style={{maxWidth: '300px'}}>
 <Chip name="customer_schema" icon={<span>§</span>} onClick={() => setOpened(x => [...x, 'customer_schema'])}/>
 <Chip name="locked_schema" icon={<span>§</span>} disabled onClick={() => setOpened(x => [...x, 'locked_schema'])}/>
 <Chip name={'customer_schema_'.repeat(20)} icon={<span>§</span>} onClick={() => setOpened(x => [...x, 'long_schema'])}/>
 <output style={{display: "block", overflowWrap: "anywhere"}} aria-label="Opened objects">{JSON.stringify(opened)}</output>
 </section><TensquadsRenderer stream={'root = Chip("invoice_schema", "⌕", "#invoice_schema")'}/><h2 id="invoice_schema">Invoice object</h2></main>
}
createRoot(document.getElementById('root')!).render(<Consumer/>);
