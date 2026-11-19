import { createElement } from "react";
import syncedWordmark from "../../../../design/logo/wordmark.svg?raw";

// The synced wordmark draws its ink in near-black; the site recolours it so it follows the theme.
const logoSource = syncedWordmark.replaceAll("#151515", "currentColor");

const viewBox = /<svg\b[^>]*\bviewBox="([^"]+)"/.exec(logoSource)?.[1] ?? "0 0 281.2 64";
const wordmarkShapes = [...logoSource.matchAll(/<(line|circle|rect|path)\b([^>]*)\/>/g)].flatMap((match, index) => {
	const shapeName = match[1];
	const attributes = match[2];
	if (!shapeName || attributes === undefined) return [];

	const reactAttributes = Object.fromEntries(
		[...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].flatMap(([, name, value]) =>
			name && value !== undefined
				? [[name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()), value]]
				: [],
		),
	);
	return [createElement(shapeName, { ...reactAttributes, key: index })];
});

export function TensquadsWordmark() {
	return (
		<svg
			className="site-brand__wordmark"
			viewBox={viewBox}
			aria-hidden="true"
			focusable="false"
			style={{ color: "var(--ts-text-emphasis)" }}
		>
			{wordmarkShapes}
		</svg>
	);
}
