import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlatformApprovalRequest } from "../../schemas/platform.js";
import { approvalDecisionCommand, formatMillionths } from "../../schemas/platform.js";
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
		expect(onDecision).toHaveBeenCalledWith(approvalDecisionCommand(request, "approve"));
		expect(screen.getByText("Approved")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Decline" })).toHaveProperty("disabled", true);
	});
	it("emits reject with the request identifiers", () => {
		const onDecision = vi.fn();
		render(<ApprovalCard request={request} onDecision={onDecision} />);
		fireEvent.click(screen.getByRole("button", { name: "Decline" }));
		expect(onDecision).toHaveBeenCalledWith(approvalDecisionCommand(request, "reject"));
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
