import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./Dialog.js";

afterEach(cleanup);

beforeEach(() => {
	HTMLElement.prototype.showPopover = () => {};
	HTMLElement.prototype.hidePopover = () => {};
	Element.prototype.getAnimations = () => [];
	Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
	Element.prototype.checkVisibility = () => true;
	if (!document.querySelector("style[data-dialog-test]")) {
		document.head.append(
			Object.assign(document.createElement("style"), {
				textContent: "[popover] { display: block !important }",
				"data-dialog-test": "",
			}),
		);
	}
});

describe("Dialog", () => {
	it("wraps UI SDK parts, forwards props, and preserves slots", () => {
		const { getByRole, getByText } = render(
			<Dialog defaultOpen>
				<DialogTrigger data-testid="trigger">Open</DialogTrigger>
				<DialogBackdrop data-testid="backdrop" />
				<DialogContent data-testid="content" aria-describedby="extra-description">
					<DialogTitle>Project details</DialogTitle>
					<DialogDescription>Review the project.</DialogDescription>
					<p id="extra-description">Additional context.</p>
					<DialogClose>Close</DialogClose>
				</DialogContent>
			</Dialog>,
		);
		expect(getByRole("dialog", { name: "Project details" })).toHaveAttribute("data-slot", "dialog-content");
		expect(getByText("Review the project.")).toHaveAttribute("data-slot", "dialog-description");
		expect(screen.getByTestId("content").className).toContain("ts-dialog__content");
		fireEvent.click(getByRole("button", { name: "Close" }));
	});

	it("opens from the trigger and closes on Escape with focus return", async () => {
		const onOpenChange = vi.fn();
		const { getByRole, queryByRole } = render(
			<Dialog onOpenChange={onOpenChange}>
				<DialogTrigger>Open details</DialogTrigger>
				<DialogBackdrop />
				<DialogContent>
					<DialogTitle>Details</DialogTitle>
					<DialogDescription>Focused information.</DialogDescription>
					<DialogClose>Done</DialogClose>
				</DialogContent>
			</Dialog>,
		);
		const trigger = getByRole("button", { name: "Open details" });
		fireEvent.click(trigger);
		const dialog = await screen.findByRole("dialog", { name: "Details" });
		expect(document.activeElement).not.toBe(trigger);
		act(() => fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape", code: "Escape" }));
		await act(async () => Promise.resolve());
		expect(queryByRole("dialog", { name: "Details" })).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: "escape-key" }));
	});
});
