import { defineConfig } from '@playwright/test';
import base from '../playwright.config';
export default defineConfig({...base, testDir:'../e2e', outputDir:'~/.no-mistakes/evidence/01M7Q492AVMJCAE3MNAWAJJCFJ/playwright-results', use:{...base.use,baseURL:'http://127.0.0.1:5189'}, webServer:{cwd:'{run-worktree}/apps/preview',command:'npm run build && npx wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 5189',url:'http://127.0.0.1:5189',reuseExistingServer:false,timeout:120000}});
