import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OwnerMessageView, pendingQuestion } from "./OwnerMessage.js";

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
	},
	{ seq: 2, at, type: "question", questionId: "q1", text: "Choose a size", options: ["Small", "Large"] },
	{ seq: 1, at, type: "reply", text: "See **literal** https://example.com" },
] as const;

describe("OwnerMessageView", () => {
	it("renders all six messages in sequence and emits answer commands", () => {
		const onCommand = vi.fn();
		const { container } = render(<OwnerMessageView messages={messages} onCommand={onCommand} />);
		expect(container.textContent?.indexOf("See https://example.com")).toBeLessThan(
			container.textContent?.indexOf("Choose a size") ?? 0,
		);
		expect(screen.getByRole("link", { name: "https://example.com" })).toBeTruthy();
		expect(container.querySelector(".ts-chat-reply__plain")?.textContent).toContain("**literal**");
		expect(screen.getByRole("link", { name: "https://example.com/order" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Small" }));
		expect(onCommand).toHaveBeenCalledWith({ type: "OwnerAnswer", questionId: "q1", text: "Small" });
		expect(screen.getByText("Action could not be confirmed")).toBeTruthy();
	});
	it("selects newest free text question and reports an unknown message", async () => {
		const free = [{ seq: 1, at, type: "question", questionId: "q2", text: "What is the order number?", options: [] }];
		expect(pendingQuestion(free)?.questionId).toBe("q2");
		const onUnknown = vi.fn();
		render(<OwnerMessageView messages={[{ seq: 3, at, type: "future" }]} onUnknown={onUnknown} />);
		await vi.waitFor(() => expect(onUnknown).toHaveBeenCalledOnce());
	});
});
