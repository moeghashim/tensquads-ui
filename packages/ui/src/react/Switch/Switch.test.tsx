import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch, SwitchThumb } from "./Switch.js";

afterEach(cleanup);

describe("Switch", () => {
	it("wraps SDK slots and preserves checked state, callbacks, and forwarded props", () => {
		const onCheckedChange = vi.fn();
		const { getByRole } = render(
			<Switch
				aria-label="Updates"
				defaultChecked
				name="updates"
				data-testid="updates"
				onCheckedChange={onCheckedChange}
			>
				<SwitchThumb />
			</Switch>,
		);
		const control = getByRole("switch", { name: "Updates" });
		expect(control).toHaveAttribute("data-slot", "switch");
		expect(control).toHaveAttribute("data-checked");
		expect(control.parentElement?.querySelector("input[name=updates]")).toBeInTheDocument();
		expect(control).toHaveAttribute("data-testid", "updates");
		expect(control.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument();
		fireEvent.click(control);
		expect(onCheckedChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: "press" }));
	});

	it("supports render and disabled state", () => {
		const { getByRole } = render(
			<>
				<Switch aria-label="Read only" render={<div />} />
				<Switch aria-label="Unavailable" disabled defaultChecked>
					<SwitchThumb />
				</Switch>
			</>,
		);
		const rendered = getByRole("switch", { name: "Read only" });
		expect(rendered.tagName).toBe("DIV");
		expect(rendered).toHaveAttribute("data-slot", "switch");
		const disabled = getByRole("switch", { name: "Unavailable" });
		expect(disabled).toHaveAttribute("data-disabled");
		expect(disabled).toHaveAttribute("data-checked");
		fireEvent.click(disabled);
		expect(disabled).toHaveAttribute("data-checked");
	});

	it("focuses and toggles with Space while Enter leaves state unchanged", () => {
		const { getByRole } = render(<Switch aria-label="Updates" render={<div />} />);
		const control = getByRole("switch");
		control.focus();
		expect(control).toHaveFocus();
		fireEvent.keyDown(control, { key: " " });
		fireEvent.keyUp(control, { key: " " });
		expect(control).toHaveAttribute("aria-checked", "true");
		fireEvent.keyDown(control, { key: "Enter" });
		fireEvent.keyUp(control, { key: "Enter" });
		expect(control).toHaveAttribute("aria-checked", "true");
	});

	it("preserves readOnly state and does not emit changes", () => {
		const onCheckedChange = vi.fn();
		const { getByRole } = render(
			<Switch aria-label="Updates" readOnly defaultChecked onCheckedChange={onCheckedChange} render={<div />} />,
		);
		const control = getByRole("switch");
		control.focus();
		expect(control).toHaveFocus();
		fireEvent.click(control);
		fireEvent.keyDown(control, { key: " " });
		fireEvent.keyUp(control, { key: " " });
		expect(control).toHaveAttribute("aria-checked", "true");
		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it("forwards required to form validation and follows controlled updates", () => {
		const onCheckedChange = vi.fn();
		const { getByRole, container, rerender } = render(
			<form>
				<Switch aria-label="Consent" name="consent" required checked={false} onCheckedChange={onCheckedChange} />
			</form>,
		);
		const control = getByRole("switch");
		const input = container.querySelector("input");
		expect(input).toBeRequired();
		expect(input?.checkValidity()).toBe(false);
		fireEvent.click(control);
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "press" }));
		expect(control).toHaveAttribute("aria-checked", "false");
		rerender(
			<form>
				<Switch aria-label="Consent" name="consent" required checked onCheckedChange={onCheckedChange} />
			</form>,
		);
		expect(control).toHaveAttribute("aria-checked", "true");
		expect(input?.checkValidity()).toBe(true);
	});
});
