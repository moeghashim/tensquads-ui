import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import type { PlatformApprovalRequest } from "../../schemas/platform.js";
import { formatMillionths } from "../../schemas/platform.js";
import { useChat } from "../Chat/useChat.js";
import { ChatReply } from "../ChatReply/ChatReply.js";
import { ApprovalCard } from "./ApprovalCard.js";

afterEach(cleanup);

const request: PlatformApprovalRequest = {
	seq: 1,
	at: "2026-11-19T12:00:00.000Z",
	type: "approval_request",
	approvalId: "a1",
	action: "refund",
	content: "Refund order 42",
	contentHash: "hash-42",
	rule: "daily_limit",
	limit: 20_000_000,
};

describe("ApprovalCard", () => {
	it("emits each decision with approval id and content hash, then locks", async () => {
		const onDecision = vi.fn();
		render(<ApprovalCard request={request} onDecision={onDecision} actionLabels={{ refund: "Refund" }} />);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith({
			type: "ApprovalDecision",
			approvalId: "a1",
			contentHash: "hash-42",
			decision: "approve",
		});
		expect(await screen.findByText("Approved")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Decline" })).toHaveProperty("disabled", true);
	});
	it("emits reject with the request identifiers", async () => {
		const onDecision = vi.fn();
		render(<ApprovalCard request={request} onDecision={onDecision} />);
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		expect(onDecision).toHaveBeenCalledWith({
			type: "ApprovalDecision",
			approvalId: "a1",
			contentHash: "hash-42",
			decision: "reject",
		});
		expect(await screen.findByText("Declined")).toBeInTheDocument();
	});
	it.each(["en", "ar"] as const)("supports card copy overrides in %s", async (locale) => {
		render(
			<ApprovalCard
				request={request}
				locale={locale}
				taskId="t1"
				labels={{
					approve: "Allow",
					decline: "Deny",
					approved: "Allowed",
					declined: "Denied",
					limit: "Cap",
					task: "Job",
				}}
			/>,
		);
		expect(screen.getByText(/^Cap /)).toBeTruthy();
		expect(screen.getByText(/Job:/)).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Deny" }));
		expect(await screen.findByText("Denied")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Allow" })).toBeDisabled();
	});
	it.each([
		["Allow", "approve", "Approved"],
		["Deny", "reject", "Declined"],
	] as const)("locks an accepted streamed %s decision", async (button, decision, outcome) => {
		const onAction = vi.fn();
		const stream =
			'root = ApprovalCard("a1", "refund", "Refund order 42", "hash-42", null, 20000000, {}, "en", {approve: "Allow", decline: "Deny"})';
		const { container } = render(<TensquadsRenderer stream={stream} onAction={onAction} />);
		fireEvent.click(screen.getByRole("button", { name: button }));
		expect(onAction).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({
				type: "ApprovalDecision",
				params: { approvalId: "a1", contentHash: "hash-42", decision },
			}),
		);
		expect(await screen.findByText(outcome)).toBeInTheDocument();
		expect(container.querySelector(".ts-approval-card__outcome svg")).not.toBeNull();
		for (const name of ["Allow", "Deny"]) {
			expect(screen.getByRole("button", { name })).toBeDisabled();
			fireEvent.click(screen.getByRole("button", { name }));
		}
		expect(onAction).toHaveBeenCalledOnce();
	});
	it.each(["approve", "reject"] as const)("shows accepted %s after a useChat veto", async (decision) => {
		let allow = false;
		const transport = vi.fn(async function* () {
			yield "Recorded";
		});
		function Example() {
			const chat = useChat({ endpoint: "/chat", transport, onAction: () => allow });
			return (
				<ChatReply
					reply={'```openui\nroot = ApprovalCard("a1", "refund", "Refund", "hash-42")\n```'}
					onAction={(event, id) => chat.act(event, id)}
					locked={(id) => chat.locked.has(id)}
					isStreaming={chat.busy}
				/>
			);
		}
		render(<Example />);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		await waitFor(() => expect(screen.getByRole("button", { name: "Decline" })).toBeEnabled());
		expect(screen.queryByText("Approved")).toBeNull();
		expect(transport).not.toHaveBeenCalled();
		allow = true;
		fireEvent.click(screen.getByRole("button", { name: decision === "approve" ? "Approve" : "Decline" }));
		expect(await screen.findByText(decision === "approve" ? "Approved" : "Declined")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
		expect(transport).toHaveBeenCalledOnce();
	});
	it("blocks opposing decisions during asynchronous acceptance and recovers from rejection", async () => {
		let settle!: (accepted: boolean) => void;
		const onAction = vi.fn(
			() =>
				new Promise<boolean>((resolve) => {
					settle = resolve;
				}),
		);
		const stream = 'root = ApprovalCard("a1", "refund", "Refund", "hash-42")';
		const { rerender } = render(<TensquadsRenderer stream={stream} onAction={onAction} />);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		expect(onAction).toHaveBeenCalledOnce();
		await act(async () => settle(false));
		expect(screen.getByRole("button", { name: "Decline" })).toBeEnabled();
		rerender(<TensquadsRenderer stream={stream} onAction={() => Promise.reject(new Error("Veto"))} />);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		await waitFor(() => expect(screen.getByRole("button", { name: "Decline" })).toBeEnabled());
		expect(screen.queryByText("Approved")).toBeNull();
		rerender(<TensquadsRenderer stream={stream} onAction={onAction} />);
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		await act(async () => settle(true));
		expect(screen.getByText("Declined")).toBeInTheDocument();
	});

	it("restores a host decision and formats millionths", () => {
		render(<ApprovalCard request={request} decision="reject" />);
		expect(screen.getByText("Declined")).toBeTruthy();
		expect(screen.getByText("Limit $20.00")).toBeTruthy();
		expect(formatMillionths(0, "en")).toBe("$0.00");
		expect(formatMillionths(1_250_000, "en")).toBe("$1.25");
		expect(formatMillionths(1_000_000_000, "en")).toBe("$1,000.00");
		expect(formatMillionths(20_000_000, "ar")).toContain("٢٠٫٠٠");
	});
	it("preserves locale and copy positions when appending rule labels", () => {
		const stream =
			'root = ApprovalCard("a1", "refund", "Refund", "hash-42", "daily_limit", null, {}, "ar", {approve: "Allow"}, {daily_limit: "Daily refund limit"})';
		render(<TensquadsRenderer stream={stream} locale="ar" />);
		expect(screen.getByRole("button", { name: "Allow" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "رفض" })).toBeEnabled();
		expect(screen.getByText("Daily refund limit")).toBeInTheDocument();
	});

	it("hides raw rule ids and shows a supplied label and limit", () => {
		const { rerender } = render(<ApprovalCard request={request} />);
		expect(screen.queryByText("daily_limit")).toBeNull();
		expect(screen.getByText("Limit $20.00")).toBeInTheDocument();
		rerender(<ApprovalCard request={request} ruleLabels={{ daily_limit: "Daily refund limit" }} />);
		expect(screen.getByText("Daily refund limit")).toBeInTheDocument();
	});
});
