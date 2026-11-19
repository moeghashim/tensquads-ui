import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir: '../e2e', testMatch: 'sidebar.spec.ts', fullyParallel: false, workers: 1,
 reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7TGDSYKRTHQVD49EWM71BVH/sidebar-results.json'}]],
 outputDir: '~/.no-mistakes/evidence/01M7TGDSYKRTHQVD49EWM71BVH/browser-results',
 use: {baseURL: 'http://localhost:5173', ...devices['Desktop Chrome'], browserName: 'chromium', locale:'en-US', colorScheme:'light'},
 webServer: {command: 'npm run build:preview && npm --prefix apps/preview run preview', cwd: '{run-worktree}', url:'http://localhost:5173', reuseExistingServer:false, timeout:120000}
});
