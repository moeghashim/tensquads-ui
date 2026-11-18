import React, {useState, Component} from 'react';
import {createRoot} from 'react-dom/client';
import * as M from '../packages/ui/src/react/index';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
document.documentElement.dir=new URLSearchParams(location.search).get('dir') || 'ltr';
document.documentElement.dataset.theme='light';
document.body.style.padding='40px';
window.events=[];
const log=(type,value,details)=>{window.events.push({type,value,reason:details?.reason,source:details?.source,hasEvent:!!details?.event});document.querySelector('#events').textContent=JSON.stringify(window.events)};
class Boundary extends Component {state={error:false};static getDerivedStateFromError(){return {error:true}}render(){return this.state.error ? <p role="alert">Invalid menu rejected</p> : this.props.children}}
function App(){
 const [open,setOpen]=useState(false);const [stream,setStream]=useState('');const [key,setKey]=useState(0);
 window.setStream=(text)=>{setStream(text);setKey(x=>x+1)};
 return <main><h1>Disposable Menu consumer</h1><pre id="events">[]</pre><button id="outside">Outside</button>
 <M.Menu open={open} onOpenChange={(v,d)=>{log('open',v,d);setOpen(v)}} onAction={(v,d)=>log('action',v,d)}>
 <M.MenuTrigger aria-label="الإجراءات" render={<button><span>⋯</span></button>}/>
 <M.MenuContent side="bottom" align="start"><M.MenuItem value="save" render={<a href="#saved"/>}>Save</M.MenuItem><M.MenuItem value="disabled" disabled>Unavailable</M.MenuItem><M.MenuSub><M.MenuSubTrigger>More</M.MenuSubTrigger><M.MenuSubContent><M.MenuItem value="archive">Archive</M.MenuItem></M.MenuSubContent></M.MenuSub></M.MenuContent></M.Menu>
 <M.Menu><M.MenuTrigger>View</M.MenuTrigger><M.MenuContent><M.MenuCheckboxItem value="toolbar" onCheckedChange={(v,d)=>log('check',v,d)}><M.MenuItemIndicator>Checked</M.MenuItemIndicator>Toolbar</M.MenuCheckboxItem><M.MenuRadioGroup defaultValue="compact" onValueChange={(v,d)=>log('radio',v,d)}><M.MenuRadioItem value="compact">Compact</M.MenuRadioItem><M.MenuRadioItem value="comfortable">Comfortable</M.MenuRadioItem></M.MenuRadioGroup></M.MenuContent></M.Menu>
 <M.Menu onAction={(v,d)=>log('context',v,d)}><M.MenuContextTrigger tabIndex={0}>File area</M.MenuContextTrigger><M.MenuContent><M.MenuItems items={[{label:'Open file',value:'open-file'}]}/></M.MenuContent></M.Menu>
 <M.Menu onAction={(v,d)=>{log('async',v,d);return new Promise(resolve=>{window.resolveAction=resolve})}}><M.MenuTrigger>Async</M.MenuTrigger><M.MenuContent><M.MenuItem value="upload">Upload</M.MenuItem></M.MenuContent></M.Menu>
 <section id="stream"><Boundary key={key}><TensquadsRenderer stream={stream} onError={(errors)=>log('errors',errors.length)}/></Boundary></section>
 </main>
}
document.addEventListener('tensquads:menu-action',e=>log('event',e.detail.value));
createRoot(document.getElementById('root')).render(<App/>);
