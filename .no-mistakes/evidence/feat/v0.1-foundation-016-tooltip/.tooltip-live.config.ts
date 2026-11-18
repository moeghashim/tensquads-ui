import { defineConfig } from '@playwright/test';
import original from './playwright.config';
export default defineConfig(original, {
  workers: 2,
  outputDir: '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF/playwright-results',
  reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF/playwright-results.json'}]],
});
