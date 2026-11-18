import {createElement as h} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Switch, SwitchThumb, SegmentedControl, SegmentedControlItem, SegmentedControlIndicator} from '../packages/ui/src/react/index.ts';
import {TensquadsRenderer} from '../packages/ui/src/openui/index.ts';
import {SegmentedControlOpenUI} from '../packages/ui/src/react/SegmentedControl/SegmentedControl.openui.ts';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
document.body.style.cssText='padding:32px;background:var(--ts-canvas);color:var(--ts-ink);font-family:var(--ts-font-sans)';
let root=createRoot(document.getElementById('root')!);
window.events=[];
window.reset=()=>{flushSync(()=>root.unmount());root=createRoot(document.getElementById('root')!);window.events=[];};
window.stream=(stream)=>flushSync(()=>root.render(h(TensquadsRenderer,{stream})));
window.schema=(options,value)=>SegmentedControlOpenUI.props.safeParse({label:'View',options,value}).success;
window.mount=(kind,props={})=>flushSync(()=>root.render(h('form',{id:'case-form',onSubmit:e=>{e.preventDefault();window.events.push({submitted:[...new FormData(e.currentTarget)]});}},
 h('p',null,kind==='switch'?'Updates':'View'),
 kind==='switch'?h(Switch,{'aria-label':'Updates',name:'updates',...props,onCheckedChange:(value,d)=>window.events.push({value,reason:d.reason,cancel:typeof d.cancel})},h(SwitchThumb)):
 h(SegmentedControl,{'aria-label':'View',name:'view',...props,onValueChange:(value,d)=>window.events.push({value,reason:d.reason,cancel:typeof d.cancel})},h(SegmentedControlIndicator),...['List','Grid','Board'].map(label=>h(SegmentedControlItem,{key:label,value:label,disabled:label==='Grid',render:label==='Board'?h('button',{'data-custom':'yes'}):undefined},label))),
 h('button',{type:'submit'},'Save'))));
window.ready=true;
