import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {TensquadsRenderer} from '../packages/ui/src/openui/TensquadsRenderer';
import {SegmentedControlOpenUI} from '../packages/ui/src/react/SegmentedControl/SegmentedControl.openui';
import {Switch,SwitchThumb} from '../packages/ui/src/react/Switch/Switch';
import {SegmentedControl,SegmentedControlItem,SegmentedControlIndicator} from '../packages/ui/src/react/SegmentedControl/SegmentedControl';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const root=createRoot(document.getElementById('root')!);
window.changes=[];
window.stream=(text,dir='ltr')=>{document.documentElement.dir=dir;flushSync(()=>root.render(<TensquadsRenderer stream={text}/>));};
window.valid=(data)=>SegmentedControlOpenUI.props.safeParse(data).success;
window.consumer=(checked=false)=>flushSync(()=>root.render(<form onSubmit={e=>{e.preventDefault();window.submissions=(window.submissions??0)+1}}>
<p>Consent</p><Switch aria-label="Consent" checked={checked} name="consent" value="yes" required onCheckedChange={(value,details)=>window.changes.push({value,reason:details.reason})}><SwitchThumb/></Switch>
<p>Read only</p><Switch aria-label="Read only" readOnly defaultChecked onCheckedChange={()=>window.changes.push('readOnly')}><SwitchThumb/></Switch>
<p>Disabled</p><Switch aria-label="Disabled" disabled defaultChecked><SwitchThumb/></Switch>
<p>View</p><SegmentedControl aria-label="View" defaultValue="list"><SegmentedControlIndicator/><SegmentedControlItem value="list">List</SegmentedControlItem><SegmentedControlItem value="blocked" disabled>Blocked</SegmentedControlItem><SegmentedControlItem value="grid">Grid</SegmentedControlItem></SegmentedControl>
<button type="submit">Submit</button><button type="button">After group</button>
</form>));
window.ready=true;
