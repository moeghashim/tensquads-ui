import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
	for (const packageName of ["@ui-sdk/core", "@ui-sdk/react"]) {
		await readFile(join(fixture, "node_modules", packageName, "package.json"), "utf8");
		const npmTree = JSON.parse(
			execFileSync("npm", ["ls", packageName, "--all", "--json"], { cwd: fixture, encoding: "utf8" }),
		);
		const versions = new Set();
		const visit = (node) => {
			for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
				if (name === packageName) versions.add(dependency.version);
				visit(dependency);
			}
		};
		visit(npmTree);
		if (versions.size !== 1)
			throw new Error(`Expected one ${packageName} copy, found ${[...versions].join(", ") || "none"}`);
	}
	const imports = [];
	for (const [path, target] of Object.entries(packageJson.exports)) {
		if (path.endsWith(".css")) {
			await readFile(join(fixture, "node_modules/@tensquads/ui", target));
			continue;
		}
		imports.push(`import(${JSON.stringify(`@tensquads/ui${path.slice(1)}`)})`);
	}
	execFileSync("node", ["--input-type=module", "-e", `await Promise.all([${imports.join(",")}]);`], {
		cwd: fixture,
		stdio: "inherit",
	});
} finally {
	await rm(fixture, { recursive: true, force: true });
}
