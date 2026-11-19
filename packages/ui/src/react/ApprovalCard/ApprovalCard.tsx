import { useState } from "react";
import { AgentSlugSchema, type Locale } from "../../schemas/index.js";
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
	task: string;
};

export type ApprovalCardProps = {
	request: Pick<PlatformApprovalRequest, "approvalId" | "action" | "content" | "contentHash" | "rule" | "limit">;
	locale?: Locale;
	actionLabels?: Record<string, string>;
	labels?: Partial<ApprovalCardLabels>;
	disabled?: boolean;
	bot?: string;
	taskId?: string;
	decision?: "approve" | "reject";
	onDecision?: (command: ReturnType<typeof approvalDecisionCommand>) => void | boolean;
};

export function ApprovalCard({
	request,
	locale = "en",
	actionLabels = {},
	labels: labelOverrides,
	disabled = false,
	bot,
	taskId,
	decision,
	onDecision,
}: ApprovalCardProps) {
	const [localDecision, setLocalDecision] = useState<"approve" | "reject">();
	const selected = decision ?? localDecision;
	const agent = AgentSlugSchema.safeParse(bot);
	const choose = (next: "approve" | "reject") => {
		if (selected || disabled) return;
		if (onDecision?.(approvalDecisionCommand(request, next)) === false) return;
		setLocalDecision(next);
	};
	const defaults =
		locale === "ar"
			? {
					approve: "موافقة",
					decline: "رفض",
					approved: "تمت الموافقة",
					declined: "تم الرفض",
					limit: "الحد",
					task: "المهمة",
				}
			: {
					approve: "Approve",
					decline: "Decline",
					approved: "Approved",
					declined: "Declined",
					limit: "Limit",
					task: "Task",
				};
	const labels = { ...defaults, ...labelOverrides };
	return (
		<Card className="ts-approval-card" variant="inset" title={actionLabels[request.action] ?? request.action}>
			{(agent.success || taskId) && (
				<div className="ts-approval-card__meta">
					{agent.success && (
						<span className="ts-approval-card__agent">
							<Squadmate agent={agent.data} state="waiting" size={20} locale={locale} />
							{squadmateCharacterName(agent.data, locale)}
						</span>
					)}
					{taskId && (
						<span className="ts-approval-card__task">
							{labels.task}: <bdi>{taskId}</bdi>
						</span>
					)}
				</div>
			)}
			<p className="ts-approval-card__content">{request.content}</p>
			{(request.rule !== null || request.limit !== null) && (
				<p className="ts-approval-card__limit">
					{request.rule && <span>{request.rule}</span>}
					{request.limit !== null && (
						<span>
							{labels.limit} {formatMillionths(request.limit, locale)}
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
				<Button pill size="sm" disabled={disabled || selected !== undefined} onClick={() => choose("approve")}>
					{labels.approve}
				</Button>
				<Button pill size="sm" variant="soft" disabled={disabled || selected !== undefined} onClick={() => choose("reject")}>
					{labels.decline}
				</Button>
			</div>
		</Card>
	);
}
