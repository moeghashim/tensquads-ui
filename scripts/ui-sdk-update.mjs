import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const args = process.argv.slice(2);
const fixtureIndex = args.indexOf("--fixtures");
const fixturePath = fixtureIndex >= 0 ? args[fixtureIndex + 1] : undefined;
const dryRun = args.includes("--dry-run");

export function selectTargetVersion(tags) {
	const stable = tags.latest && !tags.latest.includes("-") && compare(tags.latest, "1.0.0") >= 0;
	return stable ? tags.latest : tags.beta;
}

export function compare(left, right) {
	const parse = (version) =>
		version
			.replace(/^v/, "")
			.split(/[.+-]/)
			.map((part) => (/^\d+$/.test(part) ? Number(part) : part));
	const a = parse(left);
	const b = parse(right);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const x = a[i] ?? 0;
		const y = b[i] ?? 0;
		if (x === y) continue;
		if (typeof x === "number" && typeof y === "number") return x > y ? 1 : -1;
		if (typeof x === "number") return 1;
		if (typeof y === "number") return -1;
		return String(x).localeCompare(String(y));
	}
	return 0;
}

export function makeBody(version, priorEntries, nextEntries, releases) {
	const added = nextEntries.filter((entry) => !priorEntries.includes(entry));
	const removed = priorEntries.filter((entry) => !nextEntries.includes(entry));
	return [
		`UI SDK ${version} update.`,
		"",
		"## Release notes",
		...releases.flatMap(({ name, url, body }) => [`### ${name}`, url, "", body || "No release notes provided.", ""]),
		"## Public entries",
		`Added: ${added.length ? added.join(", ") : "none"}`,
		`Removed: ${removed.length ? removed.join(", ") : "none"}`,
	].join("\n");
}

async function getJson(url) {
	const headers = { "User-Agent": "tensquads-ui-ui-sdk-update", Accept: "application/vnd.github+json" };
	// Unauthenticated GitHub API calls from shared runners hit the rate limit (403).
	if (process.env.GITHUB_TOKEN && url.startsWith("https://api.github.com/"))
		headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	const response = await fetch(url, { headers });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.json();
}

async function packageEntries(packageName, version) {
	const temp = await mkdtemp(join(tmpdir(), "ui-sdk-package-"));
	try {
		const [{ filename: archive }] = JSON.parse(
			execFileSync("npm", ["pack", `${packageName}@${version}`, "--pack-destination", temp, "--json"], {
				cwd: root,
				encoding: "utf8",
			}),
		);
		execFileSync("tar", ["-xzf", join(temp, archive), "-C", temp]);
		const pkg = JSON.parse(await readFile(join(temp, "package/package.json"), "utf8"));
		return Object.keys(pkg.exports ?? {})
			.filter((entry) => entry !== "./package.json")
			.sort()
			.map((entry) => `${packageName}${entry === "." ? "" : entry.slice(1)}`);
	} finally {
		await rm(temp, { recursive: true, force: true });
	}
}

