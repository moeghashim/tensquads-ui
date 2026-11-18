import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import {Switch,SwitchThumb,SegmentedControl,SegmentedControlItem,SegmentedControlIndicator} from '../packages/ui/src/react/index';
import {SegmentedControlOpenUI} from '../packages/ui/src/react/SegmentedControl/SegmentedControl.openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const root=createRoot(document.getElementById('app')!);
let revision=0;
window.events=[];
window.stream=(stream:string,reset=false)=> {if(reset)revision++;flushSync(()=>root.render(<TensquadsRenderer key={revision} stream={stream}/>));};
window.schema=(options:string[],value?:string)=>SegmentedControlOpenUI.props.safeParse({label:'View',options,value}).success;
window.controls=(checked=false,value='list')=> {flushSync(()=>root.render(<form id="consumer" onSubmit={e=>{e.preventDefault();window.events.push({submit:[...new FormData(e.currentTarget)]});}}>
<p><label>Consent <Switch aria-label="Consent" name="consent" value="yes" required checked={checked} onCheckedChange={(value,details)=>window.events.push({value,reason:details.reason,source:details.source})}><SwitchThumb/></Switch></label></p>
<p><label>Read only <Switch aria-label="Read only" name="readonly" defaultChecked readOnly onCheckedChange={()=>window.events.push({bad:'readonly'})}><SwitchThumb/></Switch></label></p>
<p><label>Disabled <Switch aria-label="Disabled" name="disabled" disabled defaultChecked><SwitchThumb/></Switch></label></p>
<p><Switch aria-label="Rendered switch" render={<div data-render="switch"/>}><SwitchThumb/></Switch></p>
<SegmentedControl aria-label="Modes" name="mode" value={value} onValueChange={(value,details)=>window.events.push({value,reason:details.reason,source:details.source})}>
<SegmentedControlIndicator/><SegmentedControlItem value="list">List</SegmentedControlItem><SegmentedControlItem value="grid" render={<button type="button" data-render="item"/>}>Grid</SegmentedControlItem><SegmentedControlItem value="board" disabled>Board</SegmentedControlItem></SegmentedControl>
<button type="submit">Save</button><button type="button">After</button>
</form>));};
window.uncontrolled=()=>{revision++;flushSync(()=>root.render(<form key={revision} id="consumer" onSubmit={e=>{e.preventDefault();window.events.push({submit:[...new FormData(e.currentTarget)]});}}><button type="button">Before</button><SegmentedControl aria-label="Modes" name="mode" defaultValue="list" onValueChange={(value,details)=>window.events.push({value,reason:details.reason,source:details.source})}><SegmentedControlIndicator/><SegmentedControlItem value="list">List</SegmentedControlItem><SegmentedControlItem value="grid">Grid</SegmentedControlItem><SegmentedControlItem value="board" disabled>Board</SegmentedControlItem></SegmentedControl><button type="submit">Save</button><button type="reset">Reset</button></form>));};
window.ready=true;
