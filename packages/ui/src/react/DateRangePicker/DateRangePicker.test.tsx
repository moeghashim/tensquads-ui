import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAgent } from "@ui-sdk/core/agent";
import { afterEach, expect, test, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker.js";

const agent = createAgent();

afterEach(cleanup);

HTMLElement.prototype.showPopover = () => {};
HTMLElement.prototype.hidePopover = () => {};
Element.prototype.getAnimations = () => [];
document.head.append(
	Object.assign(document.createElement("style"), { textContent: "[popover] { display: block !important }" }),
);
const initial = { start: "2026-10-10", end: "2026-10-23" };
const october = { start: "2026-10-01", end: "2026-10-31" };
const presets = [{ label: "This month", value: october }];

test("stages a preset until Apply and submits only committed dates", async () => {
	const onChange = vi.fn();
	render(
		<form aria-label="Orders">
			<DateRangePicker
				aria-label="Order dates"
				defaultValue={initial}
				presets={presets}
				onValueChange={onChange}
				startName="from"
				endName="to"
			/>
		</form>,
	);
	const form = screen.getByRole<HTMLFormElement>("form");
	const trigger = screen.getByRole("button", { name: "Order dates" });
	fireEvent.click(trigger);
	expect(screen.getByRole("button", { name: "Custom" })).toHaveAttribute("aria-pressed", "true");
	fireEvent.click(screen.getByRole("button", { name: "This month" }));
	expect(screen.getByRole("button", { name: "This month" })).toHaveAttribute("aria-pressed", "true");
	expect(screen.getByRole("button", { name: "Custom" })).toHaveAttribute("aria-pressed", "false");
	expect(onChange).not.toHaveBeenCalled();
	expect(Object.fromEntries(new FormData(form))).toEqual({ from: initial.start, to: initial.end });
	fireEvent.click(screen.getByRole("button", { name: "Apply" }));
	expect(onChange).toHaveBeenCalledWith(october, expect.objectContaining({ reason: "preset-press" }));
	expect(Object.fromEntries(new FormData(form))).toEqual({ from: october.start, to: october.end });
	await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

	await act(async () => form.reset());
	expect(Object.fromEntries(new FormData(form))).toEqual({ from: initial.start, to: initial.end });
	expect(onChange).toHaveBeenLastCalledWith(initial, expect.objectContaining({ reason: "reset" }));
});

test("a controlled picker keeps its range until the host accepts a change", async () => {
	const onChange = vi.fn();
	const { rerender } = render(<DateRangePicker value={initial} presets={presets} onValueChange={onChange} />);
	fireEvent.click(screen.getByRole("button", { name: "Start date – End date" }));
	fireEvent.click(screen.getByRole("button", { name: "This month" }));
	fireEvent.click(screen.getByRole("button", { name: "Apply" }));
	expect(onChange).toHaveBeenCalledWith(october, expect.anything());
	expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("10/10/2026");
	rerender(<DateRangePicker value={october} />);
	expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("10/01/2026");
});

test("reports invalid typed dates and refuses a preset outside the bounds", async () => {
	const onChange = vi.fn();
	render(
		<DateRangePicker
			defaultValue={initial}
			presets={presets}
			min={initial.start}
			max={initial.end}
			onValueChange={onChange}
		/>,
	);
	const end = screen.getByRole("textbox", { name: "End date" });
	fireEvent.input(end, { target: { value: "10/09/2026" } });
	fireEvent.keyDown(end, { key: "Enter", code: "Enter" });
	await waitFor(() => expect(end).toHaveAttribute("aria-invalid", "true"));
	expect(screen.getByText("The end date is before the start date.")).toBeVisible();
	expect(onChange).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole("button", { name: "Start date – End date" }));
	expect(screen.getByRole("button", { name: "This month" })).toBeDisabled();
});

test("the agent can read and set a named date range", async () => {
	render(<DateRangePicker aria-label="Order dates" defaultValue={initial} />);
	const entries = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more");
	expect(entries.length).toBeGreaterThan(0);
	for (const entry of entries) expect(entry.label).toBeTruthy();
	const picker = entries.find((entry) => entry.label === "Order dates");
	expect(picker).toMatchObject({ value: [initial.start, initial.end] });
	if (!picker) throw new Error("Missing DateRangePicker snapshot");
	let change: ReturnType<typeof agent.act> | undefined;
	await act(async () => {
		change = agent.act({ steps: [{ ref: picker.ref, action: "setValue", args: [[october.start, october.end]] }] });
	});
	const result = await change;
	expect(result?.ok, result?.error?.message).toBe(true);
	expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("10/31/2026");
});

test("Clear stays in the popup and Apply can be canceled", async () => {
	const onChange = vi.fn((_, details) => details.cancel());
	render(<DateRangePicker defaultValue={initial} onValueChange={onChange} />);
	fireEvent.click(screen.getByRole("button", { name: "Start date – End date" }));
	fireEvent.click(screen.getByRole("button", { name: "Clear" }));
	expect(screen.getByRole("dialog")).toBeVisible();
	expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("");
	expect(onChange).not.toHaveBeenCalled();

	fireEvent.click(screen.getByRole("button", { name: "Apply" }));
	expect(onChange).toHaveBeenCalledWith(null, expect.objectContaining({ reason: "clear-press" }));
	expect(screen.getByRole("dialog")).toBeVisible();
	expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("10/10/2026");
});
