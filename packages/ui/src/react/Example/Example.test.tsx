import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createTensquadsLibrary, getRegisteredComponents, TensquadsRenderer } from "../../openui";

describe("OpenUI round trips", () => {
	it("has English and Arabic fixtures for every registered component", () => {
		const registered = getRegisteredComponents().map((component) => component.name);
		for (const name of registered) {
			for (const locale of ["en", "ar"]) {
				const path = join(process.cwd(), "packages/ui/src/react", name, `${name}.fixture.${locale}.txt`);
				expect(() => readFileSync(path, "utf8"), `${name} needs a ${locale} fixture`).not.toThrow();
			}
		}
	});

	it("renders every registered fixture in both locales", () => {
		for (const component of getRegisteredComponents()) {
			for (const locale of ["en", "ar"] as const) {
				const path = join(
					process.cwd(),
					"packages/ui/src/react",
					component.name,
					`${component.name}.fixture.${locale}.txt`,
				);
				const fixture = readFileSync(path, "utf8");
				const result = render(<TensquadsRenderer stream={fixture} locale={locale} />);
				expect(result.container.textContent).toBeTruthy();
				cleanup();
			}
			expect(createTensquadsLibrary("en")).toBe(createTensquadsLibrary("en"));
			expect(createTensquadsLibrary("ar")).toBe(createTensquadsLibrary("ar"));
		}
	});
});
