import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkDesign } from "../../../scripts/design-check.mjs";

const fixtures: string[] = [];
async function createFixture() {
	const directory = await mkdtemp(join(tmpdir(), "design-check-test-"));
	fixtures.push(directory);
	await mkdir(join(directory, "assets"));
	const content = Buffer.from("fixture design asset\n");
	await writeFile(join(directory, "assets", "token.txt"), content);
	await writeFile(
		join(directory, "MANIFEST.json"),
		JSON.stringify({ files: { "assets/token.txt": createHash("sha256").update(content).digest("hex") } }),
	);
	return directory;
}

afterEach(async () => {
	await Promise.all(fixtures.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("design reference check", () => {
	it("passes a clean fixture", async () => {
		expect(await checkDesign(await createFixture())).toBe(1);
	});

	it("fails when a synced file changes", async () => {
		const directory = await createFixture();
		await writeFile(join(directory, "assets", "token.txt"), "changed\n");
		await expect(checkDesign(directory)).rejects.toThrow("Hash mismatch: assets/token.txt");
	});

	it("fails when an extra file appears", async () => {
		const directory = await createFixture();
		await writeFile(join(directory, "extra.txt"), "extra\n");
		await expect(checkDesign(directory)).rejects.toThrow("Unexpected file: extra.txt");
	});

	it("fails when a synced file is missing", async () => {
		const directory = await createFixture();
		await rm(join(directory, "assets", "token.txt"));
		await expect(checkDesign(directory)).rejects.toThrow("Missing file: assets/token.txt");
	});

	it.each([
		["extra.txt", "assets/token.txt"],
		["extra-directory", "assets"],
		["assets/dangling", "missing"],
		["assets/token.txt", "../original.txt"],
		["MANIFEST.json", "original-manifest.json"],
	])("rejects the symlink %s", async (path, target) => {
		const directory = await createFixture();
		if (path === "assets/token.txt" || path === "MANIFEST.json") {
			await cp(join(directory, path), join(directory, path, "..", target));
			await rm(join(directory, path));
		}
		await symlink(target, join(directory, path));
		await expect(checkDesign(directory)).rejects.toThrow(`Unsupported filesystem entry: ${path}`);
	});

	it("runs the CLI from a path containing spaces", async () => {
		const directory = await createFixture();
		const design = join(directory, "design");
		await mkdir(design);
		await cp(join(directory, "assets"), join(design, "assets"), { recursive: true });
		await cp(join(directory, "MANIFEST.json"), join(design, "MANIFEST.json"));
		const script = join(directory, "design check with spaces.mjs");
		await cp(resolve("scripts/design-check.mjs"), script);
		const run = () => spawnSync(process.execPath, [script], { cwd: directory, encoding: "utf8" });
		const clean = run();
		expect(clean.status).toBe(0);
		expect(clean.stdout).toContain("Design reference is clean (1 files).");
		await writeFile(join(design, "assets", "token.txt"), "changed\n");
		const changed = run();
		expect(changed.status).toBe(1);
		expect(changed.stderr).toContain("Hash mismatch: assets/token.txt");
		await rm(join(design, "assets", "token.txt"));
		const missing = run();
		expect(missing.status).toBe(1);
		expect(missing.stderr).toContain("Missing file: assets/token.txt");
	});

	it("preserves existing output when sync staging fails", async () => {
		const directory = await createFixture();
		const design = join(directory, "design");
		await mkdir(design);
		await cp(join(directory, "assets"), join(design, "assets"), { recursive: true });
		await cp(join(directory, "MANIFEST.json"), join(design, "MANIFEST.json"));
		const bin = join(directory, "bin");
		await mkdir(bin);
		await writeFile(
			join(bin, "git"),
			`#!${process.execPath}
const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
(async () => {
  if (process.argv[2] !== "clone") return;
  const checkout = process.argv.at(-1);
  for (const path of ["agent-ui/components", "mascots/svg", "mascots/states"]) {
    await mkdir(join(checkout, path), { recursive: true });
  }
  await writeFile(join(checkout, "agent-ui/tokens.json"), "{}");
})();
`,
			{ mode: 0o755 },
		);
		const result = spawnSync(process.execPath, [resolve("scripts/sync-design.mjs")], {
			cwd: directory,
			env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` },
			encoding: "utf8",
		});
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("README.md");
		expect(await checkDesign(design)).toBe(1);
	});
});
