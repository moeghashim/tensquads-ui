import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './e2e', testMatch: ['preview.spec.ts', 'home-live.local.spec.ts'],
 grepInvert: /home works in both directions and themes/,
 workers: 2, reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7R0RKKEGXGS3CV7YBM98KCG/browser-results.json'}]],
 outputDir: '~/.no-mistakes/evidence/01M7R0RKKEGXGS3CV7YBM98KCG/browser-output',
 use: {baseURL:'http://localhost:5173', browserName:'chromium', viewport:{width:1440,height:900}},
 webServer: { command: 'npm run build:preview && npm --prefix apps/preview run preview', url:'http://localhost:5173', reuseExistingServer:false, timeout:120000 }
});
