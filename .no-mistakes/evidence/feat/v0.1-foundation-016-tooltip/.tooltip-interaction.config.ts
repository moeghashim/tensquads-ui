import { defineConfig } from '@playwright/test';
import original from './playwright.config';
export default defineConfig(original, {
  workers: 2,
  use: {...original.use, baseURL: "http://127.0.0.1:5186"},
  testMatch: '**/.tooltip-live.spec.ts',
  outputDir: '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF/interaction-results',
  reporter: [['list'], ['json', {outputFile: '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF/interaction-results.json'}]],
  webServer: {...original.webServer, command:'cd apps/preview && npm exec -- wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 5186', url:'http://127.0.0.1:5186'},
});
