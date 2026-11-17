import { describe, expect, it } from "vitest";

const entrypoints = [
	"./tokens/index.ts",
	"./react/index.ts",
	"./squadmates/index.ts",
	"./openui/index.ts",
	"./openui/server/index.ts",
	"./schemas/index.ts",
];

describe("package entry points", () => {
	it.each(entrypoints)("loads %s", async (entrypoint) => {
		await expect(import(entrypoint)).resolves.toBeDefined();
	});
});
