import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
});
