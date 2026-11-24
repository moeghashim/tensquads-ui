import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { pageDesigns, productScreens } from "./reference";
import { archivedHomepage } from "./reference-exclusions";

test("preview source does not link to the legacy design site", () => {
	const files = readdirSync(new URL("./", import.meta.url), { recursive: true, withFileTypes: true });
	const legacyHost = /\b10squads\.com\b/i;
	const matches = files
		.filter((entry) => entry.isFile())
		.map((entry) => join(entry.parentPath, entry.name))
		.filter((path) => legacyHost.test(readFileSync(path, "utf8")));

	expect(matches).toEqual([]);
});

test("the catalogs and detail routes share registries without the archived homepage designs", () => {
	expect(productScreens.map(({ src }) => src)).not.toContain(`/design/screens/${archivedHomepage.screenFile}`);
	expect(productScreens.map(({ id }) => id)).not.toContain("home");
	expect(pageDesigns.map(({ id }) => id)).not.toContain(archivedHomepage.pageId);
});
