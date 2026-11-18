import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chip } from '../packages/ui/src/react/Chip/Chip';
import { TensquadsRenderer } from '../packages/ui/src/openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function Consumer() {
 const [opened, setOpened] = useState<string[]>([]);
 const open = () => setOpened(previous => [...previous, 'customer_schema']);
 return <><h1>Attached object consumer</h1><Chip name="customer_schema" icon={<svg viewBox="0 0 16 16"><path d="M2 2h12v12H2z" fill="currentColor" /></svg>} onClick={open} /><Chip name="unavailable_schema" icon={<span>◇</span>} disabled onClick={open} /><Chip name="linked_schema" icon={<span>◇</span>} render={<a href="#object-details" />} /><Chip name={'schema_' + 'long_identifier_'.repeat(20)} icon={<span>◇</span>} onClick={open} /><h2 id="object-details">Object details</h2><output aria-label="Opened objects">{JSON.stringify(opened)}</output><h2>Stream consumer</h2><TensquadsRenderer stream={'root = Chip("customer_schema")'} locale="en" /></>;
}
createRoot(document.getElementById('root')!).render(<Consumer />);
