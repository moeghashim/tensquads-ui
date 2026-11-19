import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const cwd = process.cwd();
const evidence = '~/.no-mistakes/evidence/01M7T0SGWEBTQJPGGBDQH2C3ZS';
const temp = await mkdtemp(join(cwd, '.docs-live-'));
const log = [];
function run(dir, args, expected) {
 const child = spawnSync(process.execPath, ['scripts/build-llms.mjs', ...args], {cwd: dir, encoding: 'utf8'});
 log.push(`$ node scripts/build-llms.mjs ${args.join(' ')}\ncwd: ${dir}\nexit: ${child.status}\n${child.stdout}${child.stderr}`);
 assert.equal(child.status, expected);
 return child;
}
try {
 // Execute the unchanged real generator in an isolated project root with current public docs.
 await mkdir(join(temp, 'scripts'));
 await cp(join(cwd, 'scripts/build-llms.mjs'), join(temp, 'scripts/build-llms.mjs'));
 await cp(join(cwd, 'packages/ui/src/react'), join(temp, 'packages/ui/src/react'), { recursive: true });
 await cp(join(cwd, 'README.md'), join(temp, 'README.md'));
 await cp(join(cwd, 'llms.txt'), join(temp, 'llms.txt'));
 const beforeReadme = await readFile(join(temp, 'README.md'), 'utf8');
 const beforeIndex = await readFile(join(temp, 'llms.txt'), 'utf8');
 run(temp, [], 0);
 assert.equal(await readFile(join(temp, 'README.md'), 'utf8'), beforeReadme);
 assert.equal(await readFile(join(temp, 'llms.txt'), 'utf8'), beforeIndex);
 run(temp, ['--check'], 0);
 await cp(join(temp, 'README.md'), join(evidence, 'generated-README.md'));
 await cp(join(temp, 'llms.txt'), join(evidence, 'generated-llms.txt'));
 log.push('Current public corpus: regeneration is byte stable for both outputs; --check accepts it.');
 // Public output contracts are independent, handwritten expectations for synthetic author inputs.
 await rm(join(temp, 'packages/ui/src/react'), {recursive: true});
 for (const name of ['Button', 'Chat']) await mkdir(join(temp, `packages/ui/src/react/${name}`), {recursive: true});
 await writeFile(join(temp, 'packages/ui/src/react/Button/Button.md'), '# Button\n\nImport Button. Button runs an action.\n');
 await writeFile(join(temp, 'packages/ui/src/react/Button/Button.openui.ts'), 'export const definition = {\n\tdescription: "An action | control.",\n};\n');
 await writeFile(join(temp, 'packages/ui/src/react/Chat/Chat.md'), '# Chat\n\nImport Chat. Chat shows messages. More detail.\n');
 const wrapper = '# Disposable documentation\n\nKeep this introduction.\n\n<!-- components:start -->\nstale\n<!-- components:end -->\n\nKeep this footer.\n';
 await writeFile(join(temp, 'README.md'), wrapper);
 run(temp, [], 0);
 const expectedTable = '<!-- components:start -->\n\n| Component | What it is | Live |\n|---|---|---|\n| [Button](packages/ui/src/react/Button/Button.md) | An action \\| control. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Button) |\n| [Chat](packages/ui/src/react/Chat/Chat.md) | Chat shows messages. | [open](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Chat) |\n\n<!-- components:end -->';
 const generatedReadme = await readFile(join(temp, 'README.md'), 'utf8');
 assert.equal(generatedReadme, wrapper.replace('<!-- components:start -->\nstale\n<!-- components:end -->', expectedTable));
 const generatedIndex = await readFile(join(temp, 'llms.txt'), 'utf8');
 assert.equal(generatedIndex, '# tensquads UI component index\n\n@tensquads/ui is a React component library with 2 documented components. Live gallery: https://tensquads-ui-preview.mohanadgh.workers.dev/components. Install and setup: README.md. Agent skill: .agents/skills/tensquads-ui/SKILL.md.\n\n- [Button](packages/ui/src/react/Button/Button.md): Import Button. Button runs an action.\n- [Chat](packages/ui/src/react/Chat/Chat.md): Import Chat. Chat shows messages. More detail.\n');
 log.push('Synthetic author inputs: two correct sorted rows, documentation/live links, OpenUI tagline, Markdown pipe escaping, docs-only fallback, preserved surrounding prose, and full index summaries. Oracle: README command contract plus handwritten expected public Markdown.');
 run(temp, ['--check'], 0);
 await writeFile(join(temp, 'README.md'), generatedReadme.replace('Chat shows messages.', 'Stale summary.'));
 assert.match(run(temp, ['--check'], 1).stderr, /README.md component table is stale/);
 assert.equal(await readFile(join(temp, 'README.md'), 'utf8'), generatedReadme.replace('Chat shows messages.', 'Stale summary.'));
 run(temp, [], 0);
 await rm(join(temp, 'llms.txt'));
 assert.match(run(temp, ['--check'], 1).stderr, /llms.txt is stale/);
 run(temp, [], 0);
 run(temp, ['--check'], 0);
 await writeFile(join(temp, 'README.md'), '# Missing markers\n');
 assert.match(run(temp, [], 1).stderr, /README.md has no components markers/);
 assert.equal(await readFile(join(temp, 'README.md'), 'utf8'), '# Missing markers\n');
 log.push('Adversarial guards: stale README and missing index rejected without silent rewriting; regeneration repairs both; missing README markers rejected without replacing document.');
} finally {
 await rm(temp, {recursive: true, force: true});
 await writeFile(join(evidence, 'docs-cli-transcript.txt'), log.join('\n\n'));
}
console.log(log.join('\n\n'));
