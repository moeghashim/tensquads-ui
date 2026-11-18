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

	it("supports render, disabled, and keyboard focus", () => {
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
	});
});
