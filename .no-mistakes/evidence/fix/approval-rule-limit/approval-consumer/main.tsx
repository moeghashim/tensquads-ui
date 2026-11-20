import {createRoot} from 'react-dom/client';
import {ApprovalCard} from '../packages/ui/src/react/index';
import {TensquadsRenderer} from '../packages/ui/src/openui/index';
import '../packages/ui/dist/fonts.css';
import '../packages/ui/src/tokens/tokens.css';
import '../packages/ui/src/styles/styles.css';
import './page.css';
const ar = new URLSearchParams(location.search).get('locale') === 'ar';
const locale = ar ? 'ar' : 'en';
document.documentElement.lang = locale;
document.documentElement.dir = ar ? 'rtl' : 'ltr';
document.documentElement.dataset.theme = new URLSearchParams(location.search).get('theme') || 'light';
const label = ar ? 'حد الاسترداد' : 'Refund limit';
const cases = [
 {id:'labelled',rule:'refund_limit',limit:42000000,amount:12000000,ruleLabels:{refund_limit:label}},
 {id:'unmapped',rule:'internal_rule_id',limit:42000000,amount:null,ruleLabels:{}},
 {id:'no-rule-zero',rule:null,limit:0,amount:null,ruleLabels:{},labels:{limit:ar?'السقف':'Ceiling'}},
 {id:'label-only',rule:'refund_limit',limit:null,amount:null,ruleLabels:{refund_limit:label}},
 {id:'absent',rule:null,limit:null,amount:null,ruleLabels:{}},
 {id:'unmapped-null',rule:'internal_rule_id',limit:null,amount:null,ruleLabels:{}},
];
createRoot(document.getElementById('root')!).render(<main><h1>{ar?'أمثلة طلب الموافقة':'Approval rule examples'}</h1>{['react','openui'].map(surface=><section key={surface}><h2>{surface === 'react'?'React':'OpenUI'}</h2><div className="grid">{cases.map(c=>{const request={approvalId:c.id,contentHash:'sha256:synthetic',action:'refund',content:ar?'استرداد قيمة الطلب التجريبي':'Refund synthetic demo order',bot:'test-bot',taskId:'task-demo',rule:c.rule,limit:c.limit,amount:c.amount};return <article key={c.id} data-case={`${surface}-${c.id}`}><h3>{c.id}</h3>{surface==='react'?<ApprovalCard request={request} locale={locale} actionLabels={{refund:ar?'استرداد':'Refund'}} ruleLabels={c.ruleLabels} labels={c.labels}/>:<TensquadsRenderer locale={locale} stream={`root = ApprovalCard(${[c.id,'refund',request.content,request.contentHash,c.rule,c.limit,{refund:ar?'استرداد':'Refund'},locale,c.labels??{},c.ruleLabels,c.amount,'test-bot','task-demo'].map(x=>JSON.stringify(x)).join(', ')})`}/>}</article>})}</div></section>)}</main>);
