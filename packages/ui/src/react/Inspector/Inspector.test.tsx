import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Inspector } from "./Inspector.js";

afterEach(cleanup);

const fields = [
	{
		type: "text" as const,
		id: "name",
		label: "Name",
		value: "Petra",
		onValueChange: vi.fn(),
		placeholder: "Agent name",
	},
	{ type: "switch" as const, id: "reasoning", label: "Reasoning", checked: true, onCheckedChange: vi.fn() },
	{
		type: "longtext" as const,
		id: "instructions",
		label: "Instructions",
		value: "Help customers.",
		onValueChange: vi.fn(),
		actions: [{ id: "improve", label: "Improve instructions", icon: "wand" as const, onPress: vi.fn() }],
	},
];

describe("Inspector", () => {
	it("names the section and renders each controlled field by its visible label", () => {
		render(<Inspector title="Agent" description="Workflow agent" fields={fields} />);
		expect(screen.getByRole("region", { name: "Agent" })).toBeVisible();
		expect(screen.getByRole("heading", { level: 2, name: "Agent" })).toBeVisible();
		expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Petra");
		expect(screen.getByRole("switch", { name: "Reasoning" })).toBeChecked();
		expect(screen.getByRole("textbox", { name: "Instructions" })).toHaveValue("Help customers.");
		expect(screen.getByRole("button", { name: "Improve instructions" })).toBeVisible();
	});

	it("passes values through and leaves controlled text to the host", () => {
		const onValueChange = vi.fn();
		const onCheckedChange = vi.fn();
		render(
			<Inspector
				title="Agent"
				description="Workflow agent"
				fields={[
					{ type: "text", id: "name", label: "Name", value: "Petra", onValueChange },
					{ type: "switch", id: "reasoning", label: "Reasoning", checked: false, onCheckedChange },
				]}
			/>,
		);
		fireEvent.input(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Mina" } });
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith("Mina");
		expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Petra");
		fireEvent.click(screen.getByRole("switch", { name: "Reasoning" }));
		expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
	});

	it("shows head and footer actions only when supplied and supports custom and null footers", () => {
		const handlers = { onDuplicate: vi.fn(), onDelete: vi.fn(), onMore: vi.fn(), onEvaluate: vi.fn() };
		const view = render(<Inspector title="Agent" description="Workflow agent" fields={[]} />);
		expect(screen.queryByRole("button", { name: "Duplicate" })).not.toBeInTheDocument();
		expect(view.container.querySelector(".ts-inspector__footer")).toBeNull();
		view.rerender(<Inspector title="Agent" description="Workflow agent" fields={[]} {...handlers} />);
		for (const name of ["Duplicate", "Delete", "More", "Evaluate"])
			expect(screen.getByRole("button", { name })).toBeVisible();
		const custom = <div>Custom actions</div>;
		view.rerender(<Inspector title="Agent" description="Workflow agent" fields={[]} footer={custom} {...handlers} />);
		expect(screen.getByText("Custom actions")).toBeVisible();
		expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
		view.rerender(<Inspector title="Agent" description="Workflow agent" fields={[]} footer={null} {...handlers} />);
		expect(view.container.querySelector(".ts-inspector__footer")).toBeNull();
	});

	it("runs head, footer, and longtext actions", () => {
		const handlers = { onDuplicate: vi.fn(), onDelete: vi.fn(), onMore: vi.fn(), onEvaluate: vi.fn() };
		render(<Inspector title="Agent" description="Workflow agent" fields={fields} {...handlers} />);
		for (const name of ["Duplicate", "Delete", "More", "Evaluate", "Improve instructions"])
			fireEvent.click(screen.getByRole("button", { name }));
		expect(handlers.onDuplicate).toHaveBeenCalledOnce();
		expect(handlers.onDelete).toHaveBeenCalledOnce();
		expect(handlers.onMore).toHaveBeenCalledOnce();
		expect(handlers.onEvaluate).toHaveBeenCalledOnce();
		expect(fields[2]!.actions![0]!.onPress).toHaveBeenCalledOnce();
	});

	it("localizes built-in action labels and server renders", () => {
		render(
			<Inspector title="وكيل" description="وصف" fields={[]} locale="ar" onDuplicate={vi.fn()} onMore={vi.fn()} />,
		);
		expect(screen.getByRole("button", { name: "تكرار" })).toBeVisible();
		expect(screen.getByRole("button", { name: "المزيد" })).toBeVisible();
		expect(screen.queryByRole("button", { name: "Duplicate" })).not.toBeInTheDocument();
		const markup = renderToStaticMarkup(
			<Inspector title="Agent" description="Workflow agent" fields={[fields[0]!]} />,
		);
		expect(markup).toContain("aria-labelledby=");
		expect(markup).toContain('data-slot="input"');
		expect(markup).toContain("Name");
	});
});
