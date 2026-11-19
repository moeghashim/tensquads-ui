import { defineConfig } from '@playwright/test';
import base from '../playwright.config';
export default defineConfig({...base, testDir: '.', workers: 4, outputDir: '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/supplemental-final-results', reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/supplemental-final-results.json'}]], webServer: {...base.webServer, cwd: process.cwd()}});
