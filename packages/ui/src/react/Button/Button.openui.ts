import { useFormName, useIsStreaming, useTriggerAction } from "@openuidev/react-lang";
import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Button } from "./Button.js";

function OpenUIButton({ props }: { props: z.infer<typeof buttonPropsSchema> }) {
	const triggerAction = useTriggerAction();
	const formName = useFormName();
	const isStreaming = useIsStreaming();
	const { label, action: actionPlan, disabled, ...buttonProps } = props;
	return createElement(
		Button,
		{
			...buttonProps,
			disabled: disabled || isStreaming,
			onClick: () => (actionPlan ? triggerAction(label, formName ?? "Button", actionPlan) : undefined),
		},
		label,
	);
}

const buttonPropsSchema = z.object({
	label: z.string().min(1).describe("Visible button label"),
	variant: z.enum(["solid", "soft", "outline", "ghost", "danger"]).default("solid"),
	size: z.enum(["sm", "md", "lg"]).default("md"),
	pill: z.boolean().default(false),
	disabled: z.boolean().default(false),
	action: z
		.object({ type: z.string(), params: z.record(z.string(), z.unknown()).optional() })
		.optional()
		.describe("Action emitted when the button is pressed"),
});

export const ButtonOpenUI = defineComponent({
	name: "Button",
	description: "An accessible button that runs an action.",
	props: buttonPropsSchema,
	component: OpenUIButton,
});

registerComponent(ButtonOpenUI);
