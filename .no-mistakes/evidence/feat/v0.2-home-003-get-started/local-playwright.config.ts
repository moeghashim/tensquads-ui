import config from './playwright.config';
export default {
 ...config,
 use: { ...config.use, baseURL: 'http://127.0.0.1:5278' },
 webServer: {
  ...config.webServer,
  command: 'npm run build:preview && cd apps/preview && ./node_modules/.bin/wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 5278',
  url: 'http://127.0.0.1:5278',
 },
};
