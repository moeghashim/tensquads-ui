import {defineConfig} from '../apps/preview/node_modules/vite/dist/node/index.js';
export default defineConfig({root:'.local-dashboard-test',esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:['..']}}});
