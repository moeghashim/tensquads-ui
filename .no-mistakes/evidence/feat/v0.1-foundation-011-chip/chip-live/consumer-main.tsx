import React, {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Chip} from "../../../packages/ui/src/react/Chip/Chip";
import {TensquadsRenderer} from "../../../packages/ui/src/openui";
import "../../../packages/ui/src/fonts.css";
import "../../../packages/ui/src/tokens/tokens.css";
import "../../../packages/ui/src/styles/styles.css";
function App(){
 const [opened,setOpened]=useState<string[]>([]); const [destination,setDestination]=useState(location.hash);
 useEffect(()=>{const update=()=>setDestination(location.hash);window.addEventListener("hashchange",update);return()=>window.removeEventListener("hashchange",update)},[]);
 return <main><h1>Attached object consumer</h1><h2>React action</h2>
 <Chip name="invoice_schema" icon={<span>▣</span>} onClick={()=>setOpened(v=>[...v,"invoice_schema"])}/>
 <Chip name="disabled_invoice" icon="◇" disabled onClick={()=>setOpened(v=>[...v,"disabled_invoice"])}/>
 <button id="next">Next control</button>
 <output aria-label="Opened objects">{opened.join(", ") || "None"}</output>
 <h2>OpenUI stream</h2><TensquadsRenderer stream={'root = Chip("customer_schema", "⌕", "#customer_schema")'}/>
 <section id="customer_schema"><h2>Object destination</h2><output aria-label="Destination">{destination === "#customer_schema" ? "Customer schema opened" : "No destination opened"}</output></section>
 </main>
}createRoot(document.getElementById("root")!).render(<App/>);
