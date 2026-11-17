from pathlib import Path
import subprocess, shutil, json, hashlib, os
root=Path.cwd()
base=root/'.local-validation'
evidence=Path('/Users/moeghashim/.no-mistakes/evidence/01M7NGBWGPJK97K5VNAEXMYSJ1')
log=(evidence/'design-cli-transcript.txt').open('w')
def note(s):
 print(s,flush=True); log.write(s+'\n'); log.flush()
def run(args,cwd=root,env=None,code=0,contains=None):
 note('$ '+ ' '.join(map(str,args))+' [cwd='+str(cwd.relative_to(root))+']')
 p=subprocess.run(args,cwd=cwd,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 note(p.stdout.strip());note('exit='+str(p.returncode))
 assert (p.returncode==code if code is not None else p.returncode!=0),p.stdout
 if contains: assert contains in p.stdout,p.stdout
 return p.stdout.strip()
sha='644fd15aa8c18dbb0ec5c83181426a7719a5dc4f'
url='https://github.com/moeghashim/tensquads-design-system.git'
app=base/'checkout with spaces';app.mkdir()
shutil.copytree(root/'scripts',app/'scripts');shutil.copy(root/'package.json',app/'package.json')
run(['npm','run','design:sync','--',sha],app)
run(['npm','run','design:check'],app)
source=base/'upstream'
run(['git','clone','--no-checkout',url,str(source)])
run(['git','-C',str(source),'checkout','--detach',sha])
design=app/'design'
m=json.loads((design/'MANIFEST.json').read_text())
expected={'tokens.json':'agent-ui/tokens.json','ATTRIBUTION.md':'README.md','agent-ui/README.md':'agent-ui/README.md','agent-ui/data-display.md':'agent-ui/data-display.md','mascots/mascots.json':'mascots/mascots.json'}
for p in (source/'agent-ui/components').glob('*/README.md'): expected[str(p.relative_to(source))]=str(p.relative_to(source))
for directory in ['mascots/svg','mascots/states','logo']:
 for p in (source/directory).iterdir():
  if p.is_file(): expected[str(p.relative_to(source))]=str(p.relative_to(source))
assert set(expected)==set(m['files']),(set(expected)-set(m['files']),set(m['files'])-set(expected))
assert m['commit']==sha and m['source']==url
for dest,src in expected.items():
 b=(source/src).read_bytes()
 assert (design/dest).read_bytes()==b
 assert hashlib.sha256(b).hexdigest()==m['files'][dest]
 assert (root/'design'/dest).read_bytes()==b
assert json.loads((root/'design/MANIFEST.json').read_text())['files']==m['files']
note(f'PINNED BYTE CONTRACT: all {len(expected)} required output files, attribution, committed output and SHA-256 entries match independent upstream checkout; inventory is exact and contains no omitted asset categories.')
# Public checker CLI, same executable path with spaces, restoring each mutation.
token=design/'tokens.json';original=token.read_bytes()
token.write_bytes(original+b'\n');run(['npm','run','design:check'],app,code=1,contains='Hash mismatch: tokens.json');token.write_bytes(original)
extra=design/'extra.txt';extra.write_text('extra');run(['npm','run','design:check'],app,code=1,contains='Unexpected file: extra.txt');extra.unlink()
token.unlink();run(['npm','run','design:check'],app,code=1,contains='Missing file: tokens.json');token.write_bytes(original)
for name,target in [('extra-file','tokens.json'),('extra-directory','mascots'),('dangling','absent')]:
 p=design/name;p.symlink_to(target);run(['npm','run','design:check'],app,code=1,contains='Unsupported filesystem entry: '+name);p.unlink()
for name in ['tokens.json','MANIFEST.json']:
 p=design/name;b=p.read_bytes();p.unlink();p.symlink_to('../package.json');run(['npm','run','design:check'],app,code=1,contains='Unsupported filesystem entry: '+name);p.unlink();p.write_bytes(b)
p=design/'named-pipe';os.mkfifo(p);run(['npm','run','design:check'],app,code=1,contains='Unsupported filesystem entry: named-pipe');p.unlink()
run(['npm','run','design:check'],app)
# Real git repository and explicit per-process rewrite: no shared config or remote writes.
env=os.environ.copy();env.update({'GIT_CONFIG_COUNT':'1','GIT_CONFIG_KEY_0':'url.'+str(source)+'.insteadOf','GIT_CONFIG_VALUE_0':url})
(source/'agent-ui/tokens.json').write_bytes(original+b'\n')
(source/'preview.html').write_text('excluded preview')
run(['git','-C',str(source),'add','agent-ui/tokens.json','preview.html'])
run(['git','-C',str(source),'-c','user.name=Disposable Test','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-m','disposable future design update'])
future=run(['git','-C',str(source),'rev-parse','HEAD'])
run(['npm','run','design:sync','--',future],app,env)
assert token.read_bytes()==original+b'\n'
assert json.loads((design/'MANIFEST.json').read_text())['commit']==future
assert not (design/'preview.html').exists()
run(['npm','run','design:check'],app)
note('FUTURE COMMIT: modified upstream token bytes and new commit SHA propagated; preview remained excluded.')
def snapshot(): return {str(p.relative_to(design)):p.read_bytes() for p in design.rglob('*') if p.is_file()}
before=snapshot()
(source/'agent-ui/README.md').unlink();run(['git','-C',str(source),'add','-u'])
run(['git','-C',str(source),'-c','user.name=Disposable Test','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-m','disposable incomplete source'])
broken=run(['git','-C',str(source),'rev-parse','HEAD'])
run(['npm','run','design:sync','--',broken],app,env,code=1,contains='README.md')
assert snapshot()==before
assert not list(app.glob('.design-sync-*'))
run(['npm','run','design:check'],app)
note('FAILED STAGING: required README missing after token copy; every existing design byte retained, checker still clean, staging removed.')
for invalid in ['not-a-commit','0'*40]:
 run(['npm','run','design:sync','--',invalid],app,env,code=1)
 assert snapshot()==before
 assert not list(app.glob('.design-sync-*'))
note('INVALID INPUT / UNAVAILABLE COMMIT: nonzero exit, existing output preserved and temporary staging cleaned.')
run(['npm','run','design:check'])
note('All live CLI scenarios passed.')
log.close()
