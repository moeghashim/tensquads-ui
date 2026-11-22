import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildIcons, generateIcons, parseIcons } from "./build-icons.mjs";

const fixtures: string[] = [];

async function createFixture() {
	const root = await mkdtemp(join(tmpdir(), "build-icons-test-"));
	fixtures.push(root);
	await mkdir(join(root, "design/agent-ui/components"), { recursive: true });
	await mkdir(join(root, "packages/ui/src/icons"), { recursive: true });
	return root;
}

afterEach(async () => {
	await Promise.all(fixtures.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("icon generator", () => {
	it("generates every bundle path in sorted order", async () => {
		const bundle = await readFile("design/agent-ui/components/bundle.js", "utf8");
		const icons = parseIcons(bundle);
		const output = generateIcons(icons);
		const generated = await readFile("packages/ui/src/icons/icons.ts", "utf8");

		expect(generated).toBe(output);
		expect(Object.keys(icons)).toHaveLength(44);
		expect(icons.agent).toBe("M4 3.5l9 4.5-9 4.5v-9z");
		expect(icons.classify).toBe("M3 4.5h3M3 8h3M3 11.5h3M8 4.5h5M8 8h5M8 11.5h5");
		expect(icons.more).toBe("M4 8h.01M8 8h.01M12 8h.01");
		expect(Object.keys(icons)).toEqual(
			expect.arrayContaining([
				"agent",
				"classify",
				"ifelse",
				"while",
				"approval",
				"play",
				"end",
				"note",
				"file",
				"shield",
				"mcp",
				"transform",
				"state",
				"more",
				"copy",
				"trash",
				"updown",
			]),
		);
	});

	it("rejects values that are not string literals", () => {
		expect(() => parseIcons("var ICONS = { valid: 'M0 0', invalid: getPath() };"))
			.toThrow('Invalid ICONS value for "invalid"; expected a string.');
	});

	it("icons:check exits with an error when generated output is stale", async () => {
		const root = await createFixture();
		await writeFile(join(root, "design/agent-ui/components/bundle.js"), "var ICONS = { agent: 'M0 0' };\n");
		await writeFile(join(root, "packages/ui/src/icons/icons.ts"), "stale\n");
		await mkdir(join(root, "scripts"));
		await cp(resolve("scripts/build-icons.mjs"), join(root, "scripts/build-icons.mjs"));

		const result = spawnSync(process.execPath, [join(root, "scripts/build-icons.mjs"), "--check"], {
			encoding: "utf8",
		});

		expect(result.status).toBe(1);
		expect(result.stderr).toContain("packages/ui/src/icons/icons.ts is stale. Run npm run icons.");
	});

	it("writes generated output for the provided root", async () => {
		const root = await createFixture();
		await writeFile(join(root, "design/agent-ui/components/bundle.js"), "var ICONS = { z: 'last', a: 'first' };\n");

		expect(await buildIcons({ root })).toBe(false);
		expect(await readFile(join(root, "packages/ui/src/icons/icons.ts"), "utf8")).toContain('a: "first"');
	});
});
