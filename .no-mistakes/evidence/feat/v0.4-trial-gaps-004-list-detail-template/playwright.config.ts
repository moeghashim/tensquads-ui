import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'../e2e',workers:2,reporter:[['list'],['json',{outputFile:'~/.no-mistakes/evidence/01M8C6E2WKXYMMG8EH23GQHD1H/targeted-results.json'}]],outputDir:'~/.no-mistakes/evidence/01M8C6E2WKXYMMG8EH23GQHD1H/playwright',use:{baseURL:'http://127.0.0.1:5187',browserName:'chromium',headless:true}});
