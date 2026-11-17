import os, pathlib, subprocess, shutil, json, hashlib, tempfile
root = pathlib.Path.cwd()
evidence = pathlib.Path('/Users/moeghashim/.no-mistakes/evidence/01M7NGBWGPJK97K5VNAEXMYSJ1')
evidence.mkdir(parents=True, exist_ok=True)
work = root / '.phase-test'
app = work / 'consumer with spaces'
app.mkdir()
shutil.copytree(root / 'scripts', app / 'scripts')
shutil.copy(root / 'package.json', app / 'package.json')
env = dict(os.environ, GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL='/dev/null', GIT_TERMINAL_PROMPT='0')
log=[]
def run(args, cwd=app, expected=0, customenv=None, contains=None):
    p=subprocess.run(args,cwd=cwd,env=customenv or env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
    log.append('$ '+ ' '.join(args)+'\n'+p.stdout+'[exit '+str(p.returncode)+']\n')
    (evidence/'design-cli-transcript.txt').write_text('\n'.join(log))
    assert (p.returncode==0 if expected==0 else p.returncode!=0), log[-1]
    if contains: assert contains in p.stdout, log[-1]
    print(log[-1], flush=True)
    return p
sha='644fd15aa8c18dbb0ec5c83181426a7719a5dc4f'
run(['npm','run','design:sync','--',sha],contains='Synced ')
run(['npm','run','design:check'],contains='Design reference is clean')
upstream=work/'upstream'
run(['git','clone','--quiet','--filter=blob:none','--no-checkout','https://github.com/moeghashim/tensquads-design-system.git',str(upstream)])
run(['git','sparse-checkout','set','--no-cone','/README.md','/agent-ui/','/mascots/svg/','/mascots/states/','/mascots/mascots.json','/logo/'],cwd=upstream)
run(['git','checkout','--detach',sha],cwd=upstream)
manifest=json.loads((app/'design/MANIFEST.json').read_text())
expected={'tokens.json':'agent-ui/tokens.json','ATTRIBUTION.md':'README.md','agent-ui/README.md':'agent-ui/README.md','agent-ui/data-display.md':'agent-ui/data-display.md','mascots/mascots.json':'mascots/mascots.json'}
for source in (upstream/'agent-ui/components').glob('*/README.md'):
    name=source.relative_to(upstream).as_posix(); expected[name]=name
for directory in ['mascots/svg','mascots/states','logo']:
    for source in (upstream/directory).iterdir():
        if directory=='logo' and source.name not in ['apple-touch-icon.png','favicon-32.png','favicon.svg','logo-512.png','logo-dark-512.png','logo-dark.svg','logo.svg']: continue
        name=source.relative_to(upstream).as_posix(); expected[name]=name
assert manifest['commit']==sha
assert manifest['source']=='https://github.com/moeghashim/tensquads-design-system.git'
assert set(manifest['files'])==set(expected)
for dest, source in expected.items():
    data=(app/'design'/dest).read_bytes()
    assert data==(upstream/source).read_bytes(),dest
    assert hashlib.sha256(data).hexdigest()==manifest['files'][dest],dest
# The committed output must have the same byte contract as the independently retrieved source.
for dest in expected:
    assert (root/'design'/dest).read_bytes()==(app/'design'/dest).read_bytes(),dest
assert json.loads((root/'design/MANIFEST.json').read_text())['files']==manifest['files']
(evidence/'source-byte-comparison.json').write_text(json.dumps({'source':manifest['source'],'commit':sha,'verifiedFileCount':len(expected),'result':'Every committed and regenerated reference file equals its upstream source bytes and SHA-256. Inventory includes source README attribution; only the selected docs, mascot SVGs, mascot metadata and logo assets are present.','files':manifest['files']},indent=2)+'\n')
asset=app/'design/tokens.json'
original=asset.read_bytes()
asset.write_bytes(original+b'\n')
run(['npm','run','design:check'],expected=1,contains='Hash mismatch: tokens.json')
asset.unlink()
run(['npm','run','design:check'],expected=1,contains='Missing file: tokens.json')
asset.write_bytes(original)
extra=app/'design/extra.txt'; extra.write_text('unexpected')
run(['npm','run','design:check'],expected=1,contains='Unexpected file: extra.txt')
extra.unlink()
for name,target in [('file-link','tokens.json'),('directory-link','mascots'),('dangling-link','absent')]:
    link=app/'design'/name; link.symlink_to(target)
    run(['npm','run','design:check'],expected=1,contains='Unsupported filesystem entry: '+name)
    link.unlink()
for name in ['tokens.json','MANIFEST.json']:
    path=app/'design'/name; backup=app/(name+'.backup'); path.rename(backup); path.symlink_to(backup)
    run(['npm','run','design:check'],expected=1,contains='Unsupported filesystem entry: '+name)
    path.unlink(); backup.rename(path)
fifo=app/'design/extra.fifo'; os.mkfifo(fifo)
run(['npm','run','design:check'],expected=1,contains='Unsupported filesystem entry: extra.fifo')
fifo.unlink()
def snapshot():
    return {p.relative_to(app/'design').as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in (app/'design').rglob('*') if p.is_file()}
before=snapshot()
run(['npm','run','design:sync','--','not-a-sha'],expected=1,contains='Pass a full 40-character commit SHA')
assert before==snapshot()
run(['npm','run','design:sync','--','0'*40],expected=1)
assert before==snapshot()
# A self-contained disposable Git repository supplies a future update via per-process URL mapping.
fixture_source=work/'fixture-source'
shutil.copytree(upstream,fixture_source,ignore=shutil.ignore_patterns('.git'))
upstream=fixture_source
run(['git','init','--quiet'],cwd=upstream)
run(['git','add','.'],cwd=upstream)
run(['git','-c','user.name=Disposable Test','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-m','Disposable complete baseline'],cwd=upstream)
(upstream/'agent-ui/tokens.json').write_bytes((upstream/'agent-ui/tokens.json').read_bytes()+b'\n')
run(['git','add','agent-ui/tokens.json'],cwd=upstream)
run(['git','-c','user.name=Disposable Test','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-m','Disposable future design update'],cwd=upstream)
future=run(['git','rev-parse','HEAD'],cwd=upstream).stdout.strip()
localenv=dict(env,GIT_CONFIG_COUNT='1',GIT_CONFIG_KEY_0='url.file://'+str(upstream)+'.insteadOf',GIT_CONFIG_VALUE_0=manifest['source'])
run(['npm','run','design:sync','--',future],customenv=localenv,contains='Synced ')
assert json.loads((app/'design/MANIFEST.json').read_text())['commit']==future
assert asset.read_bytes()==(upstream/'agent-ui/tokens.json').read_bytes()
run(['npm','run','design:check'],contains='Design reference is clean')
# Fail after staging has copied tokens, by removing a required later source file.
before=snapshot()
run(['git','rm','agent-ui/README.md'],cwd=upstream)
run(['git','-c','user.name=Disposable Test','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-m','Disposable incomplete design update'],cwd=upstream)
incomplete=run(['git','rev-parse','HEAD'],cwd=upstream).stdout.strip()
run(['npm','run','design:sync','--',incomplete],expected=1,customenv=localenv,contains='README.md')
assert snapshot()==before, 'Staging failure changed existing design output'
assert not list(app.glob('.design-sync-*')), 'Sync temporary output leaked'
run(['npm','run','design:check'],contains='Design reference is clean')
log.append('Verified unchanged output after invalid input, nonexistent commit, and missing required source file; sync staging directories removed.\n')
(evidence/'design-cli-transcript.txt').write_text('\n'.join(log))
print('ALL LIVE SCENARIOS PASSED',flush=True)
