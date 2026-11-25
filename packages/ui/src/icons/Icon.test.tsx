import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Icon } from "./Icon.js";

afterEach(cleanup);

describe("Icon", () => {
	it("renders the selected path and is hidden from assistive technology", () => {
		const { container } = render(<Icon name="approval" size={14} />);
		const svg = container.querySelector("svg");

		expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
		expect(svg).toHaveAttribute("width", "14");
		expect(svg).toHaveAttribute("height", "14");
		expect(svg).toHaveAttribute("fill", "none");
		expect(svg).toHaveAttribute("stroke", "currentColor");
		expect(svg).toHaveAttribute("stroke-width", "1.5");
		expect(svg).toHaveAttribute("stroke-linecap", "round");
		expect(svg).toHaveAttribute("stroke-linejoin", "round");
		expect(svg).toHaveAttribute("aria-hidden", "true");
		expect(svg?.querySelector("path")).toHaveAttribute(
			"d",
			"M6 13V6.5l2-4c.8 0 1.3.6 1.1 1.4L8.7 6H12c.9 0 1.4.8 1.2 1.6l-1 4C12 12.5 11.4 13 10.6 13H6zM3 6.5h3V13H3z",
		);
	});

	it("defaults to 16px", () => {
		const { container } = render(<Icon name="play" />);
		expect(container.querySelector("svg")).toHaveAttribute("width", "16");
	});
});