async function loadData() {
	if (fixturePath) {
		const recorded = JSON.parse(await readFile(fixturePath, "utf8"));
		const version = selectTargetVersion(recorded.npm.react["dist-tags"]);
		if (version !== selectTargetVersion(recorded.npm.core["dist-tags"])) {
			throw new Error("UI SDK packages have different target dist-tag versions");
		}
		return {
			version,
			currentVersion: recorded.currentVersion,
			currentEntries: recorded.currentEntries,
			entries: recorded.targetEntries,
			tag: `@ui-sdk/react@${version}`,
			releases: ["core", "react"].map((name) => ({
				name: `@ui-sdk/${name}`,
				url: recorded.github[name].html_url,
				body: recorded.github[name].body,
			})),
		};
	}
	const [react, core] = await Promise.all([
		getJson("https://registry.npmjs.org/@ui-sdk%2Freact"),
		getJson("https://registry.npmjs.org/@ui-sdk%2Fcore"),
	]);
	const version = selectTargetVersion(react["dist-tags"]);
	if (version !== selectTargetVersion(core["dist-tags"]))
		throw new Error("UI SDK packages have different target dist-tag versions");
	const releases = await Promise.all(
		["core", "react"].map(async (name) => {
			const releaseTag = encodeURIComponent(`@ui-sdk/${name}@${version}`);
			const release = await getJson(`https://api.github.com/repos/vercel-labs/ui/releases/tags/${releaseTag}`);
			return { name: `@ui-sdk/${name}`, url: release.html_url, body: release.body };
		}),
	);
	const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
	const names = ["@ui-sdk/core", "@ui-sdk/react"];
	const [currentEntries, entries] = await Promise.all([
		Promise.all(names.map((name) => packageEntries(name, packageJson.dependencies[name]))),
		Promise.all(names.map((name) => packageEntries(name, version))),
	]);
	return {
		version,
		currentVersion: packageJson.dependencies["@ui-sdk/react"],
		currentEntries: currentEntries.flat(),
		entries: entries.flat(),
		releases,
		tag: `@ui-sdk/react@${version}`,
	};
}

async function installSkill(tag) {
	const temp = await mkdir(join(tmpdir(), `ui-sdk-skill-${process.pid}`), { recursive: true }).then(() =>
		join(tmpdir(), `ui-sdk-skill-${process.pid}`),
	);
	try {
		const archive = join(temp, "upstream.tar.gz");
		execFileSync("curl", [
			"-L",
			"--fail",
			"--silent",
			"--show-error",
			`https://api.github.com/repos/vercel-labs/ui/tarball/${encodeURIComponent(tag)}`,
			"-o",
			archive,
		]);
		execFileSync("tar", ["-xzf", archive, "-C", temp]);
		const [folder] = await readdir(temp, { withFileTypes: true }).then((items) =>
			items.filter((item) => item.isDirectory()).map((item) => item.name),
		);
		const source = join(temp, folder, "packages/core/skills/ui-sdk");
		const target = join(root, ".agents/skills/ui-sdk");
		await rm(target, { recursive: true, force: true });
		await mkdir(target, { recursive: true });
		const copyTree = async (from, to) => {
			for (const item of await readdir(from, { withFileTypes: true })) {
				const src = join(from, item.name);
				const dest = join(to, item.name);
				if (item.isDirectory()) {
					await mkdir(dest, { recursive: true });
					await copyTree(src, dest);
				} else await copyFile(src, dest);
			}
		};
		await copyTree(source, target);
	} finally {
		await rm(temp, { recursive: true, force: true });
	}
}

async function main() {
	const data = await loadData();
	const body = makeBody(data.version, data.currentEntries ?? [], data.entries ?? [], data.releases ?? []);
	if (data.currentVersion && compare(data.version, data.currentVersion) <= 0) {
		console.log("already current, no PR");
		return;
	}
	if (dryRun) {
		console.log(
			JSON.stringify({ version: data.version, tag: data.tag ?? `@ui-sdk/react@${data.version}`, body }, null, 2),
		);
		return;
	}
	const packagePath = join(root, "package.json");
	const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
	for (const name of ["@ui-sdk/core", "@ui-sdk/react"]) packageJson.dependencies[name] = data.version;
	await writeFile(packagePath, `${JSON.stringify(packageJson, null, "\t")}\n`);
	execFileSync("npm", ["install", "--package-lock-only", "--ignore-scripts"], { cwd: root, stdio: "inherit" });
	await installSkill(data.tag ?? `@ui-sdk/react@${data.version}`);
	await writeFile(join(root, "ui-sdk-update-body.md"), body);
	if (process.env.GITHUB_OUTPUT)
		await writeFile(process.env.GITHUB_OUTPUT, `version=${data.version}\n`, { flag: "a" });
	console.log(`updated to ${data.version}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
