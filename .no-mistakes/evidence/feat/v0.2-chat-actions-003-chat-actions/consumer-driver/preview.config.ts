import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'../e2e',outputDir:process.env.CHAT_EVIDENCE+'/playwright',reporter:[['json',{outputFile:process.env.CHAT_EVIDENCE+'/preview-results.json'}]],use:{baseURL:'http://localhost:5173',browserName:'chromium',headless:true,viewport:{width:1440,height:900}},workers:1});
