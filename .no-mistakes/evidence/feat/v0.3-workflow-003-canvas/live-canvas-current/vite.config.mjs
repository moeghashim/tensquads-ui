import { defineConfig } from 'vite';
export default defineConfig({root: '.canvas-live', server:{host:'127.0.0.1',port:5175,strictPort:true,fs:{allow:['..']}},resolve:{dedupe:['react','react-dom','@ui-sdk/core','@ui-sdk/react']}});
