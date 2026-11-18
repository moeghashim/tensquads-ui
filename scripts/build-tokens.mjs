import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

function cssName(name) {
	return `--ts-${name.replaceAll(".", "-")}`;
}

function mapFontFamily(name, family) {
	// Keep design tokens authoritative while adding the product fallback faces defined by D17.
	if (name === "sans")
		return `"Inter", "IBM Plex Sans Arabic", ${family
			.split(",")
			.slice(1)
			.map((part) => part.trim())
			.join(", ")}`;
	if (name === "mono" && !family.includes("JetBrains Mono")) return `"JetBrains Mono", ${family}`;
	return family;
}

function resolveValue(value, source, theme, css = false) {
	if (typeof value !== "string") return value;
	return value.replace(/\{([^}]+)\}/g, (_match, name) => {
		if (css) return `var(${cssName(name)})`;
		const token = Object.values(source)
			.flatMap((group) => group?.tokens ?? [])
			.find((item) => item.name === name);
		if (!token) return `{${name}}`;
		const tokenValue = token.value;
		return resolveValue(typeof tokenValue === "object" ? tokenValue[theme] : tokenValue, source, theme);
	});
}

function entriesFrom(source, resolve = false) {
	const entries = [];
	for (const [group, value] of Object.entries(source)) {
		if (group === "name" || group === "version" || group === "meta") continue;
		if (group === "type") {
			for (const [name, family] of Object.entries(value.families)) {
				const mappedFamily = mapFontFamily(name, family);
				entries.push([`font-${name}`, { light: mappedFamily, dark: mappedFamily }]);
			}
			for (const styleGroup of value.groups) {
				for (const style of styleGroup.styles) {
					for (const [property, tokenValue] of Object.entries(style)) {
						if (["name", "usage", "family"].includes(property)) continue;
						const propertyName = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
						entries.push([
							`${style.name}.${propertyName}`,
							{ light: String(tokenValue), dark: String(tokenValue) },
						]);
					}
					const family = style.family ?? styleGroup.family;
					if (family) {
						const mappedFamily = mapFontFamily(family, value.families[family]);
						entries.push([`${style.name}.font-family`, { light: mappedFamily, dark: mappedFamily }]);
					}
				}
			}
			continue;
		}
		for (const token of value.tokens ?? []) {
			const tokenValue = token.value;
			const values = typeof tokenValue === "object" ? tokenValue : { light: tokenValue, dark: tokenValue };
			entries.push([
				token.name,
				resolve
					? { light: resolveValue(values.light, source, "light"), dark: resolveValue(values.dark, source, "dark") }
					: values,
			]);
		}
	}
	return entries;
}

export function generateCss(source) {
	const entries = entriesFrom(source);
	const declarations = (theme) =>
		entries
			.map(([name, values]) => `  ${cssName(name)}: ${resolveValue(values[theme], source, theme, true)};`)
			.join("\n");
	return `@layer tensquads {\n  :root,\n  [data-theme="light"] {\n${declarations("light")}\n  }\n\n  [data-theme="dark"] {\n${declarations("dark")}\n  }\n\n  @media (prefers-color-scheme: dark) {\n    :root:not([data-theme="light"]) {\n${declarations("dark").replace(/^/gm, "  ")}\n    }\n  }\n}\n`;
}

export function generateTypes(source) {
	const grouped = {};
	for (const [name, values] of entriesFrom(source, true)) {
		grouped[name] = values;
	}
	const serialized = Object.entries(grouped)
		.map(
			([name, values]) =>
				`\t${JSON.stringify(name)}: {\n\t\tlight: ${JSON.stringify(values.light)},\n\t\tdark: ${JSON.stringify(values.dark)},\n\t},`,
		)
		.join("\n");
	return `/** Generated from design/tokens.json. Do not edit by hand. */\nexport const tokens = {\n${serialized}\n} as const;\n\nexport type TokenName = keyof typeof tokens;\nexport type TokenTheme = "light" | "dark";\nexport type TokenValue<Name extends TokenName> = (typeof tokens)[Name][TokenTheme];\n`;
}

export async function buildTokens({ check = false, root = fileURLToPath(new URL("../", import.meta.url)) } = {}) {
	const base = root.endsWith("/") ? root : `${root}/`;
	const sourcePath = `${base}design/tokens.json`;
	const cssPath = `${base}packages/ui/src/tokens/tokens.css`;
	const tsPath = `${base}packages/ui/src/tokens/tokens.ts`;
	const source = JSON.parse(await readFile(sourcePath, "utf8"));
	const outputs = [
		[cssPath, generateCss(source)],
		[tsPath, generateTypes(source)],
	];
	let stale = false;
	for (const [path, contents] of outputs) {
		if (check) {
			let current = "";
			try {
				current = await readFile(path, "utf8");
			} catch {
				/* Missing output is stale. */
			}
			if (current !== contents) {
				console.error(`${path.slice(base.length)} is stale. Run npm run tokens.`);
				stale = true;
			}
		} else {
			await writeFile(path, contents);
		}
	}
	return stale;
}

if (process.argv[1]?.endsWith("/scripts/build-tokens.mjs")) {
	if (await buildTokens({ check: process.argv.includes("--check") })) process.exitCode = 1;
}
