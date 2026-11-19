import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { useTextField } from "../../openui/use-text-field.js";
import { Input } from "./Input.js";

export const InputOpenUI = defineComponent({
	name: "Input",
	description: "A named single-line text input.",
	props: z.object({
		label: z.string().min(1).describe("Accessible name for the input"),
		placeholder: z.string().optional(),
		value: z.string().optional(),
		variant: z.enum(["soft", "outline"]).default("soft"),
		disabled: z.boolean().default(false),
		readOnly: z.boolean().default(false),
		name: z.string().min(1).optional().describe("Form field name; defaults to the accessible label"),
	}),
	component: ({ props }) => {
		const { label, value, name = label, disabled, ...rest } = props;
		const field = useTextField(name, value ?? "", "Input");
		return createElement(Input, {
			...rest,
			name,
			value: field.value,
			onValueChange: field.onValueChange,
			disabled: disabled || field.isStreaming,
			"aria-label": label,
		});
	},
});

registerComponent(InputOpenUI);
