import { createContext, useEffect, useState } from "react";
import { getPreviewState, type PreviewSearch, type Theme } from "../state";

type ResolvedTheme = "light" | "dark";

export const BuilderTheme = createContext<ResolvedTheme>("light");

export function useSiteTheme(search: PreviewSearch, builder: boolean) {
	const { theme: urlTheme } = getPreviewState(search);
	const [saved, setSaved] = useState<ResolvedTheme | null>(null);
	const [system, setSystem] = useState<ResolvedTheme>("light");
	const override = search.theme;
	useEffect(() => {
		let stored: ResolvedTheme | null = null;
		try {
			if (override !== undefined && urlTheme === "system") localStorage.removeItem("tensquads.theme");
			const value = localStorage.getItem("tensquads.theme");
			if (value === "light" || value === "dark") stored = value;
		} catch {}
		setSaved(stored);
		if (!builder) {
			if (urlTheme === "system") delete document.documentElement.dataset.theme;
			return;
		}
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const selected = override === undefined ? (stored ?? "system") : urlTheme;
		const apply = () => {
			const next = media.matches ? "dark" : "light";
			setSystem(next);
			document.documentElement.dataset.theme = selected === "system" ? next : selected;
		};
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, [builder, override, urlTheme]);
	const theme: Theme = builder && override === undefined ? (saved ?? "system") : urlTheme;
	return { theme, resolvedTheme: theme === "system" ? system : theme };
}
