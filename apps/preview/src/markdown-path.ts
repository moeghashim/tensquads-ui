import type { Locale } from "./state";

export function markdownPath(path: string, locale: Locale = "en") {
	const base = path.replace(/\/$/, "") || "/index";
	return `${base}.md${locale === "ar" ? "?locale=ar" : ""}`;
}
