import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
for (const sub of ['tokens','react','squadmates','openui','openui/server','schemas']) {
 const name='@tensquads/ui/'+sub;
 assert.deepEqual(Object.keys(await import(name)),[]);
 console.log('Imported scaffold export: '+name+' (empty module as specified)');
}
for (const sub of ['tokens.css','styles.css']) {
 const name='@tensquads/ui/'+sub;
 const data=await readFile(new URL(import.meta.resolve(name)),'utf8');
 console.log('Resolved and read CSS export: '+name+' ('+Buffer.byteLength(data)+' bytes)');
}
for(const name of ['@tensquads/ui','@tensquads/ui/packages/ui/dist/react/index.js','@tensquads/ui/package.json']) {
 await assert.rejects(import(name),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
 console.log('Blocked undeclared import: '+name+' [ERR_PACKAGE_PATH_NOT_EXPORTED]');
}
