import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Node } from "./Node.js";

afterEach(cleanup);

describe("Node", () => {
	it("renders a titled node with family glyph and ports", () => {
		const { getByText, container } = render(<Node kind="agent" title="Review order" meta="Agent" />);
		expect(getByText("Review order")).toBeInTheDocument();
		expect(getByText("Agent")).toBeInTheDocument();
		expect(container.querySelectorAll('[data-port="in"]')).toHaveLength(1);
		expect(container.querySelectorAll('[data-port="out"]')).toHaveLength(1);
		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
	});
	it("renders a selected If/else with one output port per branch", () => {
		const { container, getByText } = render(
			<Node kind="if-else" title="Check stock" meta="Conditions" branches={["In stock", "Else"]} selected />,
		);
		expect(container.firstElementChild).toHaveAttribute("data-selected", "true");
		expect(getByText("In stock")).toBeInTheDocument();
		expect(container.querySelectorAll('[data-port="out"]')).toHaveLength(2);
		expect(container.querySelector(".ts-node__branches .ts-node__port")).toHaveAttribute("data-port-index", "0");
	});
	it("hides note metadata and terminal ports", () => {
		const { queryByText } = render(<Node kind="note" title="Remember" meta="Hidden" />);
		expect(queryByText("Hidden")).toBeNull();
		const { container: start } = render(<Node kind="start" title="Start" />);
		const { container: end } = render(<Node kind="end" title="End" />);
		expect(start.querySelector('[data-port="in"]')).toBeNull();
		expect(end.querySelectorAll('[data-port="out"]')).toHaveLength(0);
	});
});
