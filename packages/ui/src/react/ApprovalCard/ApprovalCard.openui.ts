import { useIsStreaming, useTriggerAction } from "@openuidev/react-lang";
import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { ApprovalCard } from "./ApprovalCard.js";

const propsSchema = z.object({
	approvalId: z.string().min(1),
	action: z.string().min(1),
	content: z.string().min(1),
	contentHash: z.string().min(1),
	rule: z.string().nullable().optional(),
	limit: z.number().int().nonnegative().nullable().optional(),
	actionLabels: z.record(z.string(), z.string()).optional(),
	locale: z.enum(["en", "ar"]).default("en"),
	labels: z
		.object({
			approve: z.string().min(1).optional(),
			decline: z.string().min(1).optional(),
			approved: z.string().min(1).optional(),
			declined: z.string().min(1).optional(),
			limit: z.string().min(1).optional(),
			task: z.string().min(1).optional(),
		})
		.optional(),
});

export const ApprovalCardOpenUI = defineComponent({
	name: "ApprovalCard",
	description: "An approval request with approve and decline actions.",
	props: propsSchema,
	component: function OpenUIApprovalCard({ props }) {
		const triggerAction = useTriggerAction();
		const streaming = useIsStreaming();
		return createElement(ApprovalCard, {
			request: {
				approvalId: props.approvalId,
				action: props.action,
				content: props.content,
				contentHash: props.contentHash,
				rule: props.rule ?? null,
				limit: props.limit ?? null,
			},
			locale: props.locale,
			actionLabels: props.actionLabels,
			labels: props.labels,
			disabled: streaming,
			onDecision: ({ type, approvalId, contentHash, decision }) => {
				const label =
					decision === "approve"
						? props.labels?.approve ?? (props.locale === "ar" ? "موافقة" : "Approve")
						: props.labels?.decline ?? (props.locale === "ar" ? "رفض" : "Decline");
				triggerAction(label, "ApprovalCard", { type, params: { approvalId, contentHash, decision } });
				return false;
			},
		});
	},
});

registerComponent(ApprovalCardOpenUI);
