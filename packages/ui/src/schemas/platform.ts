import { z } from "zod/v4";

// Restated from tensquads-platform-amp at b09e197ae4578995d3c3d1a5be9330e1a7da600e.
const id = z.string().min(1);
const messageMeta = { seq: z.int().positive(), at: z.iso.datetime() };
const commandMeta = { commandId: id, at: z.iso.datetime() };

export const PlatformReplySchema = z
	.object({ ...messageMeta, type: z.literal("reply"), text: z.string().min(1) })
	.strict();
export const PlatformQuestionSchema = z
	.object({
		...messageMeta,
		type: z.literal("question"),
		questionId: id,
		text: z.string().min(1),
		options: z.array(z.string().min(1)),
	})
	.strict();
export const PlatformApprovalRequestSchema = z
	.object({
		...messageMeta,
		type: z.literal("approval_request"),
		approvalId: id,
		action: id,
		content: z.string().min(1),
		contentHash: id,
		rule: id.nullable(),
		limit: z.int().nonnegative().nullable(),
		amount: z.int().nonnegative().nullable(),
		bot: id,
		taskId: id,
	})
	.strict();
export const PlatformResultSchema = z
	.object({
		...messageMeta,
		type: z.literal("result"),
		taskId: id,
		summary: z.string().min(1),
		evidence: z.array(z.string().min(1)),
	})
	.strict();
export const PlatformStatusSchema = z
	.object({
		...messageMeta,
		type: z.literal("status"),
		taskId: id,
		bot: id,
		attempt: z.int().positive(),
		step: z.string().min(1),
		since: z.iso.datetime(),
	})
	.strict();
export const PlatformActionNotConfirmedSchema = z
	.object({
		...messageMeta,
		type: z.literal("action_not_confirmed"),
		taskId: id,
		actionId: id,
		what: z.string().min(1),
	})
	.strict();
export const PlatformApprovalDecidedSchema = z
	.object({
		...messageMeta,
		type: z.literal("approval_decided"),
		approvalId: id,
		decision: z.enum(["approve", "reject"]),
	})
	.strict();
export const PlatformQuestionAnsweredSchema = z
	.object({ ...messageMeta, type: z.literal("question_answered"), questionId: id })
	.strict();

export const PlatformOwnerMessageSchema = z.discriminatedUnion("type", [
	PlatformReplySchema,
	PlatformQuestionSchema,
	PlatformApprovalRequestSchema,
	PlatformResultSchema,
	PlatformStatusSchema,
	PlatformActionNotConfirmedSchema,
	PlatformApprovalDecidedSchema,
	PlatformQuestionAnsweredSchema,
]);
export type PlatformReply = z.infer<typeof PlatformReplySchema>;
export type PlatformQuestion = z.infer<typeof PlatformQuestionSchema>;
export type PlatformApprovalRequest = z.infer<typeof PlatformApprovalRequestSchema>;
export type PlatformResult = z.infer<typeof PlatformResultSchema>;
export type PlatformStatus = z.infer<typeof PlatformStatusSchema>;
export type PlatformActionNotConfirmed = z.infer<typeof PlatformActionNotConfirmedSchema>;
export type PlatformApprovalDecided = z.infer<typeof PlatformApprovalDecidedSchema>;
export type PlatformQuestionAnswered = z.infer<typeof PlatformQuestionAnsweredSchema>;
export type PlatformOwnerMessage = z.infer<typeof PlatformOwnerMessageSchema>;

export const PLATFORM_OWNER_MESSAGE_TYPES = [
	"reply",
	"question",
	"approval_request",
	"result",
	"status",
	"action_not_confirmed",
	"approval_decided",
	"question_answered",
] as const;

export const OwnerMessageCommandSchema = z
	.object({ ...commandMeta, type: z.literal("OwnerMessage"), messageId: id, channel: id, text: z.string().min(1) })
	.strict();
export const OwnerAnswerCommandSchema = z
	.object({ ...commandMeta, type: z.literal("OwnerAnswer"), questionId: id, text: z.string().min(1) })
	.strict();
export const ApprovalDecisionCommandSchema = z
	.object({
		...commandMeta,
		type: z.literal("ApprovalDecision"),
		approvalId: id,
		decision: z.enum(["approve", "reject"]),
		contentHash: id,
	})
	.strict();
export const CancelTaskCommandSchema = z.object({ ...commandMeta, type: z.literal("CancelTask"), taskId: id }).strict();
export const PlatformOwnerCommandSchema = z.discriminatedUnion("type", [
	OwnerMessageCommandSchema,
	OwnerAnswerCommandSchema,
	ApprovalDecisionCommandSchema,
	CancelTaskCommandSchema,
]);
export type PlatformOwnerMessageCommand = z.infer<typeof OwnerMessageCommandSchema>;
export type PlatformOwnerAnswerCommand = z.infer<typeof OwnerAnswerCommandSchema>;
export type PlatformApprovalDecisionCommand = z.infer<typeof ApprovalDecisionCommandSchema>;
export type PlatformCancelTaskCommand = z.infer<typeof CancelTaskCommandSchema>;
export type PlatformOwnerCommand = z.infer<typeof PlatformOwnerCommandSchema>;

export type OwnerMessageCommandBody = Omit<PlatformOwnerMessageCommand, "commandId" | "at">;
export type OwnerAnswerCommandBody = Omit<PlatformOwnerAnswerCommand, "commandId" | "at">;
export type ApprovalDecisionCommandBody = Omit<PlatformApprovalDecisionCommand, "commandId" | "at">;
export type CancelTaskCommandBody = Omit<PlatformCancelTaskCommand, "commandId" | "at">;
export type PlatformOwnerCommandBody =
	| OwnerMessageCommandBody
	| OwnerAnswerCommandBody
	| ApprovalDecisionCommandBody
	| CancelTaskCommandBody;

export function ownerMessageCommand(input: {
	messageId: string;
	channel: string;
	text: string;
}): OwnerMessageCommandBody {
	return OwnerMessageCommandSchema.omit({ commandId: true, at: true }).parse({ type: "OwnerMessage", ...input });
}
export function ownerAnswerCommand(input: { questionId: string; text: string }): OwnerAnswerCommandBody {
	return OwnerAnswerCommandSchema.omit({ commandId: true, at: true }).parse({ type: "OwnerAnswer", ...input });
}
export function approvalDecisionCommand(
	request: Pick<PlatformApprovalRequest, "approvalId" | "contentHash">,
	decision: "approve" | "reject",
): ApprovalDecisionCommandBody {
	return ApprovalDecisionCommandSchema.omit({ commandId: true, at: true }).parse({
		type: "ApprovalDecision",
		approvalId: request.approvalId,
		contentHash: request.contentHash,
		decision,
	});
}
export function cancelTaskCommand(input: { taskId: string }): CancelTaskCommandBody {
	return CancelTaskCommandSchema.omit({ commandId: true, at: true }).parse({ type: "CancelTask", ...input });
}
export function withCommandMeta(
	body: PlatformOwnerCommandBody,
	meta: { commandId: string; at: string },
): PlatformOwnerCommand {
	return PlatformOwnerCommandSchema.parse({ ...body, ...meta });
}

export function formatMillionths(value: number, locale: "en" | "ar"): string {
	if (!Number.isSafeInteger(value)) throw new TypeError("Millionths must be a safe integer");
	return new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-arab" : "en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value / 1_000_000);
}
