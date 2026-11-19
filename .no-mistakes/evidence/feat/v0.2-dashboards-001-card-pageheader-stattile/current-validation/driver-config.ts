
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
testDir:'./.phase-test', workers:2,
reporter:[['list'],['json',{outputFile:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/current-validation/supplemental-results.json'}]],
outputDir:'~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/current-validation/supplemental-output',
use:{baseURL:'http://localhost:5173',...devices['Desktop Chrome']},
webServer:{command:'npm --prefix apps/preview run preview',url:'http://localhost:5173',reuseExistingServer:false,timeout:120000}
});
