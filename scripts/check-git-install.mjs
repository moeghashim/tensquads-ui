import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workspace = process.env.GITHUB_WORKSPACE;
const commit = process.env.GIT_INSTALL_SHA;
if (!workspace || !commit) {
	console.error("Set GITHUB_WORKSPACE and GIT_INSTALL_SHA to check the git install fixture.");
	process.exit(1);
}

const fixture = await mkdtemp(join(tmpdir(), "tensquads-ui-git-install-"));
const run = (command, args) => {
	const result = spawnSync(command, args, { cwd: fixture, stdio: "inherit", env: process.env });
	if (result.status !== 0) process.exit(result.status ?? 1);
};

try {
	run("npm", ["init", "-y"]);
	run("npm", ["install", `git+file://${workspace}#${commit}`, "react@19", "react-dom@19"]);
	const packageJsonPath = join(fixture, "node_modules/@tensquads/ui/package.json");
	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
	const distPath = join(fixture, "node_modules/@tensquads/ui/packages/ui/dist");
	await stat(distPath);
	const sdkList = spawnSync("npm", ["ls", "@anthropic-ai/sdk", "--all", "--json", "--long"], {
		cwd: fixture,
		encoding: "utf8",
		env: process.env,
	});
	const sdkTree = JSON.parse(sdkList.stdout);
	if (sdkTree.dependencies?.["@anthropic-ai/sdk"]) throw new Error("The optional Anthropic peer was installed.");
	for (const [subpath, target] of Object.entries(packageJson.exports)) {
		const moduleSpecifier = subpath === "." ? "@tensquads/ui" : `@tensquads/ui/${subpath.slice(2)}`;
		const entry = typeof target === "string" ? target : (target.import ?? target.default);
		const path = join(fixture, "node_modules/@tensquads/ui", entry);
		await stat(path);
		if (!entry.endsWith(".css")) {
			if (subpath === "./openui/server/anthropic") continue;
			run(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(moduleSpecifier)});`]);
		}
	}
	run("npm", ["install", "@anthropic-ai/sdk@1.10.0"]);
	run(process.execPath, ["--input-type=module", "-e", 'await import("@tensquads/ui/openui/server/anthropic");']);
	console.log("Git dependency install built dist and resolved every public subpath.");
} finally {
	await rm(fixture, { recursive: true, force: true });
}
