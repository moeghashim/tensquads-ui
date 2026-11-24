import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { buildMarkdown } from "./site-markdown";

const moduleId = "virtual:agent-docs";
const routeTree = new URL("../src/routeTree.gen.ts", import.meta.url);

export function agentDocs(): Plugin {
	return {
		name: "agent-docs",
		resolveId(id) {
			if (id === moduleId) return `\0${moduleId}`;
		},
		load(id) {
			if (id !== `\0${moduleId}`) return;
			const { files, routePatterns } = buildMarkdown();
			if (this.environment.mode === "build") {
				const tree = readFileSync(routeTree, "utf8");
				const routes = /export interface FileRoutesByFullPath \{\n([^}]+)\}/.exec(tree);
				const paths = new Set(Array.from(routes?.[1]?.matchAll(/^\s+['"]([^'"]+)['"]:/gm) ?? [], ([, path]) => path));
				for (const path of routePatterns) {
					if (!paths.delete(path)) throw new Error(`Markdown twin refers to an unknown route: ${path}`);
				}
				if (paths.size) throw new Error(`Missing Markdown twins for: ${Array.from(paths).join(", ")}`);
			}
			return `export default ${JSON.stringify(files)};`;
		},
	};
}
