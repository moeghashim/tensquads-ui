import canvas from "../../../design/screens/canvas.json" with { type: "json" };
import { siteCopy } from "./copy";
import { archivedHomepage } from "./reference-exclusions";
import type { Locale } from "./state";

export const foundationNames = [
	"colour",
	"typography",
	"spacing",
	"radius",
	"shadow",
	"motion",
	"logo",
	"mascots",
] as const;
export type FoundationName = (typeof foundationNames)[number];

export const referenceSections = [
	{ id: "principles", path: "/foundations/principles" },
	{ id: "screens", path: "/reference/screens" },
	{ id: "pages", path: "/reference/pages" },
	{ id: "states", path: "/reference/mascot-states" },
] as const;

export const productScreens = canvas.order
	.filter((file) => file !== archivedHomepage.screenFile)
	.map((file) => {
		const board = canvas.boards[file as keyof typeof canvas.boards];
		if (!board) throw new Error(`Missing product screen metadata for ${file}`);
		const id = file
			.replace(".dc.html", "")
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			.toLowerCase();
		return { id, src: `/design/screens/${file}`, title: board.title, width: board.w, height: board.h };
	});

export function productScreenTitle(screen: (typeof productScreens)[number], locale: Locale) {
	const titles: Record<string, string> = siteCopy[locale].reference.screenTitles;
	return titles[screen.id] ?? screen.title;
}

export const pageDesigns = [
	{
		id: "squadmates-sidebar",
		src: "/design/pages/squadmates-sidebar/sidebar.html",
		width: 1180,
		height: 760,
		screenshot: "/design/pages/squadmates-sidebar/sidebar.png",
	},
] as const;

export const liveHomepages = {
	en: "https://tensquads-website.mohanadgh.workers.dev/",
	ar: "https://tensquads-website-ar.mohanadgh.workers.dev/",
} satisfies Record<Locale, string>;
