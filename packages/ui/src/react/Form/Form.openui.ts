import { FormNameContext, useIsStreaming, useRenderNode, useTriggerAction } from "@openuidev/react-lang";
import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Button } from "../Button/Button.js";
import { Form } from "./Form.js";

export const FormOpenUI = defineComponent({
	name: "Form",
	description:
		"A named form of text fields, switches, segmented controls, and optional action buttons. Submit sends their current values as a chat action.",
	props: z.object({
		name: z.string().min(1).describe("Unique form name within this OpenUI block"),
		children: z
			.array(z.unknown())
			.describe("Field and Input elements with distinct names, and optional Button actions"),
		submitLabel: z.string().min(1).describe("Visible submit label and readable action summary"),
		action: z.object({ type: z.string().min(1), params: z.record(z.string(), z.unknown()).optional() }),
		disabled: z.boolean().default(false),
	}),
	component: function OpenUIForm({ props }) {
		const renderNode = useRenderNode();
		const triggerAction = useTriggerAction();
		const isStreaming = useIsStreaming();
		const disabled = props.disabled || isStreaming;
		return createElement(
			FormNameContext.Provider,
			{ value: props.name },
			createElement(
				Form,
				{
					name: props.name,
					"aria-label": props.name,
					disabled,
					onSubmit: () => triggerAction(props.submitLabel, props.name, props.action),
				},
				renderNode(props.children),
				createElement(Button, { type: "submit", disabled }, props.submitLabel),
			),
		);
	},
});

registerComponent(FormOpenUI);
