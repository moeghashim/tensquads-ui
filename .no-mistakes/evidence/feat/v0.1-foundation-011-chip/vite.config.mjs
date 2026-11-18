import {defineConfig} from '../apps/preview/node_modules/vite/dist/node/index.js';
import react from '../apps/preview/node_modules/@vitejs/plugin-react/dist/index.js';
export default defineConfig({root:'.chip-live',plugins:[react()],server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:['..']}}});
