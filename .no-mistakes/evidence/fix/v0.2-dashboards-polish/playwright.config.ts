import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: '../e2e', testMatch: ['phase-dashboard-polish.spec.ts','bar-chart-layout.spec.ts','stat-tile-layout.spec.ts'],
 workers: 2, timeout: 90000,
 reporter: [['list'],['json',{outputFile:'~/.no-mistakes/evidence/01M7TTSM5Y7Y1ZFJN1NP486SSS/results.json'}]],
 outputDir:'~/.no-mistakes/evidence/01M7TTSM5Y7Y1ZFJN1NP486SSS/test-output',
 use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium',screenshot:'only-on-failure'},
 webServer:{cwd:'..',command:'WRANGLER_SEND_METRICS=false npm --prefix apps/preview run preview',url:'http://127.0.0.1:5173',timeout:60000,reuseExistingServer:false}
});
