import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const previous=spawnSync('git',['show','90bea82:scripts/check-git-install.mjs'],{encoding:'utf8'});
if(previous.status!==0)throw new Error(previous.stderr);
await writeFile('.test-runtime/original-git-check.mjs',previous.stdout);
const env={...process.env,PATH:`${process.cwd()}/.test-runtime/bin:${process.env.PATH}`,TMPDIR:`${process.cwd()}/.test-runtime/tmp`,GITHUB_WORKSPACE:process.cwd(),GITHUB_SHA:'e714647629abdbce3c41f3f6e975042ef7959611'};
for(const [label,script,expected] of [['before fix','.test-runtime/original-git-check.mjs',0],['after fix','scripts/check-git-install.mjs',1]]){
 const result=spawnSync(process.execPath,[script],{env,encoding:'utf8'});
 console.log(`\n${label}: expected ${expected}, actual ${result.status}\n${result.stdout}\n${result.stderr}`);
 if(result.status!==expected)process.exitCode=1;
}
