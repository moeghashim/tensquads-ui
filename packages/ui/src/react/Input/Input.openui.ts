import { createElement, useEffect, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
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
	}),
	component: ({ props }) => {
		const { label, ...inputProps } = props;
		const { value, ...rest } = inputProps;
		const [currentValue, setCurrentValue] = useState(value ?? "");
		useEffect(() => setCurrentValue(value ?? ""), [value]);
		return createElement(Input, {
			...rest,
			value: currentValue,
			onValueChange: setCurrentValue,
			"aria-label": label,
		});
	},
});

registerComponent(InputOpenUI);
