import { describe, expect, it } from "vitest";
import {
	ApprovalDecisionCommandSchema,
	approvalDecisionCommand,
	CancelTaskCommandSchema,
	cancelTaskCommand,
	OwnerAnswerCommandSchema,
	OwnerMessageCommandSchema,
	ownerAnswerCommand,
	ownerMessageCommand,
	PlatformActionNotConfirmedSchema,
	PlatformApprovalDecidedSchema,
	PlatformApprovalRequestSchema,
	PlatformQuestionAnsweredSchema,
	PlatformQuestionSchema,
	PlatformReplySchema,
	PlatformResultSchema,
	PlatformStatusSchema,
	withCommandMeta,
} from "./platform.js";

const at = "2026-11-19T12:00:00.000Z";
const messages = [
	[{ seq: 1, at, type: "reply", text: "Hello" }, PlatformReplySchema],
	[{ seq: 1, at, type: "question", questionId: "q1", text: "Pick one", options: ["Yes"] }, PlatformQuestionSchema],
	[
		{
			seq: 1,
			at,
			type: "approval_request",
			approvalId: "a1",
			action: "refund",
			content: "Refund",
			contentHash: "hash",
			rule: null,
			limit: null,
			amount: null,
			bot: "support-bot",
			taskId: "t1",
		},
		PlatformApprovalRequestSchema,
	],
	[{ seq: 1, at, type: "result", taskId: "t1", summary: "Done", evidence: [] }, PlatformResultSchema],
	[
		{ seq: 1, at, type: "status", taskId: "t1", bot: "petra", attempt: 1, step: "Working", since: at },
		PlatformStatusSchema,
	],
	[
		{ seq: 1, at, type: "action_not_confirmed", taskId: "t1", actionId: "a1", what: "Unknown" },
		PlatformActionNotConfirmedSchema,
	],
	[{ seq: 1, at, type: "approval_decided", approvalId: "a1", decision: "approve" }, PlatformApprovalDecidedSchema],
	[{ seq: 1, at, type: "question_answered", questionId: "q1" }, PlatformQuestionAnsweredSchema],
] as const;

describe("platform message and command contracts", () => {
	it("accepts each platform message and rejects wrong literals and extra fields", () => {
		for (const [example, schema] of messages) {
			expect(schema.safeParse(example).success).toBe(true);
			expect(schema.safeParse({ ...example, extra: true }).success).toBe(false);
			expect(schema.safeParse({ ...example, type: "wrong" }).success).toBe(false);
		}
	});
	it("requires the new approval fields and validates whole nonnegative amounts", () => {
		const example = messages[2][0];
		for (const field of ["amount", "bot", "taskId"] as const) {
			const missing = { ...example } as Record<string, unknown>;
			delete missing[field];
			expect(PlatformApprovalRequestSchema.safeParse(missing).success).toBe(false);
		}
		for (const amount of [-1, 1.5])
			expect(PlatformApprovalRequestSchema.safeParse({ ...example, amount }).success).toBe(false);
		expect(
			PlatformApprovalDecidedSchema.safeParse({
				seq: 1,
				at,
				type: "approval_decided",
				approvalId: "a1",
				decision: "maybe",
			}).success,
		).toBe(false);
	});
	it("builds exact command bodies and validates host metadata", () => {
		const request = messages[2][0];
		expect(ownerMessageCommand({ messageId: "m1", channel: "web", text: "Hello" })).toEqual({
			type: "OwnerMessage",
			messageId: "m1",
			channel: "web",
			text: "Hello",
		});
		expect(ownerAnswerCommand({ questionId: "q1", text: "Yes" })).toEqual({
			type: "OwnerAnswer",
			questionId: "q1",
			text: "Yes",
		});
		expect(approvalDecisionCommand(request, "reject")).toEqual({
			type: "ApprovalDecision",
			approvalId: "a1",
			contentHash: "hash",
			decision: "reject",
		});
		expect(cancelTaskCommand({ taskId: "t1" })).toEqual({ type: "CancelTask", taskId: "t1" });
		expect(withCommandMeta(ownerAnswerCommand({ questionId: "q1", text: "Yes" }), { commandId: "c1", at })).toEqual({
			type: "OwnerAnswer",
			questionId: "q1",
			text: "Yes",
			commandId: "c1",
			at,
		});
		expect(OwnerMessageCommandSchema.safeParse({ commandId: "c1", at, type: "wrong" }).success).toBe(false);
		expect(
			OwnerAnswerCommandSchema.safeParse({
				commandId: "c1",
				at,
				type: "OwnerAnswer",
				questionId: "q1",
				text: "Yes",
				extra: 1,
			}).success,
		).toBe(false);
		expect(
			ApprovalDecisionCommandSchema.safeParse({
				commandId: "c1",
				at,
				type: "ApprovalDecision",
				approvalId: "a1",
				contentHash: "hash",
				decision: "maybe",
			}).success,
		).toBe(false);
		expect(
			CancelTaskCommandSchema.safeParse({ commandId: "c1", at, type: "CancelTask", taskId: "t1", extra: 1 }).success,
		).toBe(false);
	});
});
