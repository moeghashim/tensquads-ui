import files from "virtual:agent-docs";
import start, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
	fetch(request, ...args) {
		const url = new URL(request.url);
		const path = url.pathname;
		const markdown = path.endsWith(".md");
		if (markdown || path === "/llms.txt" || path === "/llms-full.txt") {
			if (request.method !== "GET" && request.method !== "HEAD") {
				return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
			}
			const key = markdown && url.searchParams.get("locale") === "ar" ? `${path}?locale=ar` : path;
			const body = Object.hasOwn(files, key) ? files[key] : undefined;
			if (body === undefined) return new Response(null, { status: 404 });
			return new Response(request.method === "HEAD" ? null : body, {
				headers: { "Content-Type": markdown ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8" },
			});
		}
		return start.fetch(request, ...args);
	},
});
