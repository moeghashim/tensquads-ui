import React, { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './package/packages/ui/dist/react/index.js';
import './package/packages/ui/dist/fonts.css';
import './package/packages/ui/dist/tokens/tokens.css';
import './package/packages/ui/dist/styles/styles.css';
import { TensquadsRenderer } from './package/packages/ui/dist/openui/index.js';
import './surface.css';
class Guard extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error: error.message }; }
  render() { return this.state.error ? h('p', {role:'alert'}, this.state.error) : this.props.children; }
}
function App() {
 const [calls,setCalls] = useState({button:0,link:0,disabled:0});
 const inc = key => setCalls(c => ({...c,[key]:c[key]+1}));
 const asyncButton = (key,render) => h(Button, {render, variant:'soft',size:'sm',pill:true, name:key, onClick:() => {inc(key);return new Promise(resolve => {window['finish'+key]=resolve;});},className:({pending})=>pending?'saving':'ready'}, key==='link'?'Save link':'Save button');
 return h('main',{}, h('h1',{},'Packed Button consumer'),h('p',{},'Native and link async actions, disabled guards, icon naming, and OpenUI errors'),
 h('section',{},asyncButton('button'),asyncButton('link',h('a',{href:'#next'})),h(Button,{disabled:true,onClick:()=>inc('disabled')},'Unavailable'),h(Button,{disabled:true,focusableWhenDisabled:true,onClick:()=>inc('disabled')},'Publish'),h(Button,{iconOnly:true,'aria-label':'Add'},'+')),
 h('output',{'aria-label':'Action counts'},JSON.stringify(calls)),h('button',{id:'after'},'After controls'),
 h('h2',{},'Missing icon name'),h(Guard,{},h(Button,{iconOnly:true},'+')),
 h('h2',{},'Invalid OpenUI argument count'),h(TensquadsRenderer,{stream:'root = Button("Save fixture", "solid", "md", false, false, "extra")',onError:errors=>{window.fixtureErrors=errors;} }));
}
createRoot(document.getElementById('root')).render(h(App));
