import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette, useCommandPaletteShortcut } from "./CommandPalette.js";

afterEach(cleanup);
beforeEach(() => {
	HTMLElement.prototype.showPopover = () => {};
	HTMLElement.prototype.hidePopover = () => {};
	Element.prototype.getAnimations = () => [];
	Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
	Element.prototype.checkVisibility = () => true;
	if (!document.querySelector("style[data-command-test]"))
		document.head.append(
			Object.assign(document.createElement("style"), {
				textContent: "[popover] { display: block !important }",
				"data-command-test": "",
			}),
		);
});

const labels = {
	placeholder: "Search",
	empty: "No matches",
	navigate: "navigate",
	select: "select",
	close: "close",
	title: "Search",
};
function Harness({ action = vi.fn() }: { action?: () => void }) {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Open palette
			</button>
			<CommandPalette
				open={open}
				onOpenChange={setOpen}
				labels={labels}
				groups={[
					{
						id: "pages",
						label: "Pages",
						items: [
							{ id: "home", label: "Home", keywords: ["start"], onSelect: action },
							{ id: "components", label: "Components", onSelect: action },
						],
					},
					{ id: "settings", label: "Settings", items: [{ id: "theme", label: "Theme", onSelect: action }] },
				]}
			/>
		</>
	);
}

describe("CommandPalette", () => {
	it("filters items and removes groups without matches", async () => {
		render(<Harness />);
		fireEvent.click(screen.getByRole("button", { name: "Open palette" }));
		const input = await screen.findByRole("combobox", { name: "Search" });
		fireEvent.change(input, { target: { value: "start" } });
		expect(await screen.findByText("Home")).toBeInTheDocument();
		expect(screen.queryByRole("group", { name: "Settings" })).not.toBeInTheDocument();
		fireEvent.change(input, { target: { value: "absent" } });
		expect(await screen.findByText("No matches")).toBeInTheDocument();
	});

	it.each([
		{ locale: "en" as const, term: "Résumé", query: "resume" },
		{ locale: "ar" as const, term: "المكوّنات", query: "المكونات" },
	])("matches $locale labels and keywords without diacritics", async ({ locale, term, query }) => {
		const action = vi.fn();
		render(
			<CommandPalette
				open
				onOpenChange={vi.fn()}
				locale={locale}
				labels={labels}
				groups={[
					{ id: "labels", label: "Labels", items: [{ id: "label", label: term, onSelect: action }] },
					{
						id: "keywords",
						label: "Keywords",
						items: [{ id: "keyword", label: "Keyword match", keywords: [term], onSelect: action }],
					},
				]}
			/>,
		);
		const input = await screen.findByRole("combobox", { name: "Search" });
		fireEvent.change(input, { target: { value: query } });
		expect(await screen.findByRole("option", { name: term })).toBeVisible();
		expect(screen.getByRole("option", { name: "Keyword match" })).toBeVisible();
	});

	it("runs the highlighted command and closes, then returns focus on Escape", async () => {
		const action = vi.fn();
		render(<Harness action={action} />);
		const trigger = screen.getByRole("button", { name: "Open palette" });
		trigger.focus();
		fireEvent.click(trigger);
		const input = await screen.findByRole("combobox", { name: "Search" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		await act(async () => Promise.resolve());
		expect(action).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
		fireEvent.click(trigger);
		await screen.findByRole("dialog", { name: "Search" });
		const reopenedInput = screen.getByRole("combobox", { name: "Search" });
		fireEvent.change(reopenedInput, { target: { value: "home" } });
		fireEvent.keyDown(reopenedInput, { key: "Escape" });
		await act(async () => Promise.resolve());
		expect(trigger).toHaveFocus();
	});

	it("opens from the platform shortcut and ignores IME composition", () => {
		function ShortcutHarness() {
			const [open, setOpen] = React.useState(false);
			useCommandPaletteShortcut(() => setOpen(true));
			return <span>{open ? "opened" : "closed"}</span>;
		}
		render(<ShortcutHarness />);
		fireEvent.keyDown(window, { key: "k", ctrlKey: true, isComposing: true });
		expect(screen.getByText("closed")).toBeInTheDocument();
		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		expect(screen.getByText("opened")).toBeInTheDocument();
	});

	it("renders Arabic labels and preserves the arrow hint glyphs", async () => {
		render(
			<CommandPalette
				open
				onOpenChange={vi.fn()}
				locale="ar"
				labels={{ ...labels, title: "البحث", placeholder: "ابحث", empty: "لا توجد نتائج" }}
				groups={[]}
			/>,
		);
		expect(await screen.findByRole("dialog", { name: "البحث" })).toBeInTheDocument();
		expect(screen.getByText("↑↓")).toBeInTheDocument();
	});
});
