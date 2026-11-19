import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Card} from '../packages/ui/src/react/Card/Card';
import {PageHeader} from '../packages/ui/src/react/PageHeader/PageHeader';
import {StatTile} from '../packages/ui/src/react/StatTile/StatTile';
import {Button} from '../packages/ui/src/react/Button/Button';
import '../packages/ui/src/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
const q=new URLSearchParams(location.search), ar=q.get('locale')==='ar';
document.documentElement.lang=ar?'ar':'en'; document.documentElement.dir=ar?'rtl':'ltr'; document.documentElement.dataset.theme=q.get('theme')||'light';
function App(){const [count,setCount]=useState(0);return <main style={{padding:16}}>
<PageHeader title={ar?'نظرة عامة':'Overview'} subtitle={ar?'ملخص نشاط المتجر':'Store activity summary'} meta={ar?'بيانات تجريبية':'Demo data'} actions={<Button onClick={()=>setCount(count+1)}>{ar?'تصدير التقرير':'Export report'}</Button>}/><p role="status">{count}</p>
<Card title={ar?'الطلبات':'Orders'} subtitle={ar?'هذا الأسبوع':'This week'} count="3" legend={[{label:ar?'مكتمل':'Complete',value:'12'}]} actions={<Button onClick={()=>setCount(count+1)}>{ar?'تصفية':'Filter'}</Button>} footer={ar?'آخر ٧ أيام':'Last 7 days'}><p>{ar?'محتوى البطاقة':'Card content'}</p></Card>
<div className="ts-stat-grid">{['Revenue','Orders','Conversion','Average order','Visits','Customers'].map((label,i)=><StatTile key={label} label={ar?['الإيرادات','الطلبات','التحويل','متوسط الطلب','الزيارات','العملاء'][i]:label} value={['$24.8k','1,284','3.8%','$68.40','18.2k','936'][i]} glyph="◇" unit={i===3?'USD':undefined} delta={i===5?null:{text:['+12%','−2%','0%'][i%3],tone:['positive','negative','neutral'][i%3] as any}} foot={i===5?(ar?'لا توجد فترة سابقة':'No previous period'):undefined} series={i===5?null:i===4?[]:i===3?[1]:i===2?[5,5,5]:i===1?[-8,-3,-5]:[3,5,4,8]}/>)}</div>
</main>};createRoot(document.getElementById('root')!).render(<App/>);
