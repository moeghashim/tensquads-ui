import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import source from "../../../../design/tokens.json";
import { generateCss, generateTypes } from "../../../../scripts/build-tokens.mjs";
import { getToken, tokens } from "./tokens";

const root = process.cwd();

describe("design tokens", () => {
	it("exports representative source tokens and both theme values", () => {
		expect(getToken("canvas", "light")).toBe("#f3f3f3");
		expect(getToken("canvas", "dark")).toBe("#161616");
		expect(tokens["text-md.font-size"].light).toBe("16px");
		expect(tokens["space-4"].light).toBe("16px");
		expect(tokens["radius-md"].light).toBe("8px");
		expect(tokens["shadow-node"].dark).toBe("0 0 0 1px #ffffff29");
		expect(tokens["duration-basic"].light).toBe("150ms");
	});

	it("generates deterministic CSS and types that match the source", async () => {
		const css = generateCss(source);
		const types = generateTypes(source);
		expect(generateCss(source)).toBe(css);
		expect(generateTypes(source)).toBe(types);
		expect(css).toContain("--ts-canvas: var(--ts-gray-75);");
		expect(css).toContain("--ts-canvas: var(--ts-gray-75);");
		expect(await readFile(`${root}/packages/ui/src/tokens/tokens.css`, "utf8")).toBe(css);
		expect(await readFile(`${root}/packages/ui/src/tokens/tokens.ts`, "utf8")).toBe(types);
	});
});
