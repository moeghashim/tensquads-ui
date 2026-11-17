import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const fixture = resolve('.phase-test');
const evidence = '/Users/moeghashim/.no-mistakes/evidence/01M7NCVARYQ7SV0Z8K35GMZB7Y';
let transcript = `Node ${process.version}; npm ${execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()}\n`;
function run(cmd, args, cwd = root) {
  transcript += `\n$ ${cmd} ${args.join(' ')}\n`;
  try {
    const output = execFileSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, TMPDIR: fixture }, stdio: ['ignore', 'pipe', 'pipe'] });
    transcript += output;
    return output;
  } catch (error) {
    transcript += `${error.stdout || ''}${error.stderr || ''}`;
    throw error;
  }
}
const consumerScript = `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
for (const subpath of ['tokens', 'react', 'squadmates', 'openui', 'openui/server', 'schemas']) {
  const specifier = '@tensquads/ui/' + subpath;
  const value = await import(specifier);
  assert.equal(typeof value, 'object');
  console.log('IMPORTED', specifier, 'exports:', Object.keys(value));
}
for (const subpath of ['tokens.css', 'styles.css']) {
  const url = import.meta.resolve('@tensquads/ui/' + subpath);
  const css = readFileSync(new URL(url), 'utf8');
  assert.ok(css.length > 0);
  console.log('CSS ASSET', subpath, JSON.stringify(css));
}
for (const specifier of ['@tensquads/ui', '@tensquads/ui/packages/ui/src/react/index.ts', '@tensquads/ui/package.json']) {
  await assert.rejects(import(specifier), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  console.log('PRIVATE PATH BLOCKED', specifier, 'ERR_PACKAGE_PATH_NOT_EXPORTED');
}
`;
try {
  run('npm', ['run', 'check:pack']);
  const pack = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', fixture]));
  console.log('Packed public package');
  const tarball = resolve(fixture, pack[0].filename);
  transcript += '\nPacked files:\n' + pack[0].files.map(f => f.path).join('\n') + '\n';
  for (const kind of ['tarball', 'git']) {
    const cwd = resolve(fixture, kind + '-consumer');
    mkdirSync(cwd);
    writeFileSync(resolve(cwd, 'package.json'), JSON.stringify({ name: kind + '-consumer', version: '1.0.0', private: true, type: 'module' }));
    let dependency = tarball;
    if (kind === 'git') {
      const repo = resolve(fixture, 'source');
      mkdirSync(repo);
      const archive = execFileSync('git', ['archive', 'HEAD'], { cwd: root });
      execFileSync('tar', ['-x', '-C', repo], { input: archive });
      run('git', ['init', '-q'], repo);
      run('git', ['add', '.'], repo);
      run('git', ['-c', 'user.name=Disposable Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Isolated target snapshot'], repo);
      const sha = run('git', ['rev-parse', 'HEAD'], repo).trim();
      dependency = 'git+file://' + repo + '#' + sha;
      transcript += '\nGit fixture is a clean committed target snapshot with no dist or node_modules.\n';
    }
    run('npm', ['install', '--no-audit', '--no-fund', dependency], cwd);
    writeFileSync(resolve(cwd, 'consumer.mjs'), consumerScript);
    run('node', ['consumer.mjs'], cwd);
  }
  transcript += '\nAll live package consumer checks passed.\n';
} finally {
  writeFileSync(resolve(evidence, 'package-consumers.log'), transcript);
  console.log(transcript);
}
