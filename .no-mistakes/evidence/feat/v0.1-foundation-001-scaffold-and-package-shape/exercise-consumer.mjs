import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const forbidden = () => { throw new Error('module startup invoked randomness or a timer'); };
Math.random = forbidden;
globalThis.setTimeout = forbidden;
globalThis.setInterval = forbidden;
if (globalThis.crypto) {
 Object.defineProperty(globalThis.crypto, 'randomUUID', {value: forbidden});
 Object.defineProperty(globalThis.crypto, 'getRandomValues', {value: forbidden});
}
for (const subpath of ['tokens','react','squadmates','openui','openui/server','schemas']) {
 const name = '@tensquads/ui/' + subpath;
 const value = await import(name);
 assert.deepEqual(Object.keys(value), []);
 console.log('Imported empty scaffold entrypoint without startup randomness/timers: ' + name);
}
for (const subpath of ['tokens.css','styles.css']) {
 const resolved = import.meta.resolve('@tensquads/ui/' + subpath);
 const content = await readFile(new URL(resolved), 'utf8');
 assert.equal(typeof content, 'string');
 console.log('Resolved and read published CSS asset: @tensquads/ui/' + subpath + ' (' + Buffer.byteLength(content) + ' bytes)');
}
for (const specifier of ['@tensquads/ui','@tensquads/ui/packages/ui/src/react/index.ts','@tensquads/ui/package.json','@tensquads/ui/unknown']) {
 await assert.rejects(import(specifier), {code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'});
 console.log('Rejected non-public package entrypoint: ' + specifier);
}
