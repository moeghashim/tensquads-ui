import { useRouterState } from "@tanstack/react-router";
import { markdownPath } from "../markdown-path";
import type { Locale } from "../state";

export function useMarkdownHref(locale: Locale) {
	return useRouterState({
		select: ({ location, matches }) =>
			matches.length > 1 && matches.every(({ status }) => status === "success")
				? markdownPath(location.pathname, locale)
				: undefined,
	});
}
