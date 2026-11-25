import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const header = "/* Generated from design/agent-ui/components/bundle.js. Do not edit by hand. */";

function readString(source, cursor) {
	const quote = source[cursor];
	let value = "";
	for (let index = cursor + 1; index < source.length; index += 1) {
		const character = source[index];
		if (character === quote) return { value, cursor: index + 1 };
		if (character !== "\\") {
			value += character;
			continue;
		}
		const escaped = source[index + 1];
		const escapes = { "\\": "\\", "'": "'", '"': '"', n: "\n", r: "\r", t: "\t" };
		if (!(escaped in escapes)) throw new Error("Unsupported escape in ICONS string literal.");
		value += escapes[escaped];
		index += 1;
	}
	throw new Error("Unterminated string in ICONS object literal.");
}

function skipWhitespace(source, cursor) {
	while (/\s/.test(source[cursor] ?? "")) cursor += 1;
	return cursor;
}

export function parseIcons(source) {
	const matches = [...source.matchAll(/\bvar\s+ICONS\s*=\s*\{/g)];
	if (matches.length !== 1) throw new Error(`Expected one ICONS object literal; found ${matches.length}.`);
	let cursor = matches[0].index + matches[0][0].length;
	const icons = {};

	while (true) {
		cursor = skipWhitespace(source, cursor);
		if (source[cursor] === "}") break;

		let name;
		if (source[cursor] === "'" || source[cursor] === '"') {
			({ value: name, cursor } = readString(source, cursor));
		} else {
			const identifier = /^[A-Za-z_$][\w$]*/.exec(source.slice(cursor));
			if (!identifier) throw new Error(`Invalid ICONS key at offset ${cursor}; expected a string key.`);
			name = identifier[0];
			cursor += name.length;
		}

		cursor = skipWhitespace(source, cursor);
		if (source[cursor] !== ":") throw new Error(`Invalid ICONS entry ${JSON.stringify(name)}; expected ':'.`);
		cursor = skipWhitespace(source, cursor + 1);
		if (source[cursor] !== "'" && source[cursor] !== '"') {
			throw new Error(`Invalid ICONS value for ${JSON.stringify(name)}; expected a string.`);
		}
		const parsed = readString(source, cursor);
		if (Object.hasOwn(icons, name)) throw new Error(`Duplicate ICONS key ${JSON.stringify(name)}.`);
		icons[name] = parsed.value;
		cursor = skipWhitespace(source, parsed.cursor);
		if (source[cursor] === ",") {
			cursor = skipWhitespace(source, cursor + 1);
			if (source[cursor] !== "}") continue;
		} else if (source[cursor] !== "}") {
			throw new Error(`Invalid ICONS entry after ${JSON.stringify(name)}; expected ',' or '}'.`);
		}
		break;
	}

	if (Object.keys(icons).length === 0) throw new Error("The ICONS object literal is empty.");
	return Object.fromEntries(Object.entries(icons).sort(([a], [b]) => a.localeCompare(b)));
}

export function generateIcons(icons) {
	const entries = Object.entries(icons)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([name, path]) => {
			const property = /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
			const value = JSON.stringify(path);
			return property.length + value.length + 6 > 120 && value.length < 120
				? `\t${property}:\n\t\t${value},`
				: `\t${property}: ${value},`;
		})
		.join("\n");
	return `${header}\nexport const ICON_PATHS = {\n${entries}\n} as const;\n\nexport type IconName = keyof typeof ICON_PATHS;\n`;
}

export async function buildIcons({ check = false, root = fileURLToPath(new URL("../", import.meta.url)) } = {}) {
	const base = root.endsWith("/") ? root : `${root}/`;
	const source = await readFile(`${base}design/agent-ui/components/bundle.js`, "utf8");
	const outputPath = `${base}packages/ui/src/icons/icons.ts`;
	const output = generateIcons(parseIcons(source));
	if (check) {
		let current = "";
		try {
			current = await readFile(outputPath, "utf8");
		} catch {
			/* Missing output is stale. */
		}
		if (current !== output) {
			console.error("packages/ui/src/icons/icons.ts is stale. Run npm run icons.");
			return true;
		}
		return false;
	}
	await writeFile(outputPath, output);
	return false;
}

if (process.argv[1]?.endsWith("/scripts/build-icons.mjs")) {
	try {
		if (await buildIcons({ check: process.argv.includes("--check") })) process.exitCode = 1;
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}
