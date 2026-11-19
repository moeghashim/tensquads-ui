import { defineConfig } from '@playwright/test';
import original from './playwright.config';
const root = '{run-worktree}';
const evidence = '~/.no-mistakes/evidence/01M7RRJQP2JGFYC7BXJ37KSKQ5';
export default defineConfig({
 ...original,
 testDir: `${root}/e2e`,
 outputDir: `${evidence}/browser-results`,
 workers: 2,
 reporter: [['list'], ['json', {outputFile: `${evidence}/chat-results.json`}]],
 webServer: {...original.webServer, cwd: root, env: {WRANGLER_SEND_METRICS: 'false'}},
});
