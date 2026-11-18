"use client";

import { createElement, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Switch, SwitchThumb } from "./Switch.js";

export const SwitchOpenUI = defineComponent({
	name: "Switch",
	description: "An accessible switch for turning a setting on or off.",
	props: z.object({
		label: z.string().min(1),
		checked: z.boolean().default(false),
		disabled: z.boolean().default(false),
	}),
	component: function StreamedSwitch({ props }) {
		const [userChecked, setUserChecked] = useState<boolean | null>(null);
		return createElement(
			"div",
			{ className: "ts-switch-field" },
			createElement("span", null, props.label),
			createElement(
				Switch,
				{
					checked: userChecked ?? props.checked ?? false,
					onCheckedChange: setUserChecked,
					disabled: props.disabled,
					"aria-label": props.label,
				},
				createElement(SwitchThumb),
			),
		);
	},
});
registerComponent(SwitchOpenUI);
