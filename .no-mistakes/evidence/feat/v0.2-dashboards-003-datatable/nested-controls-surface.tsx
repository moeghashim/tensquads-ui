import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataTable, StackCell } from '../../packages/ui/src/react/DataTable/DataTable.tsx';
import '../../packages/ui/src/tokens/tokens.css';
import '../../packages/ui/src/styles/styles.css';
function Surface() {
 const [selected, select] = useState('other');
 const [calls, setCalls] = useState(0);
 const [opens, setOpens] = useState(0);
 return <main><h1>Interactive cell validation</h1><p role="status">Selected: {selected}; selection calls: {calls}; opened: {opens}</p><DataTable caption="Synthetic companies" columns={[{key:'company',label:'Company'},{key:'note',label:'Note'},{key:'billing',label:'Billing'}]} rows={[{id:'controls',cells:{company:<button onClick={()=>setOpens(n=>n+1)}>Open company</button>,note:<input aria-label="Company note"/>,billing:<StackCell primary="$149" secondary={'A long billing description with a complete ending visible in its title'}/>}}, {id:'other', cells:{company:'Other company',note:'',billing:''}}]} selectedId={selected} onRowSelect={id=>{select(id);setCalls(n=>n+1)}}/></main>;
}
createRoot(document.getElementById('root')!).render(<Surface/>);
