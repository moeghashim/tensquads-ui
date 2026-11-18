import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Switch, SwitchThumb } from '../packages/ui/src/react/Switch/Switch';
import { SegmentedControl, SegmentedControlItem, SegmentedControlIndicator } from '../packages/ui/src/react/SegmentedControl/SegmentedControl';
import { TensquadsRenderer } from '../packages/ui/src/openui/TensquadsRenderer';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function States() {
 const [checked,setChecked]=useState(false); const [value,setValue]=useState('list');
 return <><form id="settings"><p>Read only <Switch aria-label="Read only" name="readonly" readOnly defaultChecked><SwitchThumb /></Switch></p><p>Disabled <Switch aria-label="Disabled" name="disabled" disabled defaultChecked><SwitchThumb /></Switch></p><p>Consent <Switch aria-label="Consent" name="consent" required checked={checked} onCheckedChange={setChecked}><SwitchThumb /></Switch></p><button type="button" onClick={()=>setChecked(!checked)}>External toggle</button><button type="submit">Submit</button></form><button id="before">Before modes</button><SegmentedControl aria-label="Modes" value={value} onValueChange={setValue}><SegmentedControlIndicator /><SegmentedControlItem value="list">List</SegmentedControlItem><SegmentedControlItem value="blocked" disabled>Blocked</SegmentedControlItem><SegmentedControlItem value="grid">Grid</SegmentedControlItem></SegmentedControl><button id="after">After modes</button><button onClick={()=>setValue('grid')}>External grid</button></>;
}
const root=createRoot(document.getElementById('root')!);
let identity=0;
window.showStates=()=>flushSync(()=>root.render(<States key={++identity}/>));
window.showStream=(stream,reset=false)=>{ if(reset)identity++;flushSync(()=>root.render(<TensquadsRenderer key={identity} stream={stream}/>)); };
window.showStates();
