import os, pathlib, subprocess, shutil, json, hashlib
root=pathlib.Path.cwd(); sandbox=root/'.live-design-validation'; evidence=pathlib.Path('/Users/moeghashim/.no-mistakes/evidence/01M7NGBWGPJK97K5VNAEXMYSJ1'); log=[]
env=dict(os.environ,GIT_CONFIG_GLOBAL='/dev/null',GIT_CONFIG_SYSTEM='/dev/null',GIT_TERMINAL_PROMPT='0',TMPDIR=str(sandbox))
def run(args,cwd=root,expect=0,custom=None):
 p=subprocess.run(args,cwd=cwd,env=custom or env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
 log.append('$ '+ ' '.join(map(str,args))+'\n'+p.stdout+f'[exit {p.returncode}]\n'); (evidence/'design-cli-transcript.txt').write_text('\n'.join(log))
 assert (p.returncode==expect if expect is not None else p.returncode!=0),p.stdout
 return p.stdout
sha='644fd15aa8c18dbb0ec5c83181426a7719a5dc4f'
upstream=sandbox/'upstream'; run(['git','checkout','--detach',sha],upstream)
app=sandbox/'checkout with spaces'; (app/'scripts').mkdir(parents=True)
for f in ['sync-design.mjs','design-check.mjs']: shutil.copy(root/'scripts'/f,app/'scripts'/f)
shutil.copy(root/'package.json',app/'package.json')
run(['npm','run','design:sync','--',sha],app)
run(['npm','run','design:check'],app)
def snapshot(): return {str(p.relative_to(app/'design')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (app/'design').rglob('*') if p.is_file()}
manifest=json.loads((app/'design/MANIFEST.json').read_text())
assert manifest['commit']==sha
for rel,h in manifest['files'].items():
 source='agent-ui/tokens.json' if rel=='tokens.json' else 'README.md' if rel=='ATTRIBUTION.md' else rel
 assert (upstream/source).read_bytes()==(app/'design'/rel).read_bytes(),rel
 assert hashlib.sha256((app/'design'/rel).read_bytes()).hexdigest()==h
 assert (root/'design'/rel).read_bytes()==(app/'design'/rel).read_bytes(),rel
assert len(manifest['files'])==183
assert all(not any(x in p.lower() for x in ['preview','bundle.','screens/','avatars/','lineup','mascots/cards']) for p in manifest['files'])
log.append('Independent byte comparison: all 183 generated and committed reference files equal pinned upstream source; manifest SHA-256 values match; attribution equals upstream README; excluded assets absent.\n')
original=(app/'design/tokens.json').read_bytes()
for mode in ['changed','extra','missing','file symlink','directory symlink','dangling symlink','manifest symlink','fifo']:
 token=app/'design/tokens.json'; extra=app/'design/extra'; mf=app/'design/MANIFEST.json'
 if mode=='changed': token.write_bytes(original+b'\n')
 elif mode=='extra': extra.write_text('extra')
 elif mode=='missing': token.unlink()
 elif mode=='file symlink': extra.symlink_to('tokens.json')
 elif mode=='directory symlink': extra.symlink_to('mascots',target_is_directory=True)
 elif mode=='dangling symlink': extra.symlink_to('missing')
 elif mode=='manifest symlink': mf.rename(app/'saved-manifest.json'); mf.symlink_to('../saved-manifest.json')
 elif mode=='fifo': os.mkfifo(extra)
 log.append('Scenario: reject '+mode)
 out=run(['npm','run','design:check'],app,expect=1)
 expected='Hash mismatch' if mode=='changed' else 'Unexpected file' if mode=='extra' else 'Missing file' if mode=='missing' else 'Unsupported filesystem entry'
 assert expected in out
 if mode in ['changed','missing']: token.write_bytes(original)
 elif mode=='manifest symlink': mf.unlink(); (app/'saved-manifest.json').rename(mf)
 else: extra.unlink()
# Real future source commit, routed via isolated Git URL configuration (no Git mock).
(upstream/'agent-ui/tokens.json').write_bytes(original+b'\n')
run(['git','add','agent-ui/tokens.json'],upstream)
run(['git','-c','user.name=Disposable Tester','-c','user.email=test@example.invalid','commit','-m','Disposable future design revision'],upstream)
future=run(['git','rev-parse','HEAD'],upstream).strip()
local=dict(env,GIT_CONFIG_COUNT='1',GIT_CONFIG_KEY_0='url.'+str(upstream)+'.insteadOf',GIT_CONFIG_VALUE_0='https://github.com/moeghashim/tensquads-design-system.git')
run(['npm','run','design:sync','--',future],app,custom=local)
run(['npm','run','design:check'],app)
assert (app/'design/tokens.json').read_bytes()==original+b'\n'
assert json.loads((app/'design/MANIFEST.json').read_text())['commit']==future
before=snapshot()
run(['npm','run','design:sync','--','invalid'],app,expect=1,custom=local); assert before==snapshot()
run(['npm','run','design:sync','--','0'*40],app,expect=1,custom=local); assert before==snapshot()
run(['git','rm','logo/logo.svg'],upstream)
run(['git','-c','user.name=Disposable Tester','-c','user.email=test@example.invalid','commit','-m','Disposable incomplete source'],upstream)
broken=run(['git','rev-parse','HEAD'],upstream).strip()
run(['npm','run','design:sync','--',broken],app,expect=1,custom=local)
assert before==snapshot()
run(['npm','run','design:check'],app)
assert not list(app.glob('.design-sync-*'))
log.append('Invalid SHA, checkout failure and missing required source asset each preserve every existing output byte; staging directories cleaned. All live scenarios passed.\n')
(evidence/'design-cli-transcript.txt').write_text('\n'.join(log))
print(log[-1])
