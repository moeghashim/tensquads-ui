import { defineConfig } from '../apps/preview/node_modules/vite/dist/node/index.js';
export default defineConfig({root:process.cwd(),esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:5188,strictPort:true}});
