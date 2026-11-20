import base from './playwright.config';
import { defineConfig } from '@playwright/test';
const evidence = '~/.no-mistakes/evidence/01M7VWXNB6F1BKSS2D1T6BMTKF';
export default defineConfig({ ...base, workers: 2, outputDir: `${evidence}/final-supplemental-results`, reporter: [['line'], ['json', { outputFile: `${evidence}/final-supplemental-results.json` }]], });
