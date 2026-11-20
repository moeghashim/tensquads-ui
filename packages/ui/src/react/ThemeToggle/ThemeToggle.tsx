import { createLocalStorage, createPreference } from "@ui-sdk/core";
import { Preferences } from "@ui-sdk/react/preferences";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "../../schemas/index.js";
import { Button } from "../Button/Button.js";

export const themePreference = createPreference({
	values: ["light", "dark"] as const,
	defaultValue: "light",
	attribute: "data-theme",
	global: true,
	storage: createLocalStorage("tensquads.theme"),
});

export const themeInitScript = `(()=>{try{const t=localStorage.getItem("tensquads.theme");document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))}catch{document.documentElement.setAttribute("data-theme",matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}})()`;

export type ThemeToggleLabels = { toLight: string; toDark: string };
export type ThemeToggleProps = Omit<
	React.ComponentProps<typeof Button>,
	"children" | "aria-label" | "variant" | "size" | "iconOnly"
> & {
	value?: "light" | "dark";
	onValueChange?: (next: "light" | "dark") => void;
	locale?: Locale;
	labels?: Partial<ThemeToggleLabels>;
};

const defaultLabels = {
	en: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
	ar: { toLight: "التبديل إلى المظهر الفاتح", toDark: "التبديل إلى المظهر الداكن" },
} satisfies Record<Locale, ThemeToggleLabels>;

export function ThemeToggle({ value, onValueChange, locale = "en", labels, className, ...props }: ThemeToggleProps) {
	const copy = { ...defaultLabels[locale], ...labels };
	if (value !== undefined) {
		return (
			<ThemeToggleButton
				{...props}
				className={className}
				theme={value}
				label={value === "light" ? copy.toDark : copy.toLight}
				onChoose={onValueChange}
			/>
		);
	}
	return <UncontrolledThemeToggle {...props} className={className} labels={copy} onValueChange={onValueChange} />;
}

function UncontrolledThemeToggle({
	labels,
	onValueChange,
	...props
}: Omit<ThemeToggleProps, "value" | "locale" | "labels"> & { labels: ThemeToggleLabels }) {
	const [mounted, setMounted] = useState(false);
	const theme = useSyncExternalStore<"light" | "dark">(
		(listener) => themePreference.subscribe(() => listener()),
		() => themePreference.get().value as "light" | "dark",
		() => "light",
	);
	useEffect(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem("tensquads.theme");
		} catch {
			stored = null;
		}
		if (stored !== "light" && stored !== "dark") {
			const systemTheme: "light" | "dark" = window.matchMedia?.("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			if (themePreference.get().value !== systemTheme) themePreference.set(systemTheme);
		}
		setMounted(true);
	}, []);
	const shownTheme = mounted ? theme : "light";
	return (
		<Preferences preferences={[themePreference]}>
			<ThemeToggleButton
				{...props}
				theme={shownTheme}
				label={mounted && shownTheme === "dark" ? labels.toLight : labels.toDark}
				onChoose={(next) => {
					themePreference.set(next);
					onValueChange?.(next);
				}}
			/>
		</Preferences>
	);
}

function ThemeToggleButton({
	theme,
	label,
	onChoose,
	onClick: buttonOnClick,
	className,
	...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-label" | "variant" | "size" | "iconOnly"> & {
	theme: "light" | "dark";
	label: string;
	onChoose?: (next: "light" | "dark") => void;
}) {
	return (
		<Button
			{...props}
			aria-label={label}
			variant="ghost"
			iconOnly
			className={
				typeof className === "function"
					? (state) => ["ts-theme-toggle", className(state)].filter(Boolean).join(" ")
					: ["ts-theme-toggle", className].filter(Boolean).join(" ")
			}
			onClick={(...args) => {
				onChoose?.(theme === "light" ? "dark" : "light");
				return buttonOnClick?.(...args);
			}}
		>
			<svg
				className="ts-theme-toggle__icon ts-theme-toggle__sun"
				data-visible={theme === "light"}
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
			>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
			</svg>
			<svg
				className="ts-theme-toggle__icon ts-theme-toggle__moon"
				data-visible={theme === "dark"}
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
			</svg>
		</Button>
	);
}
