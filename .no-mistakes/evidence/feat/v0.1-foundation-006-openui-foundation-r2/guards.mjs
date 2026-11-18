import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root='.phase-test/docs-sandbox';
await mkdir(`${root}/scripts`,{recursive:true});
await mkdir(`${root}/packages/ui/src/react/Example`,{recursive:true});
await copyFile('scripts/build-llms.mjs',`${root}/scripts/build-llms.mjs`);
for(const file of ['Example.md','Example.openui.ts']) await copyFile(`packages/ui/src/react/Example/${file}`,`${root}/packages/ui/src/react/Example/${file}`);
const log=[];
function run(label,expected,args=['--check']) {
const result=spawnSync(process.execPath,[`${root}/scripts/build-llms.mjs`,...args],{encoding:'utf8'});
assert.equal(result.status,expected,label);log.push(`${label}: exit ${result.status}\n${result.stdout}${result.stderr}`);return result;
}
run('Generate component index',0,[]);
assert.equal(await readFile(`${root}/llms.txt`,'utf8'),'# tensquads UI component index\n\n- [Example](packages/ui/src/react/Example/Example.md): This is a placeholder component. Task 009 removes it when Button is added.\n');
run('Current output accepted',0);
await writeFile(`${root}/llms.txt`,'stale output\n');
assert.match(run('Stale output rejected',1).stderr,/llms.txt is stale/);
run('Regenerate stale output',0,[]);run('Regenerated output accepted',0);
await rm(`${root}/packages/ui/src/react/Example/Example.md`);
assert.match(run('Missing component documentation rejected',1).stderr,/Example has no Example.md/);
const fixture='packages/ui/src/react/Example/Example.fixture.ar.txt';
const original=await readFile(fixture);
try {
await rm(fixture);
const result=spawnSync('node',['node_modules/vitest/vitest.mjs','run','packages/ui/src/react/Example/Example.test.tsx','-t','has English and Arabic fixtures'],{encoding:'utf8'});
assert.equal(result.status,1);assert.match(result.stdout+result.stderr,/Example needs a ar fixture/);
log.push(`Contributor fixture harness rejects missing Arabic fixture: exit ${result.status}\n${result.stdout}${result.stderr}`);
}finally{await writeFile(fixture,original);}
await writeFile('~/.no-mistakes/evidence/01M7P6ZFRFASWJ737ZXMFT71EQ/guards.txt',log.join('\n'));
console.log('Documentation generation, current/stale/missing-doc guards and missing-Arabic-fixture harness guard behaved as specified.');
