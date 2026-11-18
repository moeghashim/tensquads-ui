import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const workspace=process.cwd();const evidence='~/.no-mistakes/evidence/01M7P4FMX6MKD7HZG3SND5BVC3';
const reports=[];
async function size(path){let n=0;for(const item of await readdir(path,{withFileTypes:true})){const p=join(path,item.name);if(item.isDirectory())n+=await size(p);else if(item.isFile())n+=(await stat(p)).size;}return n;}
for(const [name,sha] of [['before','fef6a28'],['after','20bb5bbbd434358d87281ae3f7082714fe3ee038']]){
 const cwd=resolve('.font-test',name);await mkdir(cwd,{recursive:true});
 const init=spawnSync('npm',['init','-y'],{cwd,encoding:'utf8'});if(init.status!==0)throw Error(init.stderr);
 const command=['install',`git+file://${workspace}#${sha}`,'react@19','react-dom@19'];
 const start=performance.now();const installed=spawnSync('npm',command,{cwd,encoding:'utf8',timeout:180000});const seconds=(performance.now()-start)/1000;
 await writeFile(`${evidence}/git-install-${name}.log`,[`${cwd}\nnpm init -y\nnpm ${command.join(' ')}\n`,init.stdout,installed.stdout,installed.stderr,`\nexit=${installed.status}; seconds=${seconds}\n`].join(''));
 if(installed.status!==0)throw Error(`Git install ${name}: exit ${installed.status}: ${installed.stderr}`);
 reports.push({name,sha,command:`npm init -y && npm ${command.join(' ')}`,seconds,packageBytes:await size(join(cwd,'node_modules/@tensquads/ui')),nodeModulesBytes:await size(join(cwd,'node_modules'))});
}
await writeFile(`${evidence}/git-install-comparison.json`,JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));
