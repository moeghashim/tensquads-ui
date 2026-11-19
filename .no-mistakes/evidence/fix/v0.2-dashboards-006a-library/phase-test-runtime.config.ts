import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'runtime.spec.ts',reporter:'line',workers:1,outputDir:'results-runtime',use:{browserName:'chromium'}});
