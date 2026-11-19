import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',testMatch:'local-dashboard-validation.spec.ts',workers:1,
 reporter:[['list'],['json',{outputFile:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/dashboard-results.json'}]],
 outputDir:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/browser-output',
 use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium'},
 webServer:{command:'npm --prefix apps/preview run preview',url:'http://127.0.0.1:5173',reuseExistingServer:false,timeout:120000}
});
