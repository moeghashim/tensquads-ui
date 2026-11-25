import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const componentsRoot = join(root, "packages/ui/src/react");
const outputPath = join(root, "llms.txt");
const checkOnly = process.argv.includes("--check");

const guide = await readFile(join(root, "DESIGN.md"), "utf8");
const css = await readFile(join(root, "packages/ui/src/tokens/tokens.css"), "utf8");
const tokens = new Set(Array.from(css.matchAll(/^\s*(--ts-[\w-]+):/gm), ([, name]) => name));
const references = new Set(guide.match(/--ts-(?:[\w-]+\*?|\*)/g));
const unknown = [...references].filter((name) =>
	name.endsWith("*") ? ![...tokens].some((token) => token.startsWith(name.slice(0, -1))) : !tokens.has(name),
);
if (unknown.length) throw new Error(`DESIGN.md refers to unknown tokens: ${unknown.join(", ")}`);

const entries = [];
for (const directory of (await readdir(componentsRoot, { withFileTypes: true })).filter((entry) =>
	entry.isDirectory(),
)) {
	const name = directory.name;
	const componentDirectory = join(componentsRoot, name);
	const files = await readdir(componentDirectory);
	if (files.includes(`${name}.openui.ts`) && !files.includes(`${name}.md`)) {
		throw new Error(`Registered component ${name} has no ${name}.md`);
	}
	if (files.includes(`${name}.md`)) {
		const markdown = await readFile(join(componentDirectory, `${name}.md`), "utf8");
		const summary = markdown
			.split(/\r?\n/)
			.find((line) => line.trim() && !line.startsWith("#"))
			?.trim();
		// The OpenUI description is the shortest plain statement of what the component is.
		const openui = files.includes(`${name}.openui.ts`)
			? await readFile(join(componentDirectory, `${name}.openui.ts`), "utf8")
			: "";
		const tagline = openui.match(/\n\tdescription:\s*"((?:[^"\\]|\\.)+)"/)?.[1];
		entries.push({
			name: markdown.match(/^# (\w+)\s*$/m)?.[1] ?? name,
			tagline,
			summary: summary || "Component documentation.",
			path: `packages/ui/src/react/${name}/${name}.md`,
		});
	}
}

entries.sort((left, right) => left.name.localeCompare(right.name));
const site = "https://tensquads-ui-preview.mohanadgh.workers.dev";
const generated = [
	"# tensquads UI component index",
	"",
	`@tensquads/ui is a React component library with ${entries.length} documented components. Live gallery: ${site}/components. Install and setup: README.md. Agent skill: .agents/skills/tensquads-ui/SKILL.md.`,
	"",
	"## Start here",
	"",
	"- [Design guide](DESIGN.md): Read this before you build a screen",
	"",
	"## Components",
	"",
	...entries.map(({ name, summary, path }) => `- [${name}](${path}): ${summary}`),
	"",
].join("\n");

// The README carries the same list as a table, so a reader finds the components on the first screen.
const readmePath = join(root, "README.md");
const startMarker = "<!-- components:start -->";
const endMarker = "<!-- components:end -->";
const brief = (name, summary) => {
	const sentences = summary.split(/(?<=\.)\s+/);
	return (
		sentences.find((sentence) => sentence.startsWith(`${name} `)) ??
		sentences.find((sentence) => !sentence.startsWith("Import ")) ??
		summary
	);
};
const table = [
	startMarker,
	"",
	"| Component | What it is | Live |",
	"|---|---|---|",
	...entries.map(
		({ name, tagline, summary, path }) =>
			`| [${name}](${path}) | ${(tagline ?? brief(name, summary)).replaceAll("|", "\\|")} | [open](${site}/components/${name}) |`,
	),
	"",
	endMarker,
].join("\n");
const readme = await readFile(readmePath, "utf8");
const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker);
if (start < 0 || end < start) throw new Error("README.md has no components markers.");
const nextReadme = readme.slice(0, start) + table + readme.slice(end + endMarker.length);

if (checkOnly) {
	let current = "";
	try {
		current = await readFile(outputPath, "utf8");
	} catch {
		// A missing generated file is stale output.
	}
	if (current !== generated) throw new Error("llms.txt is stale. Run npm run docs.");
	if (readme !== nextReadme) throw new Error("README.md component table is stale. Run npm run docs.");
	console.log(`llms.txt and README.md are current (${entries.length} component docs).`);
} else {
	await writeFile(outputPath, generated);
	await writeFile(readmePath, nextReadme);
	console.log(`Wrote llms.txt and the README.md component table (${entries.length} component docs).`);
}
