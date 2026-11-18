import {defineConfig} from '@playwright/test';
import config from '../playwright.config';
export default defineConfig({...config,testDir:'../e2e',webServer:undefined,use:{...config.use,baseURL:'http://127.0.0.1:5175'},outputDir:'~/.no-mistakes/evidence/01M7Q0TS59GMGAYZAXK8C9R9GJ/matrix-results',snapshotPathTemplate:'{testDir}/__screenshots__/chip.spec.ts/{arg}{ext}',reporter:[['json',{outputFile:'~/.no-mistakes/evidence/01M7Q0TS59GMGAYZAXK8C9R9GJ/matrix-report.json'}]]});
