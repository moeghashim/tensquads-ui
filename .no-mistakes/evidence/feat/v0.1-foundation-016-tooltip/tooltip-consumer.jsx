import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
import {Tooltip, TooltipTrigger, TooltipContent, TooltipArrow} from '../packages/ui/src/react/Tooltip/Tooltip.tsx';
import {Button} from '../packages/ui/src/react/Button/Button.tsx';
function App(){
 const [open,setOpen]=useState(false); const [presses,setPresses]=useState(0);
 return <main style={{padding:32,display:'grid',gap:80}}><h1>Tooltip consumer validation</h1>
 <section aria-label="Disabled tooltip"><Tooltip disabled><TooltipTrigger render={<Button onClick={()=>setPresses(x=>x+1)}/>}>Run action</TooltipTrigger><TooltipContent>Disabled hint</TooltipContent></Tooltip><output>Actions: {presses}</output></section>
 <section aria-label="Touch tooltip"><Tooltip toggleable><TooltipTrigger render={<Button/>}>Touch help</TooltipTrigger><TooltipContent>Touch explanation</TooltipContent></Tooltip></section>
 <section aria-label="Controlled tooltip"><Tooltip open={open} onOpenChange={setOpen}><TooltipTrigger render={<Button/>}>Controlled help</TooltipTrigger><TooltipContent>Controlled explanation<TooltipArrow/></TooltipContent></Tooltip><output>{open?'Open':'Closed'}</output></section>
 <section aria-label="Edge placement" style={{position:'fixed',top:4,right:4}}><Tooltip delay={0}><TooltipTrigger render={<Button/>}>Edge help</TooltipTrigger><TooltipContent side="top">Tooltip stays inside the viewport<TooltipArrow/></TooltipContent></Tooltip></section>
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
