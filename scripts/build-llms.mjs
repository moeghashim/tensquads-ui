import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const componentsRoot = join(root, "packages/ui/src/react");
const outputPath = join(root, "llms.txt");
const checkOnly = process.argv.includes("--check");

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
		entries.push({
			name,
			summary: summary || "Component documentation.",
			path: `packages/ui/src/react/${name}/${name}.md`,
		});
	}
}

entries.sort((left, right) => left.name.localeCompare(right.name));
const generated = [
	"# tensquads UI component index",
	"",
	...entries.map(({ name, summary, path }) => `- [${name}](${path}): ${summary}`),
	"",
].join("\n");

if (checkOnly) {
	let current = "";
	try {
		current = await readFile(outputPath, "utf8");
	} catch {
		// A missing generated file is stale output.
	}
	if (current !== generated) throw new Error("llms.txt is stale. Run npm run docs.");
	console.log(`llms.txt is current (${entries.length} component docs).`);
} else {
	await writeFile(outputPath, generated);
	console.log(`Wrote llms.txt (${entries.length} component docs).`);
}
