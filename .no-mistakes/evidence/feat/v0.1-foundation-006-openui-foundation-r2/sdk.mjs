import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const log=[];
const originalRandom=Math.random;
const originalCrypto=crypto.getRandomValues;
Math.random=()=>{throw Error('startup randomness forbidden')};
crypto.getRandomValues=()=>{throw Error('startup crypto forbidden')};
let api;
try {api=await import('@tensquads/ui/openui'); log.push('Public @tensquads/ui/openui imported with Math.random and crypto.getRandomValues forbidden.');}
finally {Math.random=originalRandom;crypto.getRandomValues=originalCrypto;}
const en=api.createTensquadsLibrary('en'), ar=api.createTensquadsLibrary('ar');
assert.equal(en,api.createTensquadsLibrary('en'));assert.equal(ar,api.createTensquadsLibrary('ar'));assert.notEqual(en,ar);
assert.deepEqual(api.getRegisteredComponents().map(c=>c.name),['Example']);
log.push('English and Arabic libraries are independently cached; registry exposes Example.');
const {createParser}=await import('@openuidev/lang-core');
const parser=createParser(en.toJSONSchema());
assert.deepEqual(parser.parse('root = Example("SDK round trip")').meta.errors,[]);
assert(parser.parse('root = Example("hello", "unexpected")').meta.errors.some(e=>e.code==='excess-args'));
log.push('Generated library parses a valid Example and reports excess-args for malformed input.');
const schemas=await import('@tensquads/ui/schemas');
for(const [name,valid,invalid] of [['LocaleSchema',['en','ar'],['fr','EN','',null]],['DirectionSchema',['ltr','rtl'],['left','RTL',0]],['AgentSlugSchema',['petra','pisa','kyoto','rio','zurich','giza','machu','angkor','delphi','sydney','greenwich','alexandria','venice'],['unknown','Petra',null]],['AgentStateSchema',['blocked','checking','done','dropped','escalated','idle','planning','running','sentback','waiting'],['finished','RUNNING',null]]]) {
for(const value of valid) assert.equal(schemas[name].parse(value),value);
for(const value of invalid) assert.equal(schemas[name].safeParse(value).success,false);
log.push(`${name}: accepted contract values and rejected unsupported/case-mismatched/wrong-type inputs.`);
}
await writeFile('~/.no-mistakes/evidence/01M7P6ZFRFASWJ737ZXMFT71EQ/sdk.txt',log.join('\n')+'\n');
console.log(log.join('\n'));
