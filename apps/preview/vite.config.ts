import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const uiSource = fileURLToPath(new URL("../../packages/ui/src/", import.meta.url));

export default defineConfig({
	plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), tanstackStart(), viteReact()],
	css: {
		lightningcss: {
			// Features.DirSelector: language-based lowering breaks explicit dir overrides.
			exclude: 4,
		},
	},
	resolve: {
		alias: [
			{ find: "@tensquads/ui/fonts.css", replacement: `${uiSource}fonts.css` },
			{ find: "@tensquads/ui/tokens.css", replacement: `${uiSource}tokens/tokens.css` },
			{ find: "@tensquads/ui/styles.css", replacement: `${uiSource}styles/styles.css` },
			{ find: /^@tensquads\/ui\/(.+)$/, replacement: `${uiSource}$1` },
		],
	},
});
