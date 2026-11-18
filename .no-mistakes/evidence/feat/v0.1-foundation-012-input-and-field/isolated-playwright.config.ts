import {defineConfig} from '@playwright/test';
import config from './playwright.config';
export default defineConfig({...config,use:{...config.use,baseURL:'http://localhost:5185'},webServer:{command:'cd apps/preview && node node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 5185',url:'http://localhost:5185',reuseExistingServer:false,timeout:120000}});
