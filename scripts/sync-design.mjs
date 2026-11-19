import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repository = "https://github.com/moeghashim/tensquads-design-system.git";
const defaultCommit = "644fd15aa8c18dbb0ec5c83181426a7719a5dc4f";
const root = resolve("design");
const commit = process.argv[2] ?? defaultCommit;
if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error("Pass a full 40-character commit SHA.");

const temporary = await mkdtemp(resolve(".design-sync-"));
const checkout = join(temporary, "source");
const staging = join(temporary, "design");
try {
	await exec("git", ["clone", "--filter=blob:none", "--no-checkout", repository, checkout]);
	await exec("git", ["-C", checkout, "checkout", "--detach", commit]);
	const componentDocs = [];
	for (const name of await readdir(join(checkout, "agent-ui/components"))) {
		try {
			await stat(join(checkout, "agent-ui/components", name, "README.md"));
			componentDocs.push([`agent-ui/components/${name}/README.md`, `agent-ui/components/${name}/README.md`]);
		} catch {}
	}
	const files = [
		["agent-ui/tokens.json", "tokens.json"],
		["agent-ui/README.md", "agent-ui/README.md"],
		["agent-ui/data-display.md", "agent-ui/data-display.md"],
		["README.md", "ATTRIBUTION.md"],
		...componentDocs,
		...[...(await readdir(join(checkout, "mascots/svg")))].map((name) => [
			`mascots/svg/${name}`,
			`mascots/svg/${name}`,
		]),
		...[...(await readdir(join(checkout, "mascots/states")))].map((name) => [
			`mascots/states/${name}`,
			`mascots/states/${name}`,
		]),
		["mascots/mascots.json", "mascots/mascots.json"],
		...[
			"apple-touch-icon.png",
			"favicon-32.png",
			"favicon.svg",
			"logo-512.png",
			"logo-dark-512.png",
			"logo-dark.svg",
			"logo.svg",
			"wordmark.svg",
			"wordmark-dark.svg",
		].map((name) => [`logo/${name}`, `logo/${name}`]),
	];
	const hashes = {};
	for (const [sourcePath, outputPath] of files) {
		const source = join(checkout, sourcePath);
		const output = join(staging, outputPath);
		const contents = await readFile(source);
		await mkdir(join(output, ".."), { recursive: true });
		await cp(source, output);
		hashes[outputPath] = createHash("sha256").update(contents).digest("hex");
	}
	const manifest = {
		source: repository,
		commit,
		syncedAt: new Date().toISOString().slice(0, 10),
		files: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))),
	};
	await writeFile(join(staging, "MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
	await rm(root, { recursive: true, force: true });
	await rename(staging, root);
	console.log(`Synced ${Object.keys(hashes).length} files from ${commit}.`);
	console.log("Skipped previews, bundle.js/css, screens, PNG/JPEG mascot lineups, avatars, and mascot cards.");
} finally {
	await rm(temporary, { recursive: true, force: true });
}
