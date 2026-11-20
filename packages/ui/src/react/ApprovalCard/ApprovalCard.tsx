import { useState } from "react";
import { type AgentSlug, AgentSlugSchema, type Locale } from "../../schemas/index.js";
import type { PlatformApprovalRequest } from "../../schemas/platform.js";
import { approvalDecisionCommand, formatMillionths } from "../../schemas/platform.js";
import { Button } from "../Button/Button.js";
import { Card } from "../Card/Card.js";
import { Squadmate, squadmateCharacterName } from "../Squadmate/Squadmate.js";

export type ApprovalCardLabels = {
	approve: string;
	decline: string;
	approved: string;
	declined: string;
	limit: string;
	amount: string;
	task: string;
};

export type ApprovalCardProps = {
	request: Pick<
		PlatformApprovalRequest,
		"approvalId" | "action" | "content" | "contentHash" | "rule" | "limit" | "amount" | "bot" | "taskId"
	>;
	locale?: Locale;
	actionLabels?: Record<string, string>;
	ruleLabels?: Record<string, string>;
	labels?: Partial<ApprovalCardLabels>;
	disabled?: boolean;
	squadmates?: Readonly<Record<string, AgentSlug>>;
	decision?: "approve" | "reject";
	// biome-ignore lint/suspicious/noConfusingVoidType: Preserve support for async handlers that return no value or a boolean veto.
	onDecision?: (command: ReturnType<typeof approvalDecisionCommand>) => void | boolean | Promise<void | boolean>;
};

export function ApprovalCard({
	request,
	locale = "en",
	actionLabels = {},
	ruleLabels = {},
	labels: labelOverrides,
	disabled = false,
	squadmates,
	decision,
	onDecision,
}: ApprovalCardProps) {
	const [localDecision, setLocalDecision] = useState<"approve" | "reject">();
	const [pending, setPending] = useState(false);
	const selected = decision ?? localDecision;
	const agent = AgentSlugSchema.safeParse(
		squadmates && Object.hasOwn(squadmates, request.bot) ? squadmates[request.bot] : undefined,
	);
	const choose = async (next: "approve" | "reject") => {
		if (selected || disabled || pending) return;
		setPending(true);
		try {
			if ((await onDecision?.(approvalDecisionCommand(request, next))) !== false) setLocalDecision(next);
		} catch {
			return;
		} finally {
			setPending(false);
		}
	};
	const defaults =
		locale === "ar"
			? {
					approve: "موافقة",
					decline: "رفض",
					approved: "تمت الموافقة",
					declined: "تم الرفض",
					limit: "الحد",
					amount: "المبلغ",
					task: "المهمة",
				}
			: {
					approve: "Approve",
					decline: "Decline",
					approved: "Approved",
					declined: "Declined",
					limit: "Limit",
					amount: "Amount",
					task: "Task",
				};
	const labels = { ...defaults, ...labelOverrides };
	// A labelled rule names the limit, so it replaces the generic "Limit" word.
	const ruleLabel = request.rule === null ? undefined : ruleLabels[request.rule];
	return (
		<Card className="ts-approval-card" variant="inset" title={actionLabels[request.action] ?? request.action}>
			{agent.success || request.taskId ? (
				<div className="ts-approval-card__meta">
					{agent.success && (
						<span className="ts-approval-card__agent">
							<Squadmate agent={agent.data} state="waiting" size={20} locale={locale} />
							{squadmateCharacterName(agent.data, locale)}
						</span>
					)}
					{request.taskId && (
						<span className="ts-approval-card__task">
							{labels.task}: <bdi>{request.taskId}</bdi>
						</span>
					)}
				</div>
			) : null}
			<p className="ts-approval-card__content">{request.content}</p>
			{(request.amount !== null || ruleLabel !== undefined || request.limit !== null) && (
				<p className="ts-approval-card__limit">
					{request.amount !== null && (
						<span>
							<span>{labels.amount} </span>
							<strong className="ts-approval-card__amount">{formatMillionths(request.amount, locale)}</strong>
						</span>
					)}
					{(ruleLabel !== undefined || request.limit !== null) && (
						<span>
							{request.limit === null
								? ruleLabel
								: `${ruleLabel ?? labels.limit} ${formatMillionths(request.limit, locale)}`}
						</span>
					)}
				</p>
			)}
			<div className="ts-approval-card__footer">
				{selected && (
					<span className="ts-approval-card__outcome" data-decision={selected}>
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.7"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							{selected === "approve" ? <path d="m3 8 3 3 7-7" /> : <path d="m4 4 8 8m0-8-8 8" />}
						</svg>
						{selected === "approve" ? labels.approved : labels.declined}
					</span>
				)}
				<Button
					pill
					size="md"
					disabled={disabled || pending || selected !== undefined}
					onClick={() => choose("approve")}
				>
					{labels.approve}
				</Button>
				<Button
					pill
					size="md"
					variant="soft"
					disabled={disabled || pending || selected !== undefined}
					onClick={() => choose("reject")}
				>
					{labels.decline}
				</Button>
			</div>
		</Card>
	);
}
