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
	const [{ filename }] = JSON.parse(output);
	const tarball = join(fixture, filename);
	await readFile(tarball);
	execFileSync("npm", ["init", "-y"], { cwd: fixture, stdio: "ignore" });
	execFileSync("npm", ["install", "--ignore-scripts", tarball], { cwd: fixture, stdio: "inherit" });

	const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
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
