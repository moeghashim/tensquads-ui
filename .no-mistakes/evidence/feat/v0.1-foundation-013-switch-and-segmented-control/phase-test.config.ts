import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const root = '{run-worktree}';
const evidence = '~/.no-mistakes/evidence/01M7Q77XP9C77SHJR5QVA14KKP';
export default defineConfig({ ...base, testDir: `${root}/e2e`, testMatch: ['switch-segmented-control.spec.ts', 'phase-fixtures.spec.ts'], workers: 2, outputDir: `${evidence}/browser-results`, reporter: [['list'], ['json', { outputFile: `${evidence}/results.json` }]], webServer: { ...base.webServer, cwd: root }, use: { ...base.use, trace: 'retain-on-failure' } });
