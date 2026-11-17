from pathlib import Path
import subprocess, shutil, hashlib, json, os
root=Path.cwd()
base=root/'.validation'
evidence=Path('/Users/moeghashim/.no-mistakes/evidence/01M7NGBWGPJK97K5VNAEXMYSJ1')
log=[]
def say(s):
    print(s,flush=True); log.append(s)
def run(args,cwd=None,env=None,code=0):
    p=subprocess.run(args,cwd=cwd or root,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    say('$ '+ ' '.join(map(str,args)))
    if p.stdout.strip(): say(p.stdout.strip())
    if p.stderr.strip(): say(p.stderr.strip())
    say('exit='+str(p.returncode))
    assert p.returncode==code,(args,p.returncode,code)
    return p
sha='644fd15aa8c18dbb0ec5c83181426a7719a5dc4f'
up=base/'upstream'
try:
    run(['git','checkout','--detach',sha],up)
    sandbox=base/'project with spaces'
    sandbox.mkdir()
    shutil.copytree(root/'scripts',sandbox/'scripts')
    shutil.copy(root/'package.json',sandbox/'package.json')
    run(['npm','run','design:sync','--',sha],sandbox)
    design=sandbox/'design'
    manifest=json.loads((design/'MANIFEST.json').read_text())
    sources={'tokens.json':'agent-ui/tokens.json','ATTRIBUTION.md':'README.md',
             'agent-ui/README.md':'agent-ui/README.md','agent-ui/data-display.md':'agent-ui/data-display.md',
             'mascots/mascots.json':'mascots/mascots.json'}
    for p in (up/'agent-ui/components').glob('*/README.md'):
        sources[str(p.relative_to(up))]=str(p.relative_to(up))
    for folder in ['mascots/svg','mascots/states']:
        for p in (up/folder).iterdir(): sources[str(p.relative_to(up))]=str(p.relative_to(up))
    for name in ['apple-touch-icon.png','favicon-32.png','favicon.svg','logo-512.png','logo-dark-512.png','logo-dark.svg','logo.svg']:
        sources['logo/'+name]='logo/'+name
    assert set(manifest['files'])==set(sources)
    assert manifest['commit']==sha and manifest['source']=='https://github.com/moeghashim/tensquads-design-system.git'
    def snapshot(): return {str(p.relative_to(design)):p.read_bytes() for p in design.rglob('*') if p.is_file()}
    for output,source in sources.items():
        data=(design/output).read_bytes()
        assert data==(up/source).read_bytes(),output
        assert hashlib.sha256(data).hexdigest()==manifest['files'][output],output
        assert data==(root/'design'/output).read_bytes(),output
    assert json.loads((root/'design/MANIFEST.json').read_text())['files']==manifest['files']
    assert set(snapshot())==set(sources)|{'MANIFEST.json'}
    say(f'PINNED CONTRACT: {len(sources)} files byte-identical to upstream and checked-in reference; SHA-256 verified independently; exact inventory includes attribution and excludes previews/bundles/screens/avatar rasters/lineups/cards.')
    run(['npm','run','design:check'],sandbox)
    original=snapshot()
    def checkbad(label,expected):
        p=run(['npm','run','design:check'],sandbox,code=1)
        assert expected in p.stderr
        say('ADVERSARIAL '+label+': rejected as expected')
    token=design/'tokens.json'
    token.write_bytes(original['tokens.json']+b'\n')
    checkbad('changed bytes in path with spaces','Hash mismatch: tokens.json')
    token.write_bytes(original['tokens.json'])
    extra=design/'unexpected.txt'; extra.write_text('extra')
    checkbad('extra file','Unexpected file: unexpected.txt'); extra.unlink()
    token.unlink(); checkbad('missing file','Missing file: tokens.json'); token.write_bytes(original['tokens.json'])
    for label,target in [('file symlink','tokens.json'),('directory symlink','agent-ui'),('dangling symlink','does-not-exist')]:
        extra.symlink_to(target)
        checkbad(label,'Unsupported filesystem entry: unexpected.txt'); extra.unlink()
    for filename in ['tokens.json','MANIFEST.json']:
        p=design/filename; p.unlink(); p.symlink_to('missing')
        checkbad('replacement symlink '+filename,'Unsupported filesystem entry: '+filename)
        p.unlink(); p.write_bytes(original[filename])
    os.mkfifo(extra)
    checkbad('FIFO','Unsupported filesystem entry: unexpected.txt'); extra.unlink()
    run(['npm','run','design:check'],sandbox)
    say('SPACE-PATH CONTRACT: clean CLI executes; changed, extra, missing, file/directory/dangling/replacement symlinks and FIFO all fail with specific diagnostics.')
    # A disposable real Git source provides future commits without touching shared configuration.
    env=os.environ.copy()
    env.update({'GIT_CONFIG_COUNT':'1','GIT_CONFIG_KEY_0':'url.'+up.as_uri()+'.insteadOf','GIT_CONFIG_VALUE_0':'https://github.com/moeghashim/tensquads-design-system.git'})
    (up/'agent-ui/tokens.json').write_bytes((up/'agent-ui/tokens.json').read_bytes()+b'\n')
    run(['git','add','agent-ui/tokens.json'],up)
    run(['git','-c','user.name=Disposable Test','-c','user.email=test@example.invalid','commit','-m','Disposable future design update'],up)
    future=run(['git','rev-parse','HEAD'],up).stdout.strip()
    run(['npm','run','design:sync','--',future],sandbox,env)
    futuremanifest=json.loads((design/'MANIFEST.json').read_text())
    assert futuremanifest['commit']==future
    assert token.read_bytes()==(up/'agent-ui/tokens.json').read_bytes()
    assert futuremanifest['files']['tokens.json']==hashlib.sha256(token.read_bytes()).hexdigest()
    run(['npm','run','design:check'],sandbox)
    say('FUTURE UPDATE CONTRACT: real CLI cloned disposable Git commit, replaced design bytes, recorded new commit/hash, and checker accepted it.')
    before=snapshot()
    run(['npm','run','design:sync','--','bad-sha'],sandbox,env,code=1)
    assert snapshot()==before
    run(['npm','run','design:sync','--','0'*40],sandbox,env,code=1)
    assert snapshot()==before
    run(['git','rm','logo/logo.svg'],up)
    run(['git','-c','user.name=Disposable Test','-c','user.email=test@example.invalid','commit','-m','Disposable incomplete design source'],up)
    broken=run(['git','rev-parse','HEAD'],up).stdout.strip()
    p=run(['npm','run','design:sync','--',broken],sandbox,env,code=1)
    assert 'logo.svg' in p.stderr
    assert snapshot()==before
    assert not list(sandbox.glob('.design-sync-*'))
    run(['npm','run','design:check'],sandbox)
    say('PRESERVATION CONTRACT: invalid SHA, checkout failure, and late staging failure leave every existing design byte intact; temporary sync directories removed.')
    say('ALL LIVE CLI SCENARIOS PASSED')
finally:
    (evidence/'design-cli-transcript.txt').write_text('\n\n'.join(log)+'\n')
