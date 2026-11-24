import { readFileSync, readdirSync } from "node:fs";
import { extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { archivedHomepage } from "../src/reference-exclusions";

const designRoot = new URL("../../../design/", import.meta.url);
const contentTypes: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
};

export function designStatic(): Plugin {
	const folders = ["screens", "pages", "mascots/avatars", "mascots/svg", "logo"];
	const paths = folders.flatMap((folder) =>
		readdirSync(new URL(`${folder}/`, designRoot), { recursive: true, withFileTypes: true })
			.filter((entry) => entry.isFile())
			.map((entry) => `${entry.parentPath}/${entry.name}`),
	);
	const assets = new Map<string, string>();
	for (const path of paths) {
		const asset = relative(fileURLToPath(designRoot), path).replaceAll("\\", "/");
		if (asset.startsWith(`pages/${archivedHomepage.pageId}/`)) continue;
		assets.set(`/design/${asset}`, path);
	}

	return {
		name: "design-static",
		configureServer(server) {
			server.middlewares.use((request, response, next) => {
				const url = request.url?.split("?")[0] ?? "";
				const path = assets.get(url);
				if (!path) return next();
				response.setHeader("Content-Type", contentTypes[extname(path)] ?? "application/octet-stream");
				response.end(request.method === "HEAD" ? undefined : readFileSync(path));
			});
		},
		generateBundle() {
			if (this.environment.name !== "client") return;
			for (const [url, path] of assets) {
				this.emitFile({ type: "asset", fileName: url.slice(1), source: readFileSync(path) });
			}
		},
	};
}
