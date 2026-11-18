import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Switch, SwitchThumb } from '../packages/ui/src/react/Switch/Switch';
import { SegmentedControl, SegmentedControlItem, SegmentedControlIndicator } from '../packages/ui/src/react/SegmentedControl/SegmentedControl';
import { TensquadsRenderer } from '../packages/ui/src/openui';
import { SegmentedControlOpenUI } from '../packages/ui/src/react/SegmentedControl/SegmentedControl.openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const root = createRoot(document.getElementById('root')!);
const events:any[]=[];
function Wrapper({checked=false,value='list'}:{checked?:boolean,value?:string}) {return <main>
<form id="controls" onSubmit={e=>{e.preventDefault();events.push({submit:true})}}>
<p>Read only <Switch aria-label="Read only" readOnly defaultChecked name="readonly"><SwitchThumb/></Switch></p>
<p>Unavailable <Switch aria-label="Unavailable" disabled defaultChecked name="disabled"><SwitchThumb/></Switch></p>
<p>Consent <Switch aria-label="Consent" name="consent" required checked={checked} render={<div data-custom="switch"/>} onCheckedChange={(next,details)=>events.push({next,reason:details.reason})}><SwitchThumb/></Switch></p>
<SegmentedControl aria-label="View" name="view" value={value} onValueChange={(next,details)=>events.push({next,reason:details.reason})}>
<SegmentedControlIndicator/><SegmentedControlItem value="list" render={<div data-custom="item"/>}>List</SegmentedControlItem><SegmentedControlItem value="grid">Grid</SegmentedControlItem><SegmentedControlItem value="board" disabled>Board</SegmentedControlItem></SegmentedControl>
<SegmentedControl aria-label="Navigation" defaultValue="list"><SegmentedControlIndicator/><SegmentedControlItem value="list">List</SegmentedControlItem><SegmentedControlItem value="grid">Grid</SegmentedControlItem><SegmentedControlItem value="board" disabled>Board</SegmentedControlItem></SegmentedControl>
<button type="submit">Submit</button>
</form></main>}
Object.assign(window,{events,wrapper:(props:any)=>flushSync(()=>root.render(<Wrapper {...props}/>)),stream:(text:string)=>flushSync(()=>root.render(<TensquadsRenderer stream={text}/>)),clear:()=>flushSync(()=>root.render(null)),schema:(props:any)=>SegmentedControlOpenUI.props.safeParse(props).success});
(window as any).wrapper({});
