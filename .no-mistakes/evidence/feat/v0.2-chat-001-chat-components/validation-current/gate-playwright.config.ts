import { defineConfig } from '@playwright/test';
import config from './playwright.config';
export default defineConfig({ ...config,
 reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7REPJ215PXXEFRJFN6EF43V/validation-current/results.json'}]],
 outputDir: '~/.no-mistakes/evidence/01M7REPJ215PXXEFRJFN6EF43V/validation-current/browser-results',
 workers: 2,
});
