import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Input, InputGroup, InputClear, Field, FieldLabel, FieldControl, FieldDescription, FieldError, FieldSet, FieldLegend, FieldGroup} from '../packages/ui/src/react/index';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
function Consumer() {
 const [stream,setStream]=useState('root = Input("Stream input", "Find", "N');
 const [fieldStream,setFieldStream]=useState('root = Field("Stream field", "query", "Find", "N');
 const [tick,setTick]=useState(0), [disabled,setDisabled]=useState(true), [value,setValue]=useState('initial'), [event,setEvent]=useState(''), [submitted,setSubmitted]=useState('');
 const record=(v,d)=>setEvent(JSON.stringify({value:v,reason:d.reason,source:d.source}));
 return <main style={{maxWidth:650,margin:'24px auto',padding:24}}>
 <h1>Input and Field local consumer</h1>
 <section aria-label="Stream checks"><h2>Incremental OpenUI</h2>
 <TensquadsRenderer stream={stream} locale={new URLSearchParams(location.search).get('locale')==='ar'?'ar':'en'}/>
 <TensquadsRenderer stream={fieldStream} locale={new URLSearchParams(location.search).get('locale')==='ar'?'ar':'en'}/>
 <button onClick={()=>{setStream('root = Input("Stream input", "Find", "Northstar")');setFieldStream('root = Field("Stream field", "query", "Find", "Northstar")')}}>Complete streams</button>
 <button onClick={()=>setTick(tick+1)}>Unrelated update {tick}</button>
 <button onClick={()=>{setStream('root = Input("Stream input", "Find", "")');setFieldStream('root = Field("Stream field", "query", "Find", "")')}}>Empty streams</button></section>
 <section aria-label="Part checks"><h2>Public parts and native props</h2>
 <InputGroup render={<section/>} data-testid="input-group" className={s=>s.filled?'filled':'empty'}><Input aria-label="Website" defaultValue="example.com" onValueChange={record}/><InputClear render={<button type="button"/>} aria-label="Clear website">Clear</InputClear></InputGroup>
 <Input aria-label="Controlled search" name="search" value={value} onValueChange={(v,d)=>{setValue(v);record(v,d)}} render={<input type="search"/>} variant="outline" maxLength={12}/>
 <output aria-label="Value event">{event}</output>
 <button onClick={()=>setDisabled(!disabled)}>Toggle address</button>
 <form id="profile" onSubmit={e=>{e.preventDefault();setSubmitted(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))))}}>
 <FieldSet disabled={disabled} render={<fieldset form="profile"/>} className={s=>s.disabled?'disabled':'enabled'}>
 <FieldLegend render={<div/>}>Address</FieldLegend><FieldDescription>Delivery address</FieldDescription><FieldGroup render={<section/>} data-testid="field-group">
 <Field name="city"><FieldLabel>City</FieldLabel><Input defaultValue="Chicago"/></Field>
 <Field name="postal"><FieldLabel>Postal code</FieldLabel><FieldControl defaultValue="60601"/></Field></FieldGroup></FieldSet>
 <Field name="email"><FieldLabel>Email</FieldLabel><Input type="email" required/><FieldDescription>Account notices</FieldDescription><FieldError match="valueMissing">Enter an email address.</FieldError><FieldError match="typeMismatch">Use a valid email address.</FieldError></Field>
 <Input aria-label="Read only" name="reference" defaultValue="fixed" readOnly/>
 <Input aria-label="Disabled" name="excluded" defaultValue="blocked" disabled/>
 <button type="submit">Submit</button><button type="reset">Reset</button>
 </form><output aria-label="Submitted values">{submitted}</output></section>
 </main>
}
createRoot(document.getElementById('root')!).render(<Consumer/>);
