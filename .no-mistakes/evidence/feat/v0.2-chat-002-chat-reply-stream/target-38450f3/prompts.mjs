import {buildSystemPrompt} from '@tensquads/ui/openui/server';
import {createTensquadsLibrary} from '@tensquads/ui/openui';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='~/.no-mistakes/evidence/01M7RCJYCNAFA7FG3E3MGJ80MJ/target-38450f3';
const results=[];
for(const locale of ['en','ar']){
 const library=createTensquadsLibrary(locale);
 const ui=buildSystemPrompt({library,locale});
 assert.equal(ui,buildSystemPrompt({library,locale,mode:'ui'}));
 const chat=buildSystemPrompt({library,locale,mode:'chat'});
 assert.notEqual(chat,ui);
 const example=locale==='en'?'Here is the current status.\n\n```openui\nroot = Badge("Ready", "success")\n```\n\nI can help with the next step.':'هذه هي الحالة الحالية.\n\n```openui\nroot = Badge("جاهز", "success")\n```\n\nيمكنني مساعدتك في الخطوة التالية.';
 assert.ok(chat.includes(example));
 assert.ok(chat.includes(locale==='en'?'close every block':'أغلق كل كتلة'));
 await writeFile(`${out}/prompt-chat-${locale}.txt`,chat);
 await writeFile(`${out}/prompt-ui-${locale}.txt`,ui);
 results.push({locale,defaultMatchesExplicitUi:true,localizedMixedExample:true,closeFenceInstruction:true});
}
await writeFile(`${out}/prompt-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
