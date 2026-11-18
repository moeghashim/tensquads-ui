import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

export function findUiSdkImports(files) {
	const found = [];
	for (const [file, source] of Object.entries(files)) {
		for (const match of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)\s*["'](@ui-sdk\/[^"']+)["']/g)) {
			found.push({ file, specifier: match[1] });
		}
	}
	return found;
}

export function validateUiSdkImports(imports, publicEntries) {
	const errors = [];
	for (const { file, specifier } of imports) {
		const [, packageName, entry = "."] = specifier.match(/^(@ui-sdk\/(?:core|react))(?:\/(.*))?$/) ?? [];
		if (!packageName || entry.split("/").includes("internal")) {
			errors.push(`${file}: ${specifier} is not a public UI SDK entry`);
		} else if (!publicEntries[packageName]?.has(entry === "." ? "." : `./${entry}`)) {
			errors.push(`${file}: ${specifier} is not listed as a public UI SDK entry`);
		}
	}
	return errors;
}

async function collectFiles(directory) {
	const output = {};
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) Object.assign(output, await collectFiles(path));
		else if (/\.[cm]?[jt]sx?$/.test(entry.name)) output[path] = await readFile(path, "utf8");
	}
	return output;
}

const files = await collectFiles(join(root, "packages/ui/src"));
const imports = findUiSdkImports(files);
const publicEntries = {};
for (const packageName of ["@ui-sdk/core", "@ui-sdk/react"]) {
	const packageJson = JSON.parse(await readFile(join(root, "node_modules", packageName, "package.json"), "utf8"));
	const docsPath = join(root, "node_modules", packageName, "docs/llms.txt");
	let entries;
	try {
		const docs = await readFile(docsPath, "utf8");
		entries = new Set([...docs.matchAll(/(?:@ui-sdk\/(?:core|react))\/([\w-]+)/g)].map((match) => `./${match[1]}`));
		if (docs.includes(`${packageName}\n`)) entries.add(".");
	} catch {
		entries = new Set(Object.keys(packageJson.exports ?? {}).filter((entry) => entry !== "./package.json"));
	}
	publicEntries[packageName] = entries;
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const coreVersion = packageJson.dependencies["@ui-sdk/core"];
const reactVersion = packageJson.dependencies["@ui-sdk/react"];
if (coreVersion !== reactVersion) throw new Error(`UI SDK versions differ: core ${coreVersion}, react ${reactVersion}`);
const errors = validateUiSdkImports(imports, publicEntries);
if (errors.length) throw new Error(errors.join("\n"));
console.log(`Checked ${imports.length} UI SDK imports; both packages are pinned to ${coreVersion}.`);
