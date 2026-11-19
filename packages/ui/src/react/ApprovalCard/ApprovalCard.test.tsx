import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlatformApprovalRequest } from "../../schemas/platform.js";
import { formatMillionths } from "../../schemas/platform.js";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
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
	it("emits each decision with approval id and content hash, then locks", () => {
		const onDecision = vi.fn();
		render(<ApprovalCard request={request} onDecision={onDecision} actionLabels={{ refund: "Refund" }} />);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith({ type: "ApprovalDecision", approvalId: "a1", contentHash: "hash-42", decision: "approve" });
		expect(screen.getByText("Approved")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Decline" })).toHaveProperty("disabled", true);
	});
	it("emits reject with the request identifiers", () => {
		const onDecision = vi.fn();
		render(<ApprovalCard request={request} onDecision={onDecision} />);
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		expect(onDecision).toHaveBeenCalledWith({ type: "ApprovalDecision", approvalId: "a1", contentHash: "hash-42", decision: "reject" });
	});
	it.each(["en", "ar"] as const)("supports card copy overrides in %s", (locale) => {
		render(<ApprovalCard request={request} locale={locale} taskId="t1" labels={{ approve: "Allow", decline: "Deny", approved: "Allowed", declined: "Denied", limit: "Cap", task: "Job" }} />);
		expect(screen.getByText(/^Cap /)).toBeTruthy();
		expect(screen.getByText(/Job:/)).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Deny" }));
		expect(screen.getByText("Denied")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Allow" })).toBeDisabled();
	});
	it("leaves streamed decisions unlocked for host acceptance", () => {
		const onAction = vi.fn();
		const stream = 'root = ApprovalCard("a1", "refund", "Refund order 42", "hash-42", null, 20000000, {}, "en", {approve: "Allow", decline: "Deny", limit: "Cap"})';
		const { rerender } = render(<TensquadsRenderer stream={stream} onAction={onAction} />);
		fireEvent.click(screen.getByRole("button", { name: "Allow" }));
		expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ type: "ApprovalDecision", params: { approvalId: "a1", contentHash: "hash-42", decision: "approve" } }));
		expect(screen.getByRole("button", { name: "Deny" })).toBeEnabled();
		fireEvent.click(screen.getByRole("button", { name: "Deny" }));
		expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ type: "ApprovalDecision", params: { approvalId: "a1", contentHash: "hash-42", decision: "reject" } }));
		rerender(<TensquadsRenderer stream={stream} onAction={onAction} isStreaming />);
		expect(screen.getByRole("button", { name: "Allow" })).toBeDisabled();
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
});
