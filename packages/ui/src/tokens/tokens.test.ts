import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import source from "../../../../design/tokens.json";
import { buildTokens, generateCss, generateTypes } from "../../../../scripts/build-tokens.mjs";
import { tokens } from "./index";

const root = process.cwd();

describe("design tokens", () => {
	it("exports representative source tokens and both theme values", () => {
		expect(tokens.canvas.light).toBe("#f3f3f3");
		expect(tokens.canvas.dark).toBe("#161616");
		expect(tokens["text-md.font-size"].light).toBe("16px");
		expect(tokens["space-4"].light).toBe("16px");
		expect(tokens["radius-md"].light).toBe("8px");
		expect(tokens["shadow-node"].dark).toBe("0 0 0 1px #ffffff29");
		expect(tokens["duration-basic"].light).toBe("150ms");
	});

	it("preserves every typography family in both themes and all CSS theme blocks", () => {
		const css = generateCss(source);
		for (const group of source.type.groups) {
			for (const style of group.styles) {
				const family = "family" in style ? style.family : group.family;
				const expected = source.type.families[family as keyof typeof source.type.families];
				const name = `${style.name}.font-family` as keyof typeof tokens;
				expect(tokens[name]).toEqual({ light: expected, dark: expected });
				expect(css.split(`--ts-${style.name}-font-family: ${expected};`)).toHaveLength(4);
			}
		}
	});

	it("fails when generated output is stale and passes after rebuilding", async () => {
		const root = await mkdtemp(join(tmpdir(), "tensquads-tokens-"));
		const tokenDirectory = join(root, "packages/ui/src/tokens");
		try {
			await mkdir(join(root, "design"), { recursive: true });
			await mkdir(tokenDirectory, { recursive: true });
			await writeFile(
				join(root, "design/tokens.json"),
				JSON.stringify({ color: { tokens: [{ name: "sample", value: { light: "#fff", dark: "#000" } }] } }),
			);
			await writeFile(join(tokenDirectory, "tokens.css"), "stale");
			await writeFile(join(tokenDirectory, "tokens.ts"), "stale");
			expect(await buildTokens({ check: true, root })).toBe(true);
			expect(await buildTokens({ root })).toBe(false);
			expect(await buildTokens({ check: true, root })).toBe(false);
		} finally {
			await rm(root, { recursive: true, force: true });
		}
	});

	it("generates deterministic CSS and types that match the source", async () => {
		const css = generateCss(source);
		const types = generateTypes(source);
		expect(generateCss(source)).toBe(css);
		expect(generateTypes(source)).toBe(types);
		expect(css).toContain("--ts-canvas: var(--ts-gray-75);");
		expect(await readFile(`${root}/packages/ui/src/tokens/tokens.css`, "utf8")).toBe(css);
		expect(await readFile(`${root}/packages/ui/src/tokens/tokens.ts`, "utf8")).toBe(types);
	});
});
