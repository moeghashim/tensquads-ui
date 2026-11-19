"use client";

import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { useFormValue } from "../../openui/use-form-value.js";
import { Switch, SwitchThumb } from "./Switch.js";

export const SwitchOpenUI = defineComponent({
	name: "Switch",
	description:
		"An accessible switch for turning a setting on or off. Inside a Form it submits its named boolean value.",
	props: z.object({
		label: z.string().min(1),
		checked: z.boolean().default(false),
		disabled: z.boolean().default(false),
		name: z.string().min(1).optional(),
	}),
	component: function StreamedSwitch({ props }) {
		const name = props.name ?? props.label;
		const field = useFormValue(name, props.checked ?? false, "Switch", true);
		const disabled = props.disabled || field.isStreaming;
		return createElement(
			"div",
			{ className: "ts-switch-field" },
			createElement("span", null, props.label),
			createElement(
				Switch,
				{
					name,
					checked: field.value,
					onCheckedChange: field.onValueChange,
					disabled,
					"aria-label": props.label,
				},
				createElement(SwitchThumb),
			),
		);
	},
});
registerComponent(SwitchOpenUI);
