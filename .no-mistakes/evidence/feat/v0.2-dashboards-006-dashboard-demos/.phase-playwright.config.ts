import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base, testMatch: '.phase-extra.spec.ts', workers: 4, reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/extra-results.json'}]], outputDir:'~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8/browser-results'});
