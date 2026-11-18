import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow, TooltipShortcut } from '../packages/ui/src/react/Tooltip/Tooltip';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App() {
 const [open, setOpen] = useState(false);
 const [events, setEvents] = useState<string[]>([]);
 return <main style={{padding: '100px', display:'flex',gap:'40px',flexWrap:'wrap'}}>
 <Tooltip delay={600} closeDelay={300}><TooltipTrigger>Delayed help</TooltipTrigger><TooltipContent>Delayed explanation<TooltipArrow/></TooltipContent></Tooltip>
 <Tooltip disabled><TooltipTrigger>Disabled help</TooltipTrigger><TooltipContent>Must remain hidden</TooltipContent></Tooltip>
 <Tooltip open={open} onOpenChange={(v,d)=>{setOpen(v);setEvents(e=>[...e,`${v}:${d.reason}`]);}} shortcut="mod+k"><TooltipTrigger render={(props,state)=><button {...props} data-render-open={String(state.open)}>Controlled help</button>}/><TooltipContent render={<aside/>}>Controlled explanation<TooltipArrow/><TooltipShortcut/></TooltipContent></Tooltip>
 <Tooltip toggleable><TooltipTrigger>Touch help</TooltipTrigger><TooltipContent>Touch explanation</TooltipContent></Tooltip>
 <button onClick={()=>setOpen(true)}>Open controlled state</button><button onClick={()=>setOpen(false)}>Close controlled state</button>
 <output aria-label="Open events">{events.join(',')}</output>
 <Tooltip defaultOpen><TooltipTrigger style={{position:'fixed',top:'2px',left:'50%'}}>Edge help</TooltipTrigger><TooltipContent side="top">Flipped explanation<TooltipArrow/></TooltipContent></Tooltip>
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
