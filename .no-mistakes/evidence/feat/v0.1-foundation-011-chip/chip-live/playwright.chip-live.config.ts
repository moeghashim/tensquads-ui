import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
export default defineConfig({...base, use: {...base.use, baseURL: "http://localhost:5187"}, webServer: {...base.webServer, command: "npm run build:preview && cd apps/preview && npm exec -- wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 5187", url: "http://localhost:5187"}});
