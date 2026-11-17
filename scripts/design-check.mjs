import { createHash } from "node:crypto";
import { readdir, readFile, realpath } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export async function checkDesign(root = resolve("design")) {
	const manifestPath = join(root, "MANIFEST.json");
	const actual = [];
	async function walk(directory) {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) await walk(path);
			else if (entry.isFile()) {
				if (path !== manifestPath) actual.push(relative(root, path).split(sep).join("/"));
			} else throw new Error(`Unsupported filesystem entry: ${relative(root, path).split(sep).join("/")}`);
		}
	}
	await walk(root);
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	const expected = new Map(Object.entries(manifest.files ?? {}));
	const errors = [];
	for (const path of actual) {
		if (!expected.has(path)) errors.push(`Unexpected file: ${path}`);
		else {
			const digest = createHash("sha256")
				.update(await readFile(join(root, path)))
				.digest("hex");
			if (digest !== expected.get(path)) errors.push(`Hash mismatch: ${path}`);
		}
	}
	for (const path of expected.keys()) if (!actual.includes(path)) errors.push(`Missing file: ${path}`);
	if (errors.length) throw new Error(errors.join("\n"));
	return expected.size;
}

if (process.argv[1] && (await realpath(process.argv[1])) === fileURLToPath(import.meta.url)) {
	try {
		const count = await checkDesign();
		console.log(`Design reference is clean (${count} files).`);
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
