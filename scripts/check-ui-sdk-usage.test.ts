import { describe, expect, it } from "vitest";
import { findUiSdkImports, validateUiSdkImports } from "./check-ui-sdk-usage.mjs";

describe("UI SDK usage check", () => {
	it("accepts public imports and rejects internal or unknown entries", () => {
		const imports = findUiSdkImports({
			"fake.ts":
				'import { Button } from "@ui-sdk/react/button"; import "@ui-sdk/core/internal/foo"; import("@ui-sdk/react/unknown")',
		});
		expect(imports).toHaveLength(3);
		expect(
			validateUiSdkImports(imports, {
				"@ui-sdk/react": new Set(["./button"]),
				"@ui-sdk/core": new Set(["."]),
			}),
		).toEqual([
			"fake.ts: @ui-sdk/core/internal/foo is not a public UI SDK entry",
			"fake.ts: @ui-sdk/react/unknown is not listed as a public UI SDK entry",
		]);
	});
});
