import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readOpenUIRequest } from "../../openui/server/request.js";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import type { ChatTurn, Locale } from "../../schemas/index.js";
import { Button } from "../Button/Button.js";
import { useChat } from "../Chat/useChat.js";
import { ChatReply } from "../ChatReply/ChatReply.js";
import { Input } from "../Input/Input.js";
import { Form } from "./Form.js";

afterEach(cleanup);

const fixtures = {
	en: readFileSync(resolve(process.cwd(), "packages/ui/src/react/Form/Form.fixture.en.txt"), "utf8"),
	ar: readFileSync(resolve(process.cwd(), "packages/ui/src/react/Form/Form.fixture.ar.txt"), "utf8"),
};

const copy = {
	en: {
		name: "Project",
		field: "Project name",
		input: "Owner",
		notifications: "Email updates",
		layout: "Layout",
		list: "List",
		grid: "Grid",
		submit: "Save project",
		initial: "Northstar",
		owner: "Moe",
	},
	ar: {
		name: "المشروع",
		field: "اسم المشروع",
		input: "المسؤول",
		notifications: "تحديثات البريد",
		layout: "التخطيط",
		list: "قائمة",
		grid: "شبكة",
		submit: "حفظ المشروع",
		initial: "بنّاء",
		owner: "محمد",
	},
};

