import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "./Menu.js";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

afterEach(() => {
	cleanup();
	document.documentElement.removeAttribute("dir");
});

describe("Menu", () => {
	it("wraps UI SDK parts, uses Button by default, and preserves trigger render", () => {
		const onAction = vi.fn();
		const { getByRole, getByText } = render(
			<>
				<Menu onAction={onAction}>
					<MenuTrigger aria-label="File actions">File</MenuTrigger>
					<MenuContent>
						<MenuItem value="save">Save</MenuItem>
					</MenuContent>
				</Menu>
				<Menu>
					<MenuTrigger render={<a href="/settings" />}>Settings</MenuTrigger>
				</Menu>
			</>,
		);
		const trigger = getByRole("button", { name: "File actions" });
		expect(trigger).toHaveAttribute("data-slot", "menu-trigger");
		expect(trigger).toHaveClass("ts-button", "ts-button--solid", "ts-button--md", "ts-menu-trigger");
		fireEvent.click(trigger);
		fireEvent.click(getByText("Save"));
		expect(onAction).toHaveBeenCalledWith("save", expect.objectContaining({ event: expect.anything() }));
		expect(getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
	});

	it.each(["ltr", "rtl"] as const)("opens and navigates with keys in %s direction", async (direction) => {
		document.documentElement.dir = direction;
		const { getByRole, getByText, queryByRole } = render(
			<Menu>
				<MenuTrigger>Actions</MenuTrigger>
				<MenuContent>
					<MenuItem value="one">First action</MenuItem>
					<MenuItem value="disabled" disabled>
						Disabled action
					</MenuItem>
					<MenuItem value="two">Second action</MenuItem>
				</MenuContent>
			</Menu>,
		);
		const trigger = getByRole("button", { name: "Actions" });
		trigger.focus();
		fireEvent.keyDown(trigger, { key: "ArrowDown" });
		const first = getByText("First action");
		await waitFor(() => expect(first).toHaveAttribute("data-highlighted"));
		fireEvent.keyDown(first, { key: "ArrowDown" });
		const disabled = getByText("Disabled action");
		await waitFor(() => expect(disabled).toHaveAttribute("data-highlighted"));
		fireEvent.keyDown(disabled, { key: "ArrowDown" });
		const second = getByText("Second action");
		await waitFor(() => expect(second).toHaveAttribute("data-highlighted"));
		fireEvent.keyDown(second, { key: "Escape" });
		expect(queryByRole("menuitem", { name: "First action" })).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
		expect(getByText("Actions")).toBeInTheDocument();
	});

	it("closes with Escape after pointer activation", async () => {
		const { getByRole } = render(
			<Menu>
				<MenuTrigger>Open menu</MenuTrigger>
				<MenuContent>
					<MenuItem value="one">First</MenuItem>
				</MenuContent>
			</Menu>,
		);
		const trigger = getByRole("button", { name: "Open menu" });
		fireEvent.click(trigger);
		const menu = document.querySelector<HTMLElement>('[data-slot="menu-content"]');
		expect(menu).not.toBeNull();
		await waitFor(() => expect(menu).toHaveAttribute("data-open"));
		fireEvent.keyDown(menu as HTMLElement, { key: "Escape" });
		await waitFor(() => expect(menu).not.toHaveAttribute("data-open"));
		expect(trigger).toHaveFocus();
	});

	it("renders both OpenUI fixture locales with selectable serialized values", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Menu");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Menu", `Menu.fixture.${locale}.txt`),
				"utf8",
			);
			const { getByRole } = render(<TensquadsRenderer stream={fixture} locale={locale} />);
			expect(getByRole("button", { name: locale === "en" ? "Actions" : "الإجراءات" })).toHaveAttribute(
				"data-slot",
				"menu-trigger",
			);
			cleanup();
		}
	});

	it("emits the selected OpenUI value as a client event", () => {
		const onMenuAction = vi.fn();
		document.addEventListener("tensquads:menu-action", onMenuAction);
		const { getByRole, getByText, unmount } = render(
			<TensquadsRenderer stream={'root = Menu("Actions", [{"label": "Open", "value": "open"}])'} locale="en" />,
		);
		fireEvent.click(getByRole("button", { name: "Actions" }));
		fireEvent.click(getByText("Open"));
		expect(onMenuAction).toHaveBeenCalledOnce();
		expect(onMenuAction.mock.calls.at(0)?.[0]).toMatchObject({ detail: { value: "open" } });
		document.removeEventListener("tensquads:menu-action", onMenuAction);
		unmount();
	});
});
