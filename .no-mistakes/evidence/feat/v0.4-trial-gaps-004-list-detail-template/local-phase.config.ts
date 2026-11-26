import base from './playwright.config';
import {defineConfig} from '@playwright/test';
export default defineConfig({...base, testMatch:'local-phase.spec.ts', workers:2,
outputDir:process.env.LOCAL_EVIDENCE + '/results',
reporter:[['list'],['json',{outputFile:process.env.LOCAL_EVIDENCE + '/results.json'}]],
use:{...base.use, trace:'retain-on-failure'},
});
