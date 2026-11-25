import { expect, test } from "vitest";
import { pageDesigns, productScreens } from "./reference";

test("the catalogs and detail routes share registries without the archived homepage designs", () => {
	expect(productScreens.map(({ src }) => src)).not.toContain("/design/screens/Home.dc.html");
	expect(productScreens.map(({ id }) => id)).not.toContain("home");
	expect(pageDesigns.map(({ id }) => id)).not.toContain("home-v2");
});
