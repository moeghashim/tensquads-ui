import { afterEach, describe, expect, it, vi } from "vitest";

describe("OpenUI entry import safety", () => {
	afterEach(() => vi.restoreAllMocks());

	it("does not use randomness at module load", async () => {
		vi.resetModules();
		const random = vi.spyOn(Math, "random").mockImplementation(() => {
			throw new Error("Math.random called during import");
		});
		const getRandomValues = vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(() => {
			throw new Error("crypto.getRandomValues called during import");
		});

		await expect(import("./index")).resolves.toBeDefined();
		expect(random).not.toHaveBeenCalled();
		expect(getRandomValues).not.toHaveBeenCalled();
	});
});
