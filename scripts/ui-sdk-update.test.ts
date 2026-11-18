import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { compare, selectTargetVersion } from "./ui-sdk-update.mjs";

describe("UI SDK update fixtures", () => {
	it("selects beta until a stable 1.0 release is latest", () => {
		expect(selectTargetVersion({ latest: "0.1.0-beta.6", beta: "0.1.0-beta.7" })).toBe("0.1.0-beta.7");
		expect(selectTargetVersion({ latest: "1.0.0", beta: "1.1.0-beta.1" })).toBe("1.0.0");
		expect(compare("0.1.0-beta.8", "0.1.0-beta.7")).toBeGreaterThan(0);
	});

	it("writes the recorded release notes and entry changes without network access", () => {
		const root = process.cwd();
		const result = execFileSync(
			"node",
			["scripts/ui-sdk-update.mjs", "--fixtures", "scripts/fixtures/ui-sdk-update-beta8.json", "--dry-run"],
			{ cwd: root, encoding: "utf8" },
		);
		const report = JSON.parse(result);
		expect(report.version).toBe("0.1.0-beta.8");
		expect(report.body).toContain("Core fixture notes.");
		expect(report.body).toContain("Added: @ui-sdk/react/dialog");
		expect(report.body).toContain("Removed: @ui-sdk/react/menu");
	});
});