describe("Form", () => {
	it("forwards native props and blocks disabled submissions without navigation", () => {
		const onSubmit = vi.fn();
		const { rerender } = render(
			<Form aria-label="Project" name="project" onSubmit={onSubmit} disabled>
				<Input aria-label="Name" defaultValue="Northstar" />
				<Button type="submit">Save</Button>
			</Form>,
		);
		const form = screen.getByRole("form", { name: "Project" });
		expect(form).toHaveAttribute("name", "project");
		expect(screen.getByRole("textbox")).toBeDisabled();
		expect(fireEvent.submit(form)).toBe(false);
		expect(onSubmit).not.toHaveBeenCalled();
		rerender(
			<Form aria-label="Project" onSubmit={onSubmit}>
				<Input aria-label="Name" defaultValue="Northstar" />
				<Button type="submit">Save</Button>
			</Form>,
		);
		expect(screen.getByRole("textbox")).toHaveValue("Northstar");
		expect(screen.getByRole("textbox")).toBeEnabled();
		expect(fireEvent.submit(form)).toBe(false);
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it.each(["en", "ar"] as const)(
		"submits defaults and current edits in %s and retains locked values",
		async (locale) => {
			const labels = copy[locale];
			const onAction = vi.fn();
			const reply = `\`\`\`openui\n${fixtures[locale]}\n\`\`\``;
			const { rerender } = render(<ChatReply reply={reply} locale={locale} onAction={onAction} />);
			const field = screen.getByRole("textbox", { name: labels.field });
			const input = screen.getByRole("textbox", { name: labels.input });
			const notifications = screen.getByRole("switch", { name: labels.notifications });
			const layout = screen.getByRole("radiogroup", { name: labels.layout });
			const submit = screen.getByRole("button", { name: labels.submit });
			expect(field).toHaveValue(labels.initial);
			expect(input).toHaveValue(labels.owner);
			expect(notifications).toHaveAttribute("aria-checked", "true");
			expect(screen.getByRole("radio", { name: labels.list })).toHaveAttribute("aria-checked", "true");
			fireEvent.click(submit);
			expect(onAction).toHaveBeenLastCalledWith(
				expect.objectContaining({
					type: "SaveProject",
					params: { planId: "p1" },
					formName: labels.name,
					formState: {
						[labels.name]: {
							project: { value: labels.initial, componentType: "Field" },
							owner: { value: labels.owner, componentType: "Input" },
							emailUpdates: { value: true, componentType: "Switch" },
							layout: { value: labels.list, componentType: "SegmentedControl" },
						},
					},
				}),
				"fence-0",
			);
			fireEvent.input(field, { target: { value: "Edited project" } });
			fireEvent.input(input, { target: { value: "Edited owner" } });
			fireEvent.click(notifications);
			fireEvent.click(screen.getByRole("radio", { name: labels.grid }));
			fireEvent.submit(screen.getByRole("form", { name: labels.name }));
			expect(onAction).toHaveBeenCalledTimes(2);
			expect(onAction.mock.calls[1]?.[0].formState).toEqual({
				[labels.name]: {
					project: { value: "Edited project", componentType: "Field" },
					owner: { value: "Edited owner", componentType: "Input" },
					emailUpdates: { value: false, componentType: "Switch" },
					layout: { value: labels.grid, componentType: "SegmentedControl" },
				},
			});
			rerender(<ChatReply reply={reply} locale={locale} onAction={onAction} locked />);
			expect(screen.getByRole("textbox", { name: labels.field })).toBe(field);
			expect(field).toHaveValue("Edited project");
			expect(input).toHaveValue("Edited owner");
			expect(notifications).toHaveAttribute("aria-checked", "false");
			expect(screen.getByRole("radio", { name: labels.grid })).toHaveAttribute("aria-checked", "true");
			for (const control of [field, input, notifications, ...layout.querySelectorAll('[role="radio"]'), submit]) {
				expect(control).toBeDisabled();
			}
			fireEvent.submit(screen.getByRole("form", { name: labels.name }));
			expect(onAction).toHaveBeenCalledTimes(2);
		},
	);

	it("disables streaming form controls and includes current form values in child button actions", async () => {
		const stream =
			'root = Form("Project", [Field("Name", "name", "", "Northstar"), Switch("Updates", true, false, "updates"), SegmentedControl("Layout", ["List", "Grid"], "List", false, "layout"), Button("Check", "solid", "md", false, false, {type: "Check"})], "Save", {type: "Save"})';
		const onAction = vi.fn();
		const { rerender } = render(<TensquadsRenderer stream={stream} onAction={onAction} isStreaming />);
		expect(screen.getByRole("textbox")).toBeDisabled();
		expect(screen.getByRole("switch", { name: "Updates" })).toBeDisabled();
		for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAttribute("data-disabled");
		for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
		fireEvent.submit(screen.getByRole("form"));
		expect(onAction).not.toHaveBeenCalled();
		rerender(<TensquadsRenderer stream={stream} onAction={onAction} />);
		await waitFor(() => expect(screen.getByRole("button", { name: "Check" })).toBeEnabled());
		fireEvent.input(screen.getByRole("textbox"), { target: { value: "Updated" } });
		fireEvent.click(screen.getByRole("button", { name: "Check" }));
		expect(onAction).toHaveBeenCalledOnce();
		expect(onAction).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "Check",
				formName: "Project",
				formState: {
					Project: {
						name: { value: "Updated", componentType: "Field" },
						updates: { value: true, componentType: "Switch" },
						layout: { value: "List", componentType: "SegmentedControl" },
					},
				},
			}),
		);
	});

	it.each(["en", "ar"] as const)("sends an accepted %s form as the next turn after a host veto", async (locale) => {
		const labels = copy[locale];
		let allow = false;
		const requests: ChatTurn[][] = [];
		const transport = vi.fn(async function* (request: { turns: ChatTurn[]; locale: Locale }) {
			requests.push(request.turns);
			const normalized = await readOpenUIRequest(
				new Request("https://example.com/chat", {
					method: "POST",
					body: JSON.stringify(request),
				}),
			);
			expect(normalized.turns[0]?.content).toContain('"value":"Edited"');
			yield "Saved";
		});
		function Example() {
			const chat = useChat({ endpoint: "/chat", locale, transport, onAction: () => allow });
			return (
				<>
					<ChatReply
						reply={`\`\`\`openui\n${fixtures[locale]}\n\`\`\``}
						locale={locale}
						isStreaming={chat.busy}
						locked={(id) => chat.locked.has(id)}
						onAction={(event, id) => void chat.act(event, id)}
					/>
					{chat.turns.map((turn) =>
						turn.role === "action" ? (
							<p key="action">{turn.action.summary}</p>
						) : turn.role === "assistant" ? (
							<p key="reply">{turn.content}</p>
						) : null,
					)}
				</>
			);
		}
		render(<Example />);
		const field = screen.getByRole("textbox", { name: labels.field });
		fireEvent.input(field, { target: { value: "Edited" } });
		fireEvent.click(screen.getByRole("button", { name: labels.submit }));
		await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
		expect(requests).toEqual([]);
		expect(field).toHaveValue("Edited");
		allow = true;
		fireEvent.submit(screen.getByRole("form", { name: labels.name }));
		await screen.findByText("Saved");
		expect(requests).toEqual([
			[
				{
					role: "action",
					action: {
						name: "SaveProject",
						source: labels.name,
						summary: labels.submit,
						values: {
							planId: "p1",
							[labels.name]: {
								project: { value: "Edited", componentType: "Field" },
								owner: { value: labels.owner, componentType: "Input" },
								emailUpdates: { value: true, componentType: "Switch" },
								layout: { value: labels.list, componentType: "SegmentedControl" },
							},
						},
					},
				},
			],
		]);
		expect(screen.getByText(labels.submit, { selector: "p" })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: labels.field })).toBe(field);
		expect(field).toHaveValue("Edited");
		expect(field).toBeDisabled();
	});
});
