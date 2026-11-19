import {defineConfig} from '../../apps/preview/node_modules/vite/dist/node/index.js';
export default defineConfig({root: new URL('.',import.meta.url).pathname, esbuild:{jsx:'automatic'}, server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:[new URL('../..',import.meta.url).pathname]}}});
