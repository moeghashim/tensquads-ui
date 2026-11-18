import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";

afterEach(cleanup);

describe("streamed Switch initial state", () => {
	it("applies a checked value arriving after the label without remounting", () => {
		const { getByRole, rerender } = render(<TensquadsRenderer stream={'root = Switch("Updates",'} />);
		const control = getByRole("switch", { name: "Updates" });
		expect(control).toHaveAttribute("aria-checked", "false");
		rerender(<TensquadsRenderer stream={'root = Switch("Updates", true, false)'} />);
		expect(getByRole("switch")).toBe(control);
		expect(control).toHaveAttribute("aria-checked", "true");
	});

	it("keeps a user's choice when initial values and disabled state arrive", () => {
		const { getByRole, rerender } = render(<TensquadsRenderer stream={'root = Switch("Updates",'} />);
		const control = getByRole("switch");
		fireEvent.click(control);
		expect(control).toHaveAttribute("aria-checked", "true");
		fireEvent.click(control);
		expect(control).toHaveAttribute("aria-checked", "false");
		rerender(<TensquadsRenderer stream={'root = Switch("Updates", true, true)'} />);
		expect(getByRole("switch")).toBe(control);
		expect(control).toHaveAttribute("aria-checked", "false");
		expect(control).toHaveAttribute("data-disabled");
	});
});
