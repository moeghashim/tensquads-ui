import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sidebar, SidebarBrand, SidebarItem, SidebarSection, SidebarUser} from '../../packages/ui/src/react/Sidebar/Sidebar';
import '../../packages/ui/src/fonts.css';
import '../../packages/ui/src/tokens/tokens.css';
import '../../packages/ui/src/styles/styles.css';
import './style.css';
function App() {
 const [active, setActive] = useState(true);
 const [calls, setCalls] = useState(0);
 const [finish, setFinish] = useState<(() => void) | null>(null);
 function save(event: React.MouseEvent) {event.preventDefault(); setCalls(n => n + 1); return new Promise<void>(resolve => setFinish(() => resolve));}
 const icon = <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor"/></svg>;
 return <><h1>Sidebar consumer regression</h1><div className="layout"><Sidebar label="Consumer navigation">
 <SidebarBrand icon={icon} title="Platform admin" subtitle="Synthetic test account"/>
 <SidebarSection label="Actions"><SidebarItem icon={icon} active={active} onClick={save} className={({pending}) => pending ? 'saving' : 'ready'}>Save button</SidebarItem>
 <SidebarItem icon={icon} active={!active} render={<a href="#saved"/>} onClick={save} className={({pending}) => pending ? 'saving' : 'ready'}>Save link</SidebarItem>
 <SidebarItem icon={icon} disabled render={<a href="#forbidden"/>} onClick={() => setCalls(n => n + 100)}>Unavailable</SidebarItem></SidebarSection>
 <SidebarUser initials="QA" name="Test account" userRole="Reviewer"/></Sidebar><main><button onClick={() => setActive(v => !v)}>Switch current page</button><button onClick={() => {finish?.(); setFinish(null);}}>Complete action</button><output aria-label="Action calls">{calls}</output><p>Disposable synthetic host using the public Sidebar components.</p></main></div></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
