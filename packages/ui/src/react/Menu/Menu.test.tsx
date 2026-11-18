import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import {
	Menu,
	MenuCheckboxItem,
	MenuContent,
	MenuContextTrigger,
	MenuItem,
	MenuItemIndicator,
	MenuItems,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSub,
	MenuSubContent,
	MenuSubTrigger,
	MenuTrigger,
} from "../index.js";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

const popoverStyle = document.createElement("style");
beforeAll(() => {
	popoverStyle.textContent = "[popover] { display: block !important; }";
	document.head.append(popoverStyle);
});
afterAll(() => popoverStyle.remove());

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

	it("preserves supplied render content and leaves an unlabeled trigger empty", () => {
		const { getByRole } = render(
			<>
				<Menu>
					<MenuTrigger
						aria-label="الإجراءات"
						render={
							<button type="button">
								<span>⋯</span>
							</button>
						}
					/>
				</Menu>
				<Menu>
					<MenuTrigger aria-label="Empty actions" />
				</Menu>
			</>,
		);
		expect(getByRole("button", { name: "الإجراءات" })).toHaveTextContent("⋯");
		expect(getByRole("button", { name: "الإجراءات" })).not.toHaveTextContent("Actions");
		expect(getByRole("button", { name: "Empty actions" })).toBeEmptyDOMElement();
	});

	it.each(["ltr", "rtl"] as const)("composes exported submenu parts in %s", async (direction) => {
		document.documentElement.dir = direction;
		const onAction = vi.fn();
		const { getByRole } = render(
			<Menu onAction={onAction}>
				<MenuTrigger>Edit</MenuTrigger>
				<MenuContent>
					<MenuSub>
						<MenuSubTrigger>More</MenuSubTrigger>
						<MenuSubContent>
							<MenuItem value="archive">Archive</MenuItem>
						</MenuSubContent>
					</MenuSub>
				</MenuContent>
			</Menu>,
		);
		fireEvent.click(getByRole("button", { name: "Edit" }));
		const submenu = getByRole("menuitem", { name: "More" });
		fireEvent.click(submenu);
		const archive = await waitFor(() => getByRole("menuitem", { name: "Archive" }));
		fireEvent.click(archive);
		expect(onAction).toHaveBeenCalledWith("archive", expect.objectContaining({ event: expect.anything() }));
	});

	it("composes exported checkbox, radio and indicator parts", () => {
		const onCheckedChange = vi.fn();
		const onValueChange = vi.fn();
		const { getByRole, getByText } = render(
			<Menu>
				<MenuTrigger>View</MenuTrigger>
				<MenuContent>
					<MenuCheckboxItem value="toolbar" onCheckedChange={onCheckedChange}>
						<MenuItemIndicator>Checked</MenuItemIndicator>Toolbar
					</MenuCheckboxItem>
					<MenuRadioGroup defaultValue="compact" onValueChange={onValueChange}>
						<MenuRadioItem value="compact">Compact</MenuRadioItem>
						<MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
					</MenuRadioGroup>
				</MenuContent>
			</Menu>,
		);
		fireEvent.click(getByRole("button", { name: "View" }));
		fireEvent.click(getByRole("menuitemcheckbox", { name: "Toolbar" }));
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
		expect(getByRole("menuitemcheckbox")).toHaveAttribute("aria-checked", "true");
		expect(getByText("Checked")).toHaveAttribute("data-slot", "menu-item-indicator");
		fireEvent.click(getByRole("menuitemradio", { name: "Comfortable" }));
		expect(onValueChange).toHaveBeenCalledWith("comfortable", expect.anything());
		expect(getByRole("menuitemradio", { name: "Comfortable" })).toHaveAttribute("aria-checked", "true");
		expect(getByRole("menuitemradio", { name: "Compact" })).toHaveAttribute("aria-checked", "false");
	});

	it("composes exported context trigger and data items", () => {
		const onAction = vi.fn();
		const { getByText, getByRole } = render(
			<Menu onAction={onAction}>
				<MenuContextTrigger tabIndex={0}>File area</MenuContextTrigger>
				<MenuContent>
					<MenuItems items={[{ label: "Open file", value: "open" }]} />
				</MenuContent>
			</Menu>,
		);
		fireEvent.contextMenu(getByText("File area"), { clientX: 10, clientY: 10 });
		fireEvent.click(getByRole("menuitem", { name: "Open file" }));
		expect(onAction).toHaveBeenCalledWith("open", expect.objectContaining({ event: expect.anything() }));
	});

	it.each([
		["empty trigger", "", [{ label: "Open", value: "open" }]],
		["empty items", "Actions", []],
		[
			"seven items",
			"Actions",
			Array.from({ length: 7 }, (_, index) => ({ label: `Action ${index}`, value: `${index}` })),
		],
		["empty item label", "Actions", [{ label: "", value: "open" }]],
		["empty item value", "Actions", [{ label: "Open", value: "" }]],
		["empty destructive label", "Actions", [{ label: "", value: "delete", danger: true }]],
		["empty destructive value", "Actions", [{ label: "Delete", value: "", danger: true }]],
		[
			"two destructive items",
			"Actions",
			[
				{ label: "Delete", value: "delete", danger: true },
				{ label: "Erase", value: "erase", danger: true },
			],
		],
	])("rejects OpenUI streams with %s before exposing actions", async (_name, label, items) => {
		const onError = vi.fn();
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			const { queryByRole } = render(
				<TensquadsRenderer
					stream={`root = Menu(${JSON.stringify(label)}, ${JSON.stringify(items)})`}
					onError={onError}
				/>,
			);
			await waitFor(() =>
				expect(onError).toHaveBeenCalledWith(
					expect.arrayContaining([expect.objectContaining({ code: "render-error", component: "Menu" })]),
				),
			);
			expect(queryByRole("button")).not.toBeInTheDocument();
			expect(queryByRole("menuitem")).not.toBeInTheDocument();
		} finally {
			consoleError.mockRestore();
		}
	});

	it.each([1, 6])("accepts %i OpenUI actions and orders the destructive action last", (count) => {
		const items = [
			{ label: "Delete", value: "delete", danger: true },
			...Array.from({ length: count - 1 }, (_, index) => ({ label: `Action ${index}`, value: `${index}` })),
		];
		const { getByRole, getAllByRole } = render(
			<TensquadsRenderer stream={`root = Menu("Actions", ${JSON.stringify(items)})`} />,
		);
		fireEvent.click(getByRole("button", { name: "Actions" }));
		expect(getAllByRole("menuitem")).toHaveLength(count);
		expect(getAllByRole("menuitem").at(-1)).toHaveTextContent("Delete");
		expect(getAllByRole("menuitem").at(-1)).toHaveAttribute("data-destructive");
		expect(getByRole("separator")).toBeInTheDocument();
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
