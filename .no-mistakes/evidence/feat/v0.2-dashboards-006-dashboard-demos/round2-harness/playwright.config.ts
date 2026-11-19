import { defineConfig } from '@playwright/test';
import base from '../playwright.config';
export default defineConfig({...base, testDir: '.', workers: 2, outputDir: '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/round2-supplemental-results', reporter: [['list'], ['html', {outputFolder: '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/round2-supplemental-report', open: 'never'}]], webServer: {...base.webServer, cwd: process.cwd()}});
