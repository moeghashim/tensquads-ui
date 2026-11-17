export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";
export type Theme = "light" | "dark" | "system";

export type PreviewAttributesInput = {
	locale: Locale;
	theme: Theme;
	direction?: Direction;
};

export type PreviewSearch = Record<string, unknown>;

export function getPreviewState(search: PreviewSearch): PreviewAttributesInput & { direction: Direction } {
	const locale: Locale = search.locale === "ar" ? "ar" : "en";
	const theme: Theme = search.theme === "dark" || search.theme === "light" ? search.theme : "system";
	const direction = search.dir === "rtl" || search.dir === "ltr" ? search.dir : locale === "ar" ? "rtl" : "ltr";
	return { locale, direction, theme };
}

export function getPreviewAttributes(search: PreviewSearch) {
	const { locale, theme, direction } = getPreviewState(search);
	return {
		lang: locale,
		dir: direction,
		...(theme === "system" ? {} : { "data-theme": theme }),
	};
}
