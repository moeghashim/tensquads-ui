import original from '../playwright.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({...original,
 testDir: '../e2e',
 testMatch: 'phase-dialog.spec.ts',
 workers: 1,
 reporter: [['list']],
 outputDir: '~/.no-mistakes/evidence/01M7Q102P8FP7G4TZK07CNF8FC/playwright-results',
 snapshotPathTemplate: '{testDir}/__screenshots__/dialog.spec.ts/{arg}{ext}',
 use: {...original.use, trace: 'on'},
 webServer: { cwd: '{run-worktree}', command: 'npm --prefix apps/preview run preview', url: 'http://localhost:5173', reuseExistingServer: false, timeout: 120000 }
});
