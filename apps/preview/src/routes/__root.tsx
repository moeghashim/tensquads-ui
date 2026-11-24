import { createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../layers.css";
import "@tensquads/ui/fonts.css";
import "@tensquads/ui/tokens.css";
import "@tensquads/ui/styles.css";
import { SiteShell } from "../components/site-shell";
import { getPreviewAttributes } from "../state";
import "../styles.css";
import "../styles/node-preview.css";
import "../styles/design-system.css";
import "../styles/stream-demo.css";
import faviconUrl from "../../../../design/logo/favicon.svg?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "tensquads design system" },
		],
		links: [{ rel: "icon", type: "image/svg+xml", href: faviconUrl }],
	}),
	component: RootPage,
	shellComponent: Document,
});

function RootPage() {
	return <SiteShell />;
}

function Document({ children }: { readonly children: ReactNode }) {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const attributes = getPreviewAttributes(search);
	return (
		<html lang={attributes.lang} dir={attributes.dir} data-theme={attributes["data-theme"]}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
