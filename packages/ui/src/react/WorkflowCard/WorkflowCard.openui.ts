import { useIsStreaming } from "@openuidev/react-lang";
import { createElement, useContext } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { OpenUILocaleContext } from "../../openui/locale.js";
import { registerComponent } from "../../openui/registration-store.js";
import { WorkflowGraphSchema } from "../../schemas/workflow.js";
import { WorkflowCard } from "./WorkflowCard.js";

const stat = z.object({ label: z.string().min(1), value: z.string() });

const propsSchema = z.object({
	name: z.string().min(1),
	status: z.enum(["draft", "live"]),
	meta: z.string(),
	stats: z.tuple([stat, stat, stat]),
	graph: WorkflowGraphSchema,
});

export const WorkflowCardOpenUI = defineComponent({
	name: "WorkflowCard",
	description:
		"A workflow summary with a graph thumbnail and three stats in order: runs in the last seven days, grader pass rate, and last run.",
	props: propsSchema,
	component: function OpenUIWorkflowCard({ props }) {
		const locale = useContext(OpenUILocaleContext);
		const streaming = useIsStreaming();
		const parsed = propsSchema.safeParse(props);
		if (!parsed.success) {
			if (streaming) return null;
			throw parsed.error;
		}
		return createElement(WorkflowCard, { ...parsed.data, locale });
	},
});

registerComponent(WorkflowCardOpenUI);
