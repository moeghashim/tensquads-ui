import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir: './.local-validation', workers: 2,
 reporter: [['list'], ['json', {outputFile:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/supplemental-results.json'}]],
 outputDir:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/supplemental-output',
 use:{baseURL:'http://localhost:5173', ...devices['Desktop Chrome'], browserName:'chromium'},
 webServer:{ command:'npm run build:preview && npm --prefix apps/preview run preview', url:'http://localhost:5173', reuseExistingServer:false, timeout:120000 }
});
