import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { approvalDecisions, OwnerMessageView, pendingQuestion } from "./OwnerMessage.js";

afterEach(cleanup);

const at = "2026-11-19T12:00:00.000Z";
const messages = [
	{ seq: 6, at, type: "action_not_confirmed", taskId: "t1", actionId: "a1", what: "Could not verify the refund" },
	{ seq: 5, at, type: "status", taskId: "t1", bot: "petra", attempt: 2, step: "Checking the order", since: at },
	{ seq: 4, at, type: "result", taskId: "t1", summary: "Order updated", evidence: ["https://example.com/order"] },
	{
		seq: 3,
		at,
		type: "approval_request",
		approvalId: "a1",
		action: "refund",
		content: "Refund order",
		contentHash: "hash",
		rule: null,
		limit: null,
		amount: null,
		bot: "support-bot",
		taskId: "t1",
	},
	{ seq: 2, at, type: "question", questionId: "q1", text: "Choose a size", options: ["Small", "Large"] },
	{ seq: 1, at, type: "reply", text: "See **literal** https://example.com" },
] as const;

describe("OwnerMessageView", () => {
	it.each(["en", "ar"] as const)("preserves URL destinations across owner text in %s", (locale) => {
		const text = "See (https://en.wikipedia.org/wiki/Refund_(finance)).";
		render(
			<OwnerMessageView
				locale={locale}
				messages={[
					{ ...messages[5], text },
					{ ...messages[2], summary: text, evidence: [text] },
				]}
			/>,
		);
		expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
			"https://en.wikipedia.org/wiki/Refund_(finance)",
			"https://en.wikipedia.org/wiki/Refund_(finance)",
			"https://en.wikipedia.org/wiki/Refund_(finance)",
		]);
	});
	it("applies the newest approval decision and overrides host state", () => {
		const decided = [
			messages[3],
			{ seq: 7, at, type: "approval_decided", approvalId: "a1", decision: "reject" },
			{ seq: 8, at, type: "approval_decided", approvalId: "a1", decision: "approve" },
		] as const;
		expect(approvalDecisions(decided)).toEqual({ a1: "approve" });
		render(<OwnerMessageView messages={decided} approvalDecisions={{ a1: "reject" }} />);
		expect(screen.getByText("Approved")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
	});
	it("closes answered questions without choosing an option", () => {
		const question = { seq: 1, at, type: "question", questionId: "q1", text: "Choose", options: ["A", "B"] } as const;
		const answered = { seq: 2, at, type: "question_answered", questionId: "q1" } as const;
		expect(
			pendingQuestion([
				{ seq: 1, at, type: "question", questionId: "q2", text: "Answer?", options: [] },
				{ ...answered, questionId: "q2" },
			]),
		).toBeUndefined();
		render(<OwnerMessageView messages={[question, answered]} />);
		expect(screen.getByRole("button", { name: "A" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
		expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "false");
		expect(document.querySelectorAll(".ts-owner-messages > *")).toHaveLength(1);
	});
	it("renders decision and answer messages without visible content", () => {
		render(
			<OwnerMessageView
				messages={[
					{ seq: 1, at, type: "approval_decided", approvalId: "a1", decision: "approve" },
					{ seq: 2, at, type: "question_answered", questionId: "q1" },
				]}
			/>,
		);
		expect(document.querySelector(".ts-owner-messages")?.children).toHaveLength(0);
	});

	it("renders all six messages in sequence and emits answer commands", () => {
		const onCommand = vi.fn();
		const { container } = render(<OwnerMessageView messages={messages} onCommand={onCommand} />);
		const ordered = Array.from(container.querySelector(".ts-owner-messages")?.children ?? []).map(
			(node) => node.textContent,
		);
		expect(ordered).toHaveLength(6);
		for (const [index, text] of [
			"See **literal** https://example.com",
			"Choose a size",
			"Refund order",
			"Order updated",
			"Checking the order",
			"Could not verify the refund",
		].entries()) {
			expect(ordered[index]).toContain(text);
		}
		expect(screen.getByRole("link", { name: "https://example.com" })).toBeTruthy();
		expect(container.querySelector(".ts-chat-reply__plain")?.textContent).toContain("**literal**");
		expect(screen.getByRole("link", { name: "https://example.com/order" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Small" }));
		expect(onCommand).toHaveBeenCalledWith({ type: "OwnerAnswer", questionId: "q1", text: "Small" });
		expect(screen.getByText("Action could not be confirmed")).toBeTruthy();
	});
	it("restores only the matching approval", () => {
		const second = { ...messages[3], seq: 7, approvalId: "a2", content: "Second request" };
		const { container } = render(
			<OwnerMessageView messages={[messages[3], second]} approvalDecisions={{ a1: "approve" }} />,
		);
		const cards = container.querySelectorAll(".ts-approval-card");
		expect(within(cards[0] as HTMLElement).getByRole("button", { name: "Approve" })).toBeDisabled();
		expect(within(cards[1] as HTMLElement).getByRole("button", { name: "Approve" })).toBeEnabled();
	});
	it("preserves question and approval locks when earlier messages are removed", async () => {
		const onCommand = vi.fn();
		const { rerender } = render(<OwnerMessageView messages={messages} onCommand={onCommand} />);
		fireEvent.click(screen.getByRole("button", { name: "Small" }));
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		await screen.findByText("Approved");
		rerender(<OwnerMessageView messages={messages.filter((message) => message.seq !== 1)} onCommand={onCommand} />);
		expect(screen.getByRole("button", { name: "Small" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		expect(onCommand).toHaveBeenCalledTimes(2);
	});
	it.each(["en", "ar"] as const)("shares plain text links and supports copy overrides in %s", (locale) => {
		render(
			<OwnerMessageView
				locale={locale}
				messages={[
					{
						...messages[2],
						summary: "See **summary** https://example.com/summary.",
						evidence: ["See **evidence** https://example.com/order/42."],
					},
					{ ...messages[4], options: [] },
					messages[1],
					messages[0],
				]}
				labels={{ answerHint: "Answer here", attempt: "Try", errorTitle: "Unconfirmed" }}
			/>,
		);
		expect(screen.getByRole("link", { name: "https://example.com/order/42" })).toHaveAttribute(
			"href",
			"https://example.com/order/42",
		);
		expect(screen.getByRole("link", { name: "https://example.com/summary" })).toHaveAttribute(
			"href",
			"https://example.com/summary",
		);
		expect(screen.getByText("Answer here")).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent("Try 2");
		expect(screen.getByText("Unconfirmed")).toBeInTheDocument();
	});

	it("selects newest free text question and reports an unknown message", async () => {
		const free = [{ seq: 1, at, type: "question", questionId: "q2", text: "What is the order number?", options: [] }];
		expect(pendingQuestion(free)?.questionId).toBe("q2");
		const onUnknown = vi.fn();
		render(<OwnerMessageView messages={[{ seq: 3, at, type: "future" }]} onUnknown={onUnknown} />);
		await vi.waitFor(() => expect(onUnknown).toHaveBeenCalledOnce());
	});
});
