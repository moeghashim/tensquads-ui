import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Inspector } from "./Inspector.js";

afterEach(cleanup);
Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

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

	describe("select", () => {
		const field = {
			type: "select" as const,
			id: "model",
			label: "Model",
			value: "fast",
			options: [
				{ value: "fast", label: "Fast" },
				{ value: "balanced", label: "Balanced" },
			],
		};

		it("reports the chosen value once and leaves the value to the host", async () => {
			const onValueChange = vi.fn();
			render(<Inspector title="Agent" description="Agent" fields={[{ ...field, onValueChange }]} />);
			const trigger = screen.getByRole("combobox", { name: "Model" });
			expect(trigger).toHaveTextContent("Fast");
			fireEvent.keyDown(trigger, { key: "ArrowDown" });
			fireEvent.click(await screen.findByRole("option", { name: "Balanced", hidden: true }));
			expect(onValueChange).toHaveBeenCalledExactlyOnceWith("balanced");
			expect(trigger).toHaveTextContent("Fast");
		});

		it("has its label in server markup", () => {
			const markup = renderToStaticMarkup(
				<Inspector title="Agent" description="Agent" fields={[{ ...field, onValueChange: vi.fn() }]} />,
			);
			expect(markup).toMatch(/data-slot="select-value"[^>]*>Fast</);
		});
	});

	describe("connections", () => {
		const setup = (value: string[], locale: "en" | "ar" = "en", empty = false) => {
			const onValueChange = vi.fn();
			const targets = [
				{ id: "a", title: "Draft reply" },
				{ id: "b", title: "Review" },
				{ id: "c", title: "Send" },
			];
			render(
				<Inspector
					title="Agent"
					description="Agent"
					locale={locale}
					fields={[
						{
							type: "connections",
							id: "to",
							label: "Connects to",
							targets: empty ? [] : targets,
							value,
							onValueChange,
						},
					]}
				/>,
			);
			return { onValueChange, trigger: screen.getByRole("combobox", { name: "Connects to" }) };
		};

		it("reports the next ids in target order and keeps the ids it does not offer", async () => {
			const { onValueChange, trigger } = setup(["outside", "c"]);
			fireEvent.keyDown(trigger, { key: "ArrowDown" });
			const option = await screen.findByRole("option", { name: "Draft reply", hidden: true });
			expect(screen.getByRole("option", { name: "Send", hidden: true })).toHaveAttribute("aria-selected", "true");
			fireEvent.click(option);
			expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["a", "c", "outside"]);
			fireEvent.click(screen.getByRole("option", { name: "Send", hidden: true }));
			expect(onValueChange).toHaveBeenLastCalledWith(["outside"]);
		});

		it.each([
			["en", "Draft reply, +2", "Draft reply, Review, Send"],
			["ar", "Draft reply، +2", "Draft reply، Review، Send"],
		] as const)("shows a short summary and names every target in %s", (locale, short, full) => {
			const { trigger } = setup(["a", "b", "c"], locale);
			expect(trigger.querySelector('[aria-hidden="true"]')).toHaveTextContent(short);
			expect(trigger.querySelector(".ts-visually-hidden")).toHaveTextContent(full);
		});

		it("shows one title, or None", () => {
			expect(setup(["b"]).trigger).toHaveTextContent(/^Review$/);
			cleanup();
			expect(setup([]).trigger).toHaveTextContent(/^None$/);
			cleanup();
			expect(setup([], "ar").trigger).toHaveTextContent(/^لا شيء$/);
		});

		it("is disabled without targets", () => {
			const { trigger } = setup([], "en", true);
			expect(trigger).toBeDisabled();
			expect(trigger).toHaveTextContent("None");
		});
	});

	describe("chips", () => {
		function Chips({ add = true, remove = true, refuse = false }) {
			const [items, setItems] = useState(["one", "two", "three"]);
			return (
				<Inspector
					title="Agent"
					description="Agent"
					fields={[
						{
							type: "chips",
							id: "schema",
							label: "Output schema",
							items: items.map((id) => ({ id, label: id, icon: "schema" as const })),
							onAdd: add ? () => setItems((current) => [...current, `added${current.length}`]) : undefined,
							onRemove: remove
								? (id) => setItems((current) => (refuse ? [...current] : current.filter((item) => item !== id)))
								: undefined,
						},
					]}
				/>
			);
		}
		const press = (name: string) => {
			const button = screen.getByRole("button", { name });
			button.focus();
			fireEvent.click(button);
		};

		it("adds and removes through its own buttons", () => {
			render(<Chips />);
			const list = screen.getByRole("list", { name: "Output schema" });
			expect(list.children).toHaveLength(3);
			expect(screen.queryByRole("button", { name: "two" })).not.toBeInTheDocument();
			press("Add Output schema");
			expect(list.children).toHaveLength(4);
			press("Remove two");
			expect(screen.queryByText("two")).not.toBeInTheDocument();
		});

		it("moves focus to the next chip, the last chip, then the add button", () => {
			render(<Chips />);
			press("Remove two");
			expect(screen.getByRole("button", { name: "Remove three" })).toHaveFocus();
			press("Remove three");
			expect(screen.getByRole("button", { name: "Remove one" })).toHaveFocus();
			press("Remove one");
			expect(screen.getByRole("button", { name: "Add Output schema" })).toHaveFocus();
		});

		it("keeps focus when the host refuses the removal", () => {
			render(<Chips refuse />);
			press("Remove two");
			expect(screen.getByRole("button", { name: "Remove two" })).toHaveFocus();
		});

		it("has no buttons without callbacks and shows None when it is empty", () => {
			render(<Chips add={false} remove={false} />);
			expect(screen.queryByRole("button")).not.toBeInTheDocument();
			cleanup();
			render(
				<Inspector
					title="Agent"
					description="Agent"
					locale="ar"
					fields={[{ type: "chips", id: "schema", label: "المخطط", items: [] }]}
				/>,
			);
			expect(screen.getByText("لا شيء")).toBeVisible();
			expect(screen.queryByRole("list")).not.toBeInTheDocument();
		});
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
