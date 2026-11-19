import { useIsStreaming, useTriggerAction } from "@openuidev/react-lang";
import { createElement, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { formatMillionths } from "../../schemas/platform.js";
import { Button } from "../Button/Button.js";
import { Card } from "../Card/Card.js";

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
		const [selected, setSelected] = useState<"approve" | "reject">();
		const title = props.actionLabels?.[props.action] ?? props.action;
		const copy =
			props.locale === "ar"
				? { approve: "موافقة", decline: "رفض", approved: "تمت الموافقة", declined: "تم الرفض", limit: "الحد" }
				: { approve: "Approve", decline: "Decline", approved: "Approved", declined: "Declined", limit: "Limit" };
		const labels = {
			approve: props.labels?.approve ?? copy.approve,
			decline: props.labels?.decline ?? copy.decline,
			approved: props.labels?.approved ?? copy.approved,
			declined: props.labels?.declined ?? copy.declined,
			limit: props.labels?.limit ?? copy.limit,
		};
		const action = (decision: "approve" | "reject") => ({
			type: "ApprovalDecision",
			params: { approvalId: props.approvalId, contentHash: props.contentHash, decision },
		});
		const choose = (decision: "approve" | "reject") => {
			setSelected(decision);
			triggerAction(decision === "approve" ? labels.approve : labels.decline, "ApprovalCard", action(decision));
		};
		const buttons = createElement(
			"div",
			{ className: "ts-approval-card__footer" },
			selected &&
				createElement(
					"span",
					{ className: "ts-approval-card__outcome", "data-decision": selected },
					selected === "approve" ? labels.approved : labels.declined,
				),
			createElement(
				Button,
				{ pill: true, size: "sm", disabled: streaming || selected !== undefined, onClick: () => choose("approve") },
				labels.approve,
			),
			createElement(
				Button,
				{
					pill: true,
					size: "sm",
					variant: "soft",
					disabled: streaming || selected !== undefined,
					onClick: () => choose("reject"),
				},
				labels.decline,
			),
		);
		const detail = [
			props.rule,
			props.limit !== undefined && props.limit !== null
				? `${labels.limit} ${formatMillionths(props.limit, props.locale)}`
				: undefined,
		]
			.filter(Boolean)
			.join(" · ");
		return createElement(
			Card,
			{ className: "ts-approval-card", variant: "inset", title },
			createElement("p", { className: "ts-approval-card__content" }, props.content),
			detail && createElement("p", { className: "ts-approval-card__limit" }, detail),
			buttons,
		);
	},
});

registerComponent(ApprovalCardOpenUI);
