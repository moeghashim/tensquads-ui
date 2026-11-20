import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApprovalCard, OwnerMessageView, pendingQuestion, approvalDecisions } from '@tensquads/ui/react';
import { TensquadsRenderer } from '@tensquads/ui/openui';
import '@tensquads/ui/fonts.css';
import '@tensquads/ui/tokens.css';
import '@tensquads/ui/styles.css';
const e=React.createElement;
const at='2026-11-20T12:00:00.000Z';
const request={seq:1,at,type:'approval_request',approvalId:'disposable-approval',action:'refund',content:'Disposable refund, plain **literal** content',contentHash:'sha256:disposable',rule:'refund_limit',limit:20000000,amount:42000000,bot:'support-bot',taskId:'disposable-task'};
const messages=[
 request,
 {seq:20,at,type:'approval_decided',approvalId:request.approvalId,decision:'reject'},
 {seq:3,at,type:'approval_decided',approvalId:request.approvalId,decision:'approve'},
 {seq:4,at,type:'question',questionId:'choices',text:'Already answered choices',options:['Standard','Urgent']},
 {seq:5,at,type:'question_answered',questionId:'choices'},
 {seq:6,at,type:'question',questionId:'open',text:'Open free text',options:[]},
 {seq:7,at,type:'question',questionId:'closed',text:'Closed free text',options:[]},
 {seq:8,at,type:'question_answered',questionId:'closed'},
 {seq:9,at,type:'status',taskId:'disposable-task',bot:'support-bot',attempt:1,step:'Mapped status',since:at},
 {seq:10,at,type:'status',taskId:'disposable-task',bot:'petra',attempt:1,step:'Unmapped slug status',since:at},
 {seq:11,at,type:'reply',text:'**literal** https://example.com/order/42'},
 {seq:12,at,type:'result',taskId:'disposable-task',summary:'**result** https://example.com/result',evidence:['**evidence** https://example.com/evidence']},
 {seq:13,at,type:'future_message',payload:'Invalid message must be omitted'}
];
function App(){
 const [commands,setCommands]=React.useState([]);
 const [unknown,setUnknown]=React.useState([]);
 const onUnknown=React.useCallback(m=>setUnknown(v=>[...v,m]),[]);
 return e(React.Fragment,null,
 e('h1',null,'Disposable platform consumer'),
 e('section',{id:'conversation'},e(OwnerMessageView,{messages,approvalDecisions:{[request.approvalId]:'approve'},squadmates:{'support-bot':'petra'},actionLabels:{refund:'Refund'},onCommand:c=>setCommands(v=>[...v,c]),onUnknown})),
 e('pre',{id:'pending'},JSON.stringify(pendingQuestion(messages))),
 e('pre',{id:'decisions'},JSON.stringify(approvalDecisions(messages))),
 e('pre',{id:'unknown'},JSON.stringify(unknown)),
 e('pre',{id:'commands'},JSON.stringify(commands)),
 e('section',{id:'null-amount'},e(ApprovalCard,{request:{...request,approvalId:'unmapped',bot:'petra',amount:null},actionLabels:{refund:'Refund'}})),
 e('section',{id:'zero-amount'},e(ApprovalCard,{request:{...request,approvalId:'zero',amount:0},squadmates:{'support-bot':'rio'},ruleLabels:{refund_limit:'Refund policy'},labels:{amount:'Requested'}})),
 e('section',{id:'minimal-openui'},e(TensquadsRenderer,{stream:'root = ApprovalCard("minimal", "refund", "Optional metadata omitted", "hash")',onAction:c=>setCommands(v=>[...v,c])}))
 );
}
createRoot(document.getElementById('root')).render(e(App));
