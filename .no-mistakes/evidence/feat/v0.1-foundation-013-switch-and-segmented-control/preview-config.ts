import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: '../e2e', testMatch: 'phase-product.spec.ts', workers: 1,
 outputDir: '~/.no-mistakes/evidence/01M7Q6E1J64DFZ7GH4XRC3KVGC/browser-results',
 reporter: [['list'],['json',{outputFile:'~/.no-mistakes/evidence/01M7Q6E1J64DFZ7GH4XRC3KVGC/preview-results.json'}]],
 use:{baseURL:'http://localhost:5187',browserName:'chromium', trace:'retain-on-failure'},
 webServer:{cwd:process.cwd(),command:'npm run build:preview && node apps/preview/node_modules/wrangler/bin/wrangler.js dev --config apps/preview/dist/server/wrangler.json --ip 127.0.0.1 --port 5187',url:'http://localhost:5187',reuseExistingServer:false,timeout:120000,env:{WRANGLER_SEND_METRICS:'false'}}
});
