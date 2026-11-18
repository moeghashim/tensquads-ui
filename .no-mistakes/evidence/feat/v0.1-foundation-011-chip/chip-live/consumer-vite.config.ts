import {defineConfig} from "vite";
export default defineConfig({root: "apps/preview/.chip-live", resolve:{dedupe:["react","react-dom"]}, esbuild:{jsx:"automatic"}, server:{host:"127.0.0.1",port:5188,strictPort:true}, build:{outDir:"dist"}});
