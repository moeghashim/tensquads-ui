import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {TensquadsRenderer} from '../packages/ui/src/openui/TensquadsRenderer';
import {Switch,SwitchThumb} from '../packages/ui/src/react/Switch/Switch';
import {SegmentedControl,SegmentedControlItem,SegmentedControlIndicator} from '../packages/ui/src/react/SegmentedControl/SegmentedControl';
import {SegmentedControlOpenUI} from '../packages/ui/src/react/SegmentedControl/SegmentedControl.openui';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const root=createRoot(document.getElementById('root')!);
window.events=[];
window.renderStream=(stream,dir='ltr')=>{document.documentElement.dir=dir;flushSync(()=>root.render(<TensquadsRenderer stream={stream}/>));};
window.reset=()=>flushSync(()=>root.render(null));
window.validate=(options,value)=>SegmentedControlOpenUI.props.safeParse({label:'View',options,value}).success;
window.renderControls=(checked=false,dir='ltr')=>{document.documentElement.dir=dir;flushSync(()=>root.render(<>
<h2>Switch guards and controlled state</h2><form id="consent"><Switch aria-label="Consent" name="consent" value="yes" required checked={checked} onCheckedChange={(value,details)=>window.events.push({value,reason:details.reason})}><SwitchThumb/></Switch></form>
<Switch aria-label="Read only" readOnly defaultChecked onCheckedChange={()=>window.events.push('readonly')}><SwitchThumb/></Switch>
<Switch aria-label="Disabled" disabled defaultChecked onCheckedChange={()=>window.events.push('disabled')}><SwitchThumb/></Switch>
<h2>Segmented navigation</h2><SegmentedControl aria-label="Modes" defaultValue="List"><SegmentedControlIndicator/><SegmentedControlItem value="List">List</SegmentedControlItem><SegmentedControlItem value="Board" disabled>Board</SegmentedControlItem><SegmentedControlItem value="Grid">Grid</SegmentedControlItem></SegmentedControl><button>After group</button>
</>));};
