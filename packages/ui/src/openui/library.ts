import { createLibrary } from "@openuidev/react-lang";
import type { Locale } from "../schemas/index.js";
import { getRegisteredComponents } from "./registry.js";

const libraries = new Map<Locale, ReturnType<typeof createLibrary>>();

export function createTensquadsLibrary(locale: Locale) {
	const cached = libraries.get(locale);
	if (cached) return cached;

	const library = createLibrary({ components: [...getRegisteredComponents()] });
	libraries.set(locale, library);
	return library;
}
