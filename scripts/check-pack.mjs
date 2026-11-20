import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), "tensquads-ui-pack-"));

try {
	const output = execFileSync("npm", ["pack", "--json", "--pack-destination", fixture], {
		cwd: root,
		encoding: "utf8",
	});
	const [{ filename, files }] = JSON.parse(output);
	const testFilePattern = /(?:^|\/)(?:__tests__|tests?)(?:\/|$)|(?:\.test|\.spec|test-setup)\.[cm]?[jt]sx?$/i;
	const testFiles = files.map(({ path }) => path).filter((path) => testFilePattern.test(path));
	if (testFiles.length > 0) {
		throw new Error(`Package tarball includes test files: ${testFiles.join(", ")}`);
	}
	const tarball = join(fixture, filename);
	await readFile(tarball);
	execFileSync("npm", ["init", "-y"], { cwd: fixture, stdio: "ignore" });
	execFileSync("npm", ["install", "--ignore-scripts", tarball], { cwd: fixture, stdio: "inherit" });

	const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
	const installedPackage = join(fixture, "node_modules/@tensquads/ui");
	const sdkList = spawnSync("npm", ["ls", "@anthropic-ai/sdk", "--all", "--json", "--long"], {
		cwd: fixture,
		encoding: "utf8",
	});
	const sdkTree = JSON.parse(sdkList.stdout);
	if (sdkTree.dependencies?.["@anthropic-ai/sdk"]) {
		throw new Error("The optional Anthropic peer was installed without an explicit request.");
	}
	for (const packageName of ["@ui-sdk/core", "@ui-sdk/react"]) {
		await readFile(join(fixture, "node_modules", packageName, "package.json"), "utf8");
		const npmTree = JSON.parse(
			execFileSync("npm", ["ls", packageName, "--all", "--json", "--long"], { cwd: fixture, encoding: "utf8" }),
		);
		const locations = new Set();
		const visit = async (node) => {
			for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
				if (name === packageName) locations.add(await realpath(dependency.path));
				await visit(dependency);
			}
		};
		await visit(npmTree);
		if (locations.size !== 1)
			throw new Error(`Expected one ${packageName} copy, found ${[...locations].join(", ") || "none"}`);
	}
	const imports = [];
	for (const [path, target] of Object.entries(packageJson.exports)) {
		if (path.endsWith(".css")) {
			const cssPath = join(installedPackage, target);
			const css = await readFile(cssPath, "utf8");
			for (const [, url] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
				const fontPath = resolve(cssPath, "..", url);
				const packageRelativePath = relative(installedPackage, fontPath);
				if (packageRelativePath.startsWith("..") || packageRelativePath === "") {
					throw new Error(`CSS URL escapes the installed package: ${url}`);
				}
				await readFile(fontPath);
			}
			continue;
		}
		if (path === "./openui/server/anthropic") continue;
		imports.push(`import(${JSON.stringify(`@tensquads/ui${path.slice(1)}`)})`);
	}
	execFileSync("node", ["--input-type=module", "-e", `await Promise.all([${imports.join(",")}]);`], {
		cwd: fixture,
		stdio: "inherit",
	});
	execFileSync("npm", ["install", "--ignore-scripts", "@anthropic-ai/sdk@1.10.0"], {
		cwd: fixture,
		stdio: "inherit",
	});
	execFileSync("node", ["--input-type=module", "-e", 'await import("@tensquads/ui/openui/server/anthropic");'], {
		cwd: fixture,
		stdio: "inherit",
	});
} finally {
	await rm(fixture, { recursive: true, force: true });
}
