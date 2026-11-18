import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTensquadsLibrary, getRegisteredComponents, TensquadsRenderer } from "../../openui";
import type { Locale } from "../../schemas";
import { Button } from "./Button.js";

const expectedLabels: Record<Locale, string> = { en: "Continue", ar: "متابعة" };

afterEach(cleanup);

describe("Button", () => {
	it("wraps the UI SDK button and forwards native and render props", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<Button variant="soft" size="sm" className="custom" name="continue" data-testid="continue" onClick={onClick}>
				Continue
			</Button>,
		);
		const button = getByRole("button", { name: "Continue" });
		expect(button).toHaveAttribute("data-slot", "button");
		expect(button).toHaveAttribute("name", "continue");
		expect(button).toHaveAttribute("data-testid", "continue");
		expect(button.className).toContain("ts-button--soft");
		expect(button).toHaveClass("custom");
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("requires an accessible name for icon-only buttons", () => {
		expect(() => render(<Button iconOnly>+</Button>)).toThrow("Button requires aria-label");
		const { getByRole } = render(
			<Button iconOnly aria-label="Add">
				+
			</Button>,
		);
		expect(getByRole("button", { name: "Add" })).toBeInTheDocument();
	});

	it.each([false, true])("composes state classes through async actions with link rendering %s", async (asLink) => {
		let finishAction!: () => void;
		const promise = new Promise<void>((resolve) => {
			finishAction = resolve;
		});
		const { getByRole } = render(
			<Button
				variant="soft"
				size="sm"
				pill
				// biome-ignore lint/a11y/useAnchorContent: Button forwards its children into render.
				render={asLink ? <a href="#next" /> : undefined}
				onClick={() => promise}
				className={({ pending }) => (pending ? "saving" : "ready")}
			>
				Save
			</Button>,
		);
		const button = getByRole(asLink ? "link" : "button", { name: "Save" });
		expect(button).toHaveClass("ts-button", "ts-button--soft", "ts-button--sm", "ts-button--pill", "ready");
		expect(button).not.toHaveClass("saving");
		fireEvent.click(button);
		expect(button).toHaveAttribute("aria-busy", "true");
		expect(button).toHaveClass("ts-button", "ts-button--soft", "ts-button--sm", "ts-button--pill", "saving");
		expect(button).not.toHaveClass("ready");
		await act(async () => finishAction());
		expect(button).not.toHaveAttribute("aria-busy");
		expect(button).toHaveClass("ts-button", "ts-button--soft", "ts-button--sm", "ts-button--pill", "ready");
		expect(button).not.toHaveClass("saving");
	});

	it("preserves disabled state and link rendering", () => {
		const { getByRole } = render(
			<>
				<Button disabled>Unavailable</Button>
				<Button render={<a href="/next" />}>Next</Button>
			</>,
		);
		expect(getByRole("button", { name: "Unavailable" })).toBeDisabled();
		expect(getByRole("link", { name: "Next" })).toHaveAttribute("href", "/next");
	});

	it("forwards pending actions and keeps focus when disabled", async () => {
		let finishAction: (() => void) | undefined;
		const action = new Promise<void>((resolve) => {
			finishAction = resolve;
		});
		const { getByRole } = render(
			<>
				<Button onClick={() => action}>Save</Button>
				<Button disabled focusableWhenDisabled aria-describedby="hint">
					Publish
				</Button>
				<p id="hint">Add a title first.</p>
			</>,
		);
		const save = getByRole("button", { name: "Save" });
		fireEvent.click(save);
		expect(save).toHaveAttribute("aria-busy", "true");
		expect(save).toHaveAttribute("aria-disabled", "true");
		const publish = getByRole("button", { name: "Publish" });
		expect(publish).toHaveAttribute("aria-disabled", "true");
		expect(publish).toHaveAttribute("aria-describedby", "hint");
		expect(publish).not.toBeDisabled();
		await act(async () => finishAction?.());
		expect(save).not.toHaveAttribute("aria-busy");
	});
});

describe("OpenUI round trips", () => {
	it("has English and Arabic fixtures for every registered component", () => {
		const registered = getRegisteredComponents().map((component) => component.name);
		expect(registered).toEqual(
			expect.arrayContaining([
				"Button",
				"Badge",
				"Squadmate",
				"Input",
				"Field",
				"Menu",
				"Switch",
				"SegmentedControl",
			]),
		);
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
				const fixture = readFileSync(
					join(process.cwd(), "packages/ui/src/react", component.name, `${component.name}.fixture.${locale}.txt`),
					"utf8",
				);
				const onError = vi.fn();
				const result = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
				if (component.name === "Button") {
					expect(result.getByRole("button", { name: expectedLabels[locale] })).toBeInTheDocument();
				} else if (component.name === "Badge") {
					expect(result.getByText(locale === "en" ? "Ready" : "جاهز")).toHaveAttribute("data-slot", "badge");
				} else if (component.name === "Menu") {
					expect(result.getByRole("button", { name: locale === "en" ? "Actions" : "الإجراءات" })).toHaveAttribute(
						"data-slot",
						"menu-trigger",
					);
				} else if (component.name === "Squadmate") {
					expect(
						result.getByRole("img", { name: locale === "en" ? "Petra, Planning" : "بترا، تخطيط" }),
					).toHaveAttribute("width", "64");
				} else if (component.name === "Input") {
					expect(
						result.getByRole("textbox", { name: locale === "en" ? "Search projects" : "ابحث عن المشاريع" }),
					).toBeInTheDocument();
				} else if (component.name === "Field") {
					expect(
						result.getByRole("textbox", { name: locale === "en" ? "Project name" : "اسم المشروع" }),
					).toBeInTheDocument();
				}
				if (component.name === "Switch") expect(result.getByRole("switch")).toBeInTheDocument();
				if (component.name === "SegmentedControl") expect(result.getByRole("radiogroup")).toBeInTheDocument();
				expect(onError).toHaveBeenCalledWith([]);
				cleanup();
			}
			expect(createTensquadsLibrary("en")).toBe(createTensquadsLibrary("en"));
			expect(createTensquadsLibrary("ar")).toBe(createTensquadsLibrary("ar"));
		}
	});

	it.each(["en", "ar"] as const)("reports excess fixture arguments for %s", (locale) => {
		const onError = vi.fn();
		const result = render(
			<TensquadsRenderer
				stream={'root = Button("Save", "solid", "md", false, false, "extra")'}
				locale={locale}
				onError={onError}
			/>,
		);
		expect(result.getByRole("button", { name: "Save" })).toBeInTheDocument();
		expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ code: "excess-args" })]));
	});
});
