import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTensquadsLibrary, getRegisteredComponents, TensquadsRenderer } from "../../openui";
import type { Locale } from "../../schemas";

const expectedSquadmateNames: Record<Locale, string> = {
	en: "Petra, Planning",
	ar: "بترا، تخطيط",
};

const expectedMessages: Record<string, Record<Locale, string>> = {
	Example: {
		en: "OpenUI fixture rendered in English",
		ar: "تم عرض عينة OpenUI باللغة العربية",
	},
};

afterEach(cleanup);

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
				const onError = vi.fn();
				const result = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
				if (component.name === "Squadmate") {
					const image = result.getByRole("img", { name: expectedSquadmateNames[locale] });
					expect(image).toHaveAttribute("width", "64");
					expect(image).toHaveAttribute("height", "64");
				} else {
					const expected = expectedMessages[component.name]?.[locale];
					expect(expected, `${component.name} needs a ${locale} output expectation`).toBeDefined();
					expect(result.container.textContent).toBe(expected);
				}
				expect(onError).toHaveBeenCalledWith([]);
				for (const [errors] of onError.mock.calls) {
					expect(errors).toEqual([]);
				}
				cleanup();
			}
			expect(createTensquadsLibrary("en")).toBe(createTensquadsLibrary("en"));
			expect(createTensquadsLibrary("ar")).toBe(createTensquadsLibrary("ar"));
		}
	});

	it.each(["en", "ar"] as const)("reports errors even when a %s stream renders text", (locale) => {
		const onError = vi.fn();
		const result = render(
			<TensquadsRenderer stream={'root = Example("hello", "unexpected")'} locale={locale} onError={onError} />,
		);
		expect(result.container.textContent).toBe("hello");
		expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ code: "excess-args" })]));
	});
});
