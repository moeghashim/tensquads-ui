import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Input, InputGroup, InputClear, Field, FieldControl, FieldLabel, FieldDescription, FieldError, FieldSet, FieldLegend, FieldGroup} from '../packages/ui/src/react/index';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function App(){
 const [stream,setStream]=useState('root = Input("Stream search", "Find", "N');
 const [disabled,setDisabled]=useState(true);
 const [value,setValue]=useState('Initial');
 const [event,setEvent]=useState('');
 const [submitted,setSubmitted]=useState('');
 const [revision,setRevision]=useState(0);
 const params=new URLSearchParams(location.search), locale=params.get('locale')==='ar'?'ar':'en';
 (window as any).updateStream=setStream;
 (window as any).rerender=()=>setRevision(x=>x+1);
 return <main style={{maxWidth:650,margin:'40px auto',padding:16}}><h1>Input and Field live validation</h1>
 <section aria-label="Streaming"><h2>OpenUI streaming</h2><TensquadsRenderer stream={stream} locale={locale}/><span hidden>{revision}</span></section>
 <section aria-label="Compositions"><h2>Public parts</h2>
 <InputGroup render={<section />} data-testid="input-group" className={s=>s.filled?'filled':'empty'}>
 <Input aria-label="Website" name="website" variant="outline" value={value} onValueChange={(v,d)=>{setValue(v);setEvent(JSON.stringify({value:v,reason:d.reason,source:d.source}));}} render={<input type="search"/>}/>
 <InputClear aria-label="Clear website" render={<button type="button"/>}>Clear</InputClear></InputGroup><output aria-label="Value event">{event}</output>
 <button onClick={()=>setDisabled(x=>!x)}>Toggle field set</button>
 <form id="profile" onSubmit={e=>{e.preventDefault();setSubmitted(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));}}>
 <FieldSet disabled={disabled} render={<fieldset form="profile"/>} className={s=>s.disabled?'disabled':'enabled'}>
 <FieldLegend render={<div/>}>Address</FieldLegend><FieldDescription>Delivery address</FieldDescription>
 <FieldGroup render={<section/>} data-testid="field-group"><Field name="city"><FieldLabel>City</FieldLabel><Input defaultValue="Chicago"/></Field><Field name="postal"><FieldLabel>Postal code</FieldLabel><FieldControl defaultValue="60601"/></Field></FieldGroup></FieldSet>
 <button type="submit">Submit address</button></form><output aria-label="Submitted address">{submitted}</output>
 <form onSubmit={e=>e.preventDefault()}><Field name="required"><FieldLabel>Required project</FieldLabel><Input required/><FieldDescription>Name your project</FieldDescription><FieldError match="valueMissing">Project is required</FieldError></Field><button type="submit">Validate</button><button type="reset">Reset</button></form>
 </section></main>
}
createRoot(document.getElementById('root')!).render(<App/>);
